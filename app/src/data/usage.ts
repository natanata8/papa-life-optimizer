import { createClient } from '@supabase/supabase-js'
import { usingSupabase } from '@/data/index.ts'

export const USAGE_NAMES = ['consult_started', 'forecast_viewed', 'umbrella_tapped', 'review_done'] as const

export type UsageName = (typeof USAGE_NAMES)[number]

const KEY = 'tone-app:usage'

export function logUsage(name: UsageName): void {
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || '[]') as { name: UsageName; at: string }[]
    const rows = Array.isArray(prev) ? prev : []
    localStorage.setItem(KEY, JSON.stringify([...rows, { name, at: new Date().toISOString() }].slice(-200)))
  } catch {
    // 件数の記録が失敗しても、画面は止めない。
  }
  void sendUsage(name)
}

async function sendUsage(name: UsageName): Promise<void> {
  if (!usingSupabase()) return
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return
  try {
    const client = createClient(url, key)
    const { data } = await client.auth.getSession()
    const userId = data.session?.user.id
    if (!userId) return
    await client.from('usage_events').insert({ user_id: userId, name })
  } catch {
    // ライブにはまだ表が無い。手元の記録だけ残す。
  }
}
