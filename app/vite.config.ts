import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const demoOnly = env.VITE_DEMO_ONLY === 'true'
  const base = demoOnly ? '/papa-life-optimizer/' : env.VITE_BASE || '/'
  const src = fileURLToPath(new URL('./src', import.meta.url))

  return {
    base,
    define: demoOnly
      ? {
          'import.meta.env.VITE_DEMO_ONLY': JSON.stringify('true'),
          'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true'),
          'import.meta.env.VITE_DATA': JSON.stringify('local'),
          'import.meta.env.VITE_AI': JSON.stringify('sample'),
          'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(''),
          'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(''),
        }
      : undefined,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png'],
        manifest: {
          name: 'ハレゴト',
          short_name: 'ハレゴト',
          description: 'パパの家のことを、晴れごとに',
          lang: 'ja',
          dir: 'ltr',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#ffffff',
          theme_color: '#0052cc',
          start_url: '.',
          scope: '.',
          shortcuts: [{ name: '今夜の余白', short_name: '余白', url: '.', description: '今夜の余白を開く' }],
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: 'index.html',
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: [
        ...(demoOnly
          ? [{ find: '@supabase/supabase-js', replacement: fileURLToPath(new URL('./src/demo/no-remote.ts', import.meta.url)) }]
          : []),
        { find: '@', replacement: src },
      ],
    },
    server: {
      host: true,
      port: 5173,
    },
  }
})
