import { demoOnly } from '@/domain/demo.ts'
import { MODES } from '@/domain/types.ts'
import { useStore } from '@/app/store.tsx'

export function DemoBar() {
  const store = useStore()
  if (!store.demo) return null
  return (
    <div className="mb-2 flex min-h-11 flex-nowrap items-center gap-1 overflow-x-auto rounded-[10px] bg-[#f0e8df] px-1.5 py-1 text-xs whitespace-nowrap text-muted" data-testid="sample-banner">
      {store.ownHome ? null : <span className="pl-1 font-bold text-accent-deep">サンプル</span>}
      <span className="pl-1">時間帯</span>
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          data-testid={`mode-${mode}`}
          className={
            mode === store.mode
              ? 'inline-flex min-h-11 items-center rounded-lg bg-ink px-2 text-xs text-white'
              : 'inline-flex min-h-11 items-center rounded-lg bg-white px-2 text-xs text-[#6b625a]'
          }
          onClick={() => store.setMode(mode)}
        >
          {mode}
        </button>
      ))}
      <button type="button" data-testid="demo-reset" className="inline-flex min-h-11 items-center rounded-lg bg-white px-2 text-xs text-[#6b625a]" onClick={store.reset}>
        最初から
      </button>
      {demoOnly || store.ownHome ? null : (
        <button type="button" data-testid="start-own" className="inline-flex min-h-11 items-center rounded-lg bg-accent-deep px-2 text-xs font-bold text-white" onClick={store.startOwnHome}>
          自分の家で始める
        </button>
      )}
    </div>
  )
}
