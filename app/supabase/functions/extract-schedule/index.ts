import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

/**
 * お便り・予定表・予約票・LINE画面の画像から、子どもの予定候補を返す。
 * 画像はメモリ上だけで扱い、Storage にもログにも残さない。保存はクライアントの確認後。
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const CATEGORIES = ['行事', '持ち物', '提出物', '通院・健診', '習い事', 'お休み', 'その他'] as const

const EXTRACT_SCHEMA = {
  name: 'child_schedule',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['candidates'],
    properties: {
      candidates: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'date', 'startTime', 'endTime', 'allDay', 'category', 'items', 'deadline', 'confidence', 'childGuess', 'notes'],
          properties: {
            title: { type: 'string' },
            date: { type: 'string' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            allDay: { type: 'boolean' },
            category: { type: 'string', enum: [...CATEGORIES] },
            items: { type: 'array', items: { type: 'string' } },
            deadline: { type: 'boolean' },
            confidence: { type: 'number' },
            childGuess: { type: 'string' },
            notes: { type: 'string' },
          },
        },
      },
    },
  },
}

type ChildHint = { id?: string; name?: string }

type Body = {
  image?: string
  mime?: string
  children?: ChildHint[]
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
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const admin = serviceKey ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } }) : null
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user
  if (userError || !user) return json({ message: 'ログインが必要です。' }, 401)

  const body = (await req.json().catch(() => null)) as Body | null
  const image = body?.image?.replace(/^data:image\/jpeg;base64,/, '') ?? ''
  if (!image) return json({ message: '画像がありません。' }, 400)
  if (image.length > 2_000_000) return json({ message: '画像が大きすぎます。もう一度、小さめに撮り直してください。' }, 400)

  if (!admin) return json({ message: 'SUPABASE_SERVICE_ROLE_KEY がありません。' }, 500)
  const cap = Number(Deno.env.get('EXTRACT_DAILY_CAP') || '10')
  const start = tokyoMidnightIso()
  const { count, error: countError } = await admin
    .from('consult_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'extract:ok')
    .gte('created_at', start)
  if (countError) return json({ message: '回数を確認できませんでした。' }, 500)
  if ((count ?? 0) >= cap) {
    return json({ error: 'daily_cap', message: '今日の読み取り回数の上限に達しました。明日またどうぞ。' }, 429)
  }

  const apiKey = await openaiKey(admin)
  if (!apiKey) return json({ error: 'no_key', message: 'OPENAI_API_KEY が未設定です。' }, 500)

  const today = tokyoToday()
  const names = (body?.children ?? []).map((kid) => kid.name?.trim()).filter((name): name is string => Boolean(name))
  const prompt = [
    `今日は ${today}（Asia/Tokyo）です。`,
    '画像は、保育園・学校のお便り、行事予定表、プリント、病院の予約票、LINEの画面のどれかです。',
    '読めた予定だけを候補にしてください。画像に無い予定は作らない。',
    '日付は YYYY-MM-DD。年が無ければ、今日以降で一番近い日。今日・明日・明後日も YYYY-MM-DD にする。',
    '時刻が無ければ startTime と endTime は空文字、allDay は true。時刻は HH:MM。',
    `category は ${CATEGORIES.join('、')} のいずれか。`,
    'items は持っていく物だけ。提出や支払いの期限なら deadline を true。',
    `childGuess は次の呼び名から一番近いものを入れる。分からなければ空文字: ${names.join('、') || '（なし）'}`,
    'confidence は 0 から 1。notes は画像に書いてある補足だけ。',
  ].join('\n')

  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-6-luna'
  const ai = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: 1200,
      response_format: { type: 'json_schema', json_schema: EXTRACT_SCHEMA },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}`, detail: 'low' } },
          ],
        },
      ],
    }),
  })
  if (!ai.ok) {
    const err = (await ai.json().catch(() => null)) as { error?: { code?: string; type?: string } } | null
    const detail = err?.error?.code || err?.error?.type || `http_${ai.status}`
    console.error('extract openai failed', detail)
    await logUsage(admin, { user_id: user.id, status: `extract:error:${detail}`.slice(0, 80), model })
    return json({ error: 'ai_failed', message: '読み取れませんでした。しばらくしてからもう一度どうぞ。' }, 502)
  }

  const payload = (await ai.json()) as {
    choices?: { message?: { content?: string } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } }
  }
  const usage = {
    prompt_tokens: payload.usage?.prompt_tokens ?? null,
    cached_tokens: payload.usage?.prompt_tokens_details?.cached_tokens ?? null,
    completion_tokens: payload.usage?.completion_tokens ?? null,
  }
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    await logUsage(admin, { user_id: user.id, status: 'extract:error:empty', model })
    return json({ error: 'ai_failed', message: '読み取り結果が空でした。' }, 502)
  }
  let parsed: { candidates?: RawCandidate[] }
  try {
    parsed = JSON.parse(content) as { candidates?: RawCandidate[] }
  } catch {
    await logUsage(admin, { user_id: user.id, status: 'extract:error:parse', model })
    return json({ error: 'ai_failed', message: '読み取り結果の形式が読めませんでした。' }, 502)
  }

  const candidates = (parsed.candidates ?? [])
    .slice(0, 12)
    .map((row) => normalize(row, today))
    .filter((row) => row.title && row.date)
  await logUsage(admin, { user_id: user.id, status: 'extract:ok', model, ...usage })
  return json({ candidates, meta: { model, usage, today } })
})

type RawCandidate = {
  title?: string
  date?: string
  startTime?: string
  endTime?: string
  allDay?: boolean
  category?: string
  items?: string[]
  deadline?: boolean
  confidence?: number
  childGuess?: string
  notes?: string
}

function normalize(row: RawCandidate, today: string) {
  const date = resolveDate(row.date ?? '', today)
  const startTime = clock(row.startTime ?? '')
  const endTime = clock(row.endTime ?? '')
  const items = (row.items ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 8)
  const category = CATEGORIES.find((item) => item === row.category) ?? 'その他'
  let confidence = typeof row.confidence === 'number' ? row.confidence : 0
  if (confidence > 1) confidence = confidence / 100
  confidence = Math.max(0, Math.min(1, confidence))
  return {
    title: (row.title ?? '').trim().slice(0, 80),
    date: date ?? '',
    startTime,
    endTime,
    allDay: Boolean(row.allDay) || !startTime,
    category,
    items,
    deadline: Boolean(row.deadline),
    confidence,
    childGuess: (row.childGuess ?? '').trim().slice(0, 40),
    notes: (row.notes ?? '').trim().slice(0, 120),
  }
}

function resolveDate(raw: string, today: string): string | null {
  const text = raw.trim()
  if (!text) return null
  if (text === '今日') return today
  if (text === '明日') return addDays(today, 1)
  if (text === '明後日') return addDays(today, 2)
  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (iso) return rollForward(Number(iso[1]), Number(iso[2]), Number(iso[3]), today)
  const md = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/) ?? text.match(/^(\d{1,2})[/-](\d{1,2})$/)
  if (!md) return null
  const year = Number(today.slice(0, 4))
  let ymd = isoDate(year, Number(md[1]), Number(md[2]))
  if (ymd && ymd < today) ymd = isoDate(year + 1, Number(md[1]), Number(md[2]))
  return ymd
}

function rollForward(year: number, month: number, day: number, today: string): string | null {
  const ymd = isoDate(year, month, day)
  if (!ymd) return null
  if (ymd >= addDays(today, -30)) return ymd
  const thisYear = Number(today.slice(0, 4))
  const rolled = isoDate(thisYear, month, day)
  if (rolled && rolled >= addDays(today, -1)) return rolled
  return isoDate(thisYear + 1, month, day)
}

function isoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function addDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${date.getUTCFullYear()}-${mm}-${dd}`
}

function clock(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return ''
  return `${String(hour).padStart(2, '0')}:${match[2]}`
}

function tokyoToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function tokyoMidnightIso(): string {
  return new Date(`${tokyoToday()}T00:00:00+09:00`).toISOString()
}

let cachedKey: string | null = null

async function openaiKey(admin: ReturnType<typeof createClient> | null): Promise<string | null> {
  const fromEnv = Deno.env.get('OPENAI_API_KEY')
  if (fromEnv) return fromEnv
  if (cachedKey) return cachedKey
  if (!admin) return null
  const { data, error } = await admin.rpc('consult_openai_key')
  if (error) {
    console.error('vault key lookup failed', error.message)
    return null
  }
  cachedKey = typeof data === 'string' && data.length > 0 ? data : null
  return cachedKey
}

async function logUsage(
  admin: ReturnType<typeof createClient>,
  row: {
    user_id: string
    status: string
    model?: string
    prompt_tokens?: number | null
    cached_tokens?: number | null
    completion_tokens?: number | null
  },
) {
  const { error } = await admin.from('consult_usage').insert({ safety: false, ...row })
  if (error) console.error('usage log failed', error.message)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
