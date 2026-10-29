import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'

export function ToastBar({ className = '' }: { className?: string }) {
  const store = useStore()
  if (!store.toast) return null
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-ink px-4 py-2 text-xs text-white ${className}`} data-testid="toast">
      <p className="min-w-0 flex-1">
        <Phrase text={store.toast} />
      </p>
      {store.toastUndo ? (
        <button
          type="button"
          data-testid="toast-undo"
          className="inline-flex min-h-11 items-center font-bold whitespace-nowrap"
          onClick={() => {
            store.toastUndo?.()
            store.dismissToast()
          }}
        >
          元に戻す
        </button>
      ) : null}
    </div>
  )
}
