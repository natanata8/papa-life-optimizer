import { createClient } from '@supabase/supabase-js'
import { asCategory, sampleExtract, type ExtractCandidate } from '@/domain/childEvents.ts'

export type ExtractResult = {
  candidates: ExtractCandidate[]
  sample: boolean
}

export async function extractSchedule(input: {
  jpegBase64: string
  today: string
  children: { id: string; name: string }[]
}): Promise<ExtractResult> {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (import.meta.env.VITE_AI !== 'supabase' || !url || !key) {
    return { candidates: sampleExtract(input.today, input.children), sample: true }
  }
  const client = createClient(url, key)
  const { data, error } = await client.functions.invoke('extract-schedule', {
    body: {
      image: input.jpegBase64,
      mime: 'image/jpeg',
      children: input.children.map((kid) => ({ id: kid.id, name: kid.name })),
    },
  })
  if (error) {
    const context = (error as { context?: { json?: () => Promise<unknown> } }).context
    const payload = context?.json ? await context.json().catch(() => null) : null
    const body = payload as { error?: string; message?: string } | null
    if (body?.error === 'daily_cap') throw new Error(body.message || '今日の読み取り回数の上限に達しました。明日またどうぞ。')
    throw new Error(body?.message || error.message || '読み取れませんでした。')
  }
  const payload = data as { error?: string; message?: string; candidates?: unknown[] } | null
  if (payload?.error === 'daily_cap') throw new Error(payload.message || '今日の読み取り回数の上限に達しました。明日またどうぞ。')
  if (!payload || !Array.isArray(payload.candidates)) throw new Error('読み取り結果の形式が確認できませんでした。')
  return {
    sample: false,
    candidates: payload.candidates.map((row) => normalizeCandidate(row)).filter((row) => row.title && row.date),
  }
}

function normalizeCandidate(row: unknown): ExtractCandidate {
  const item = (row ?? {}) as Partial<ExtractCandidate>
  const startTime = typeof item.startTime === 'string' ? item.startTime : ''
  return {
    title: typeof item.title === 'string' ? item.title : '',
    date: typeof item.date === 'string' ? item.date : '',
    startTime,
    endTime: typeof item.endTime === 'string' ? item.endTime : '',
    allDay: Boolean(item.allDay) || !startTime,
    category: asCategory(typeof item.category === 'string' ? item.category : ''),
    items: Array.isArray(item.items) ? item.items.filter((entry): entry is string => typeof entry === 'string') : [],
    deadline: Boolean(item.deadline),
    confidence: typeof item.confidence === 'number' ? item.confidence : 0,
    childGuess: typeof item.childGuess === 'string' ? item.childGuess : '',
    notes: typeof item.notes === 'string' ? item.notes : '',
  }
}
