import { createClient } from '@supabase/supabase-js'
import type { ToneAnswer } from '@/domain/types.ts'
import type { ConsultClient, ConsultRequest } from '@/ai/types.ts'
import { sampleAnswer } from '@/ai/sample.ts'

export function createSampleConsult(): ConsultClient {
  return {
    async consult(request: ConsultRequest) {
      return sampleAnswer(request)
    },
  }
}

export function createSupabaseConsult(url: string, anonKey: string): ConsultClient {
  const client = createClient(url, anonKey)
  return {
    async consult(request: ConsultRequest) {
      const { data, error } = await client.functions.invoke('consult', { body: request })
      if (error) {
        const context = (error as { context?: { json?: () => Promise<unknown> } }).context
        const payload = context?.json ? await context.json().catch(() => null) : null
        const body = payload as { error?: string; message?: string } | null
        if (body?.error === 'daily_cap') {
          throw new Error(body.message || '今日の相談回数の上限に達しました。明日またどうぞ。')
        }
        throw new Error(body?.message || error.message || '相談を送れませんでした。')
      }
      const payload = data as { answer?: ToneAnswer; error?: string; message?: string } | ToneAnswer | null
      if (payload && 'error' in payload && payload.error === 'daily_cap') {
        throw new Error(payload.message || '今日の相談回数の上限に達しました。明日またどうぞ。')
      }
      const answer = payload && 'answer' in payload ? payload.answer : (payload as ToneAnswer | null)
      if (!answer || !Array.isArray(answer.一手)) {
        throw new Error('答えの形式が確認できませんでした。')
      }
      return answer
    },
  }
}

export function createConsult(): { client: ConsultClient; sample: boolean } {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (import.meta.env.VITE_AI === 'supabase' && url && key) {
    return { client: createSupabaseConsult(url, key), sample: false }
  }
  return { client: createSampleConsult(), sample: true }
}
