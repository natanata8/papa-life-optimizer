import { createClient } from '@supabase/supabase-js'
import { demoOnly } from '@/domain/demo.ts'
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
      let data: unknown
      let error: { message?: string; context?: Response } | null
      try {
        const result = await client.functions.invoke('consult', { body: request })
        data = result.data
        error = result.error
      } catch {
        throw new Error('通信できませんでした。電波の良い所でもう一度どうぞ。')
      }
      if (error) {
        const status = error.context?.status
        const payload = error.context ? await error.context.json().catch(() => null) : null
        const body = payload as { error?: string; message?: string } | null
        if (!body) throw new Error('通信できませんでした。電波の良い所でもう一度どうぞ。')
        if (body.error === 'daily_cap') throw new Error(body.message || '今日の相談回数の上限に達しました。明日またどうぞ。')
        if (body.error === 'no_key' || (typeof status === 'number' && status >= 500)) {
          throw new Error('ただいま相談を受け付けられません。少し時間をおいてお試しください。')
        }
        throw new Error(body.message || '相談を送れませんでした。')
      }
      const payload = data as { answer?: ToneAnswer; error?: string; message?: string } | ToneAnswer | null
      if (!payload) throw new Error('通信できませんでした。電波の良い所でもう一度どうぞ。')
      if ('error' in payload && payload.error === 'daily_cap') {
        throw new Error(payload.message || '今日の相談回数の上限に達しました。明日またどうぞ。')
      }
      if ('error' in payload && (payload.error === 'no_key' || payload.error === 'ai_failed')) {
        throw new Error('ただいま相談を受け付けられません。少し時間をおいてお試しください。')
      }
      const answer = payload && 'answer' in payload ? payload.answer : (payload as ToneAnswer | null)
      if (!answer || !Array.isArray(answer.一手)) {
        throw new Error('通信できませんでした。電波の良い所でもう一度どうぞ。')
      }
      return answer
    },
  }
}

export function createConsult(): { client: ConsultClient; sample: boolean } {
  if (demoOnly) return { client: createSampleConsult(), sample: true }
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (import.meta.env.VITE_AI === 'supabase' && url && key) {
    return { client: createSupabaseConsult(url, key), sample: false }
  }
  return { client: createSampleConsult(), sample: true }
}
