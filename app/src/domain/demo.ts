/** 公開デモ。ログインも、Supabase も、OpenAI も使わない。 */
export const demoOnly = import.meta.env.VITE_DEMO_ONLY === 'true'

/** 明示が無ければ、Supabase 接続のときだけデモを切る。 */
export const demoMode =
  demoOnly ||
  (import.meta.env.VITE_DEMO_MODE ? import.meta.env.VITE_DEMO_MODE !== 'false' : import.meta.env.VITE_DATA !== 'supabase')
