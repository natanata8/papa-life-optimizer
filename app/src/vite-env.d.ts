/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_BASE?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** `local` で localStorage に固定。未設定で URL と anon key があれば Supabase。 */
  readonly VITE_DATA?: string
  /** `supabase` のとき Edge Function を呼ぶ。それ以外はサンプル回答。 */
  readonly VITE_AI?: string
  /** `false` でデモの時間帯スイッチを隠す。 */
  readonly VITE_DEMO_MODE?: string
  /** `true` で公開デモ。サンプル家族だけで開き、外部へは繋がない。 */
  readonly VITE_DEMO_ONLY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
