/** 明示が無ければ、Supabase 接続のときだけデモを切る。 */
export const demoMode = import.meta.env.VITE_DEMO_MODE
  ? import.meta.env.VITE_DEMO_MODE !== 'false'
  : import.meta.env.VITE_DATA !== 'supabase'
