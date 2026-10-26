import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { STATIC_SYSTEM_PROMPT } from '../_shared/system-prompt.ts'
import { TONE_ANSWER_SCHEMA } from '../_shared/schema.ts'

/** src/domain/safety.ts の SAFETY_PATTERN と同じ語。 */
const SAFETY_PATTERN = /暴力|殴|叩か|蹴|怖い|脅/

const HOTLINE =
  '話してくれてありがとうございます。あなたや家族の安全がいちばん大事です。危険を感じる時は迷わず110番、DV相談ナビ #8008、子どもの安全は児童相談所 189 に相談してください。ここでは一手の提案はお休みします。'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type TaskHint = { id?: string; title?: string; why?: string; steps?: string[]; frequency?: string }

type ConsultBody = {
  consultationId?: string
  entry?: string
  scene?: string | null
  answers?: string[]
  userText?: string
  today?: string
  sceneDate?: string
  family?: Record<string, unknown>
  scheduleText?: string
  todayText?: string
  memory?: string[]
  events?: unknown[]
  taskHints?: TaskHint[]
  flags?: Record<string, unknown>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ message: 'POST だけ受けます。' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!supabaseUrl || !anonKey || !authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ message: 'ログインが必要です。' }, 401)
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user
  if (userError || !user) return json({ message: 'ログインが必要です。' }, 401)

  const body = (await req.json().catch(() => null)) as ConsultBody | null
  if (!body) return json({ message: '本文が読めませんでした。' }, 400)

  const text = `${body.entry ?? ''}\n${body.userText ?? ''}\n${(body.answers ?? []).join('\n')}`
  if (SAFETY_PATTERN.test(text)) {
    const answer = safetyAnswer()
    await record(supabase, user.id, body, answer, true)
    return json({ answer })
  }

  const cap = Number(Deno.env.get('CONSULT_DAILY_CAP') || '20')
  const start = tokyoMidnightIso()
  const { count, error: countError } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('safety_flag', false)
    .gte('created_at', start)
  if (countError) return json({ message: '回数を確認できませんでした。' }, 500)
  if ((count ?? 0) >= cap) {
    return json({ error: 'daily_cap', message: '今日の相談回数の上限に達しました。明日またどうぞ。' }, 429)
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) return json({ message: 'OPENAI_API_KEY が未設定です。' }, 500)

  const { data: member } = await supabase.from('family_members').select('family_id').eq('user_id', user.id).limit(1).maybeSingle()
  const familyId = (member as { family_id?: string } | null)?.family_id ?? null

  const hints = await taskContext(supabase, body.taskHints ?? [])
  const dynamic = JSON.stringify({
    today: body.today ?? null,
    sceneDate: body.sceneDate ?? null,
    scene: body.scene ?? null,
    entry: body.entry ?? '',
    answers: body.answers ?? [],
    family: sanitizeFamily(body.family ?? {}),
    schedule: body.scheduleText ?? '',
    todayText: body.todayText ?? '',
    memory: (body.memory ?? []).slice(0, 8),
    events: body.events ?? [],
    flags: body.flags ?? {},
    tasks: hints,
  })

  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4.1-mini'
  const ai = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_completion_tokens: 900,
      response_format: { type: 'json_schema', json_schema: TONE_ANSWER_SCHEMA },
      messages: [
        { role: 'system', content: STATIC_SYSTEM_PROMPT },
        { role: 'system', content: `次のJSONが、この家庭の事実です。気持ちは断定しないでください。\n${dynamic}` },
        { role: 'user', content: body.userText || body.entry || '相談です' },
      ],
    }),
  })
  if (!ai.ok) return json({ message: '答えを作れませんでした。しばらくしてからもう一度どうぞ。' }, 502)

  const payload = (await ai.json()) as { choices?: { message?: { content?: string } }[] }
  const content = payload.choices?.[0]?.message?.content
  if (!content) return json({ message: '答えが空でした。' }, 502)
  const answer = JSON.parse(content) as { safety_flag?: boolean }
  await record(supabase, user.id, body, answer, Boolean(answer.safety_flag), familyId)
  return json({ answer })
})

function safetyAnswer() {
  return {
    状況整理: HOTLINE,
    気づき: '',
    一手: [
      {
        タイトル: '安全の窓口に連絡する',
        なぜ今: '危険があるときは、家の段取りより先に安全です',
        種類: '今やる',
        タイミング: 'いま',
        タスク分解ステップ: ['110', 'DV相談ナビ #8008', '児童相談所 189'],
      },
    ],
    声かけ例: '',
    明日やること: '',
    questions: [],
    safety_flag: true,
  }
}

function sanitizeFamily(family: Record<string, unknown>) {
  const pstate = family.pstate
  return {
    ...family,
    pstate: pstate === '答えない' || pstate === '特になし' ? null : pstate ?? null,
  }
}

async function taskContext(
  supabase: ReturnType<typeof createClient>,
  hints: TaskHint[],
): Promise<{ id: string; title: string; frequency?: string; why?: string; steps?: string[] }[]> {
  const { data } = await supabase
    .from('tasks')
    .select('id,title,frequency,category,visibility')
    .eq('invisible', true)
    .limit(8)
  const fromDb = ((data ?? []) as { id: string; title: string; frequency: string }[]).map((row) => ({
    id: row.id,
    title: row.title,
    frequency: row.frequency,
  }))
  const merged = [
    ...hints.filter((hint) => hint.id && hint.title).map((hint) => ({
      id: hint.id as string,
      title: hint.title as string,
      frequency: hint.frequency,
      why: hint.why,
      steps: hint.steps,
    })),
    ...fromDb,
  ]
  const seen = new Set<string>()
  return merged.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  }).slice(0, 12)
}

async function record(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: ConsultBody,
  answer: unknown,
  safety: boolean,
  familyId?: string | null,
) {
  let fid = familyId
  if (!fid) {
    const { data } = await supabase.from('family_members').select('family_id').eq('user_id', userId).limit(1).maybeSingle()
    fid = (data as { family_id?: string } | null)?.family_id ?? null
  }
  if (!fid || !body.consultationId) return
  await supabase.from('consultations').upsert(
    {
      id: body.consultationId,
      family_id: fid,
      user_id: userId,
      scene: body.scene ?? '',
      entry: (body.entry ?? '').slice(0, 500),
      safety_flag: safety,
      answer,
    },
    { onConflict: 'id' },
  )
}

function tokyoMidnightIso(): string {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return new Date(`${day}T00:00:00+09:00`).toISOString()
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
