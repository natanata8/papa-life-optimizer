import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { careHint, niceSummary, upcomingNice } from '@/domain/nice.ts'
import { copyText } from '@/lib/utils.ts'

export function NiceEvents() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const items = upcomingNice(data.niceEvents, store.today)

  return (
    <section className="mt-3" data-testid="today-events">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">イベント</h3>
        <Button size="sm" variant="ghost" data-testid="add-nice" onClick={() => store.openSheet({ type: 'addNice' })}>
          入れる
        </Button>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">誕生日や記念日、美容院・ネイルなど、帰ってから一言触れておきたい日。</p>
      {items.length === 0 ? (
        <p className="mt-2 rounded-xl bg-white px-3 py-3 text-[13px] text-muted">今日から7日以内のものはありません。</p>
      ) : (
        <div className="mt-2 space-y-2">
          {items.map((event) => {
            const hint = careHint(event, store.today)
            return (
              <article key={event.id} className="rounded-[14px] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-bold">{event.title}</p>
                  <button type="button" className="shrink-0 text-[12px] text-muted" onClick={() => store.removeNice(event.id)}>
                    消す
                  </button>
                </div>
                <p className="mt-0.5 text-[12px] text-muted">{niceSummary(event, store.today)}</p>
                {event.note ? <p className="mt-1 text-[13px] leading-relaxed">{event.note}</p> : null}
                {hint ? (
                  <div className="mt-2 rounded-xl border border-[#f3d9c6] bg-[#fff7ef] px-3 py-2">
                    <p className="text-[13px] leading-relaxed">{hint.hint}</p>
                    <p className="mt-1 text-[13px] leading-relaxed">「{hint.line}」</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1.5"
                      onClick={() => {
                        void copyText(hint.line).then((ok) => store.showToast(ok ? 'コピーしました' : 'コピーできませんでした'))
                      }}
                    >
                      声かけをコピー
                    </Button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
