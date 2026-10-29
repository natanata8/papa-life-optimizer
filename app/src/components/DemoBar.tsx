import { useState } from 'react'
import { RoofMark } from '@/components/marks.tsx'
import { demoOnly } from '@/domain/demo.ts'
import { MODES } from '@/domain/types.ts'
import { useStore } from '@/app/store.tsx'

export function DemoBar({ title, meta, fold }: { title?: string; meta?: string; fold?: boolean }) {
  const store = useStore()
  const [open, setOpen] = useState(false)
  if (!store.demo && !title) return null
  return (
    <div className={`relative mb-2 flex min-h-11 items-center gap-2 ${fold ? '' : ''}`} data-fold={fold ? 'bar' : undefined}>
      <div className="flex min-w-0 items-center gap-2">
        <RoofMark size={28} className="shrink-0 text-accent" />
        {title ? <h1 className="min-w-0 text-lg font-extrabold">{title}</h1> : null}
      </div>
      <div className="ml-auto flex min-w-0 items-center gap-1">
        {store.demo && !store.ownHome ? <span className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-extrabold whitespace-nowrap text-white">サンプル</span> : null}
        {meta ? <span className="truncate text-xs whitespace-nowrap text-muted">{meta}</span> : null}
        {store.demo ? (
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-base font-bold"
            data-testid="demo-menu"
            aria-expanded={open}
            aria-label="メニュー"
            onClick={() => setOpen((value) => !value)}
          >
            ⋯
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="absolute top-12 right-0 z-20 w-56 rounded-lg border border-line bg-white p-2">
          <p className="px-2 py-1 text-xs font-bold text-muted">デモ設定</p>
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              data-testid={`mode-${mode}`}
              className={`flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm ${mode === store.mode ? 'bg-ink font-bold text-white' : ''}`}
              onClick={() => {
                store.setMode(mode)
                setOpen(false)
              }}
            >
              {mode}
            </button>
          ))}
          {demoOnly || store.ownHome ? null : (
            <button
              type="button"
              data-testid="start-own"
              className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-bold"
              onClick={() => {
                setOpen(false)
                store.startOwnHome()
              }}
            >
              自分の家で始める
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
