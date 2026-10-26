import { MODES } from '@/domain/types.ts'
import { useStore } from '@/app/store.tsx'

export function DemoBar() {
  const store = useStore()
  if (!store.demo) return null
  return (
    <div className="mb-2 flex items-center gap-1 overflow-x-auto rounded-[10px] bg-[#f0e8df] px-1.5 py-1 text-[10px] whitespace-nowrap text-muted">
      <span className="pl-1">デモ：時間帯</span>
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          data-testid={`mode-${mode}`}
          className={
            mode === store.mode
              ? 'rounded-lg bg-ink px-2 py-1 text-[11px] text-white'
              : 'rounded-lg bg-white px-2 py-1 text-[11px] text-[#6b625a]'
          }
          onClick={() => store.setMode(mode)}
        >
          {mode}
        </button>
      ))}
      <button
        type="button"
        data-testid="demo-reset"
        className="rounded-lg bg-white px-2 py-1 text-[11px] text-[#6b625a]"
        onClick={store.reset}
      >
        最初から
      </button>
    </div>
  )
}
