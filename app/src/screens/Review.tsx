import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { dayName, formatMd } from '@/domain/dates.ts'

export function Review() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const pending = data.steps.filter((step) => step.date < store.today && !step.status).sort((a, b) => b.date.localeCompare(a.date))
  const done = data.steps.filter((step) => step.status).slice(-5).reverse()

  return (
    <div className="px-3.5 pt-3.5 pb-28" data-testid="review">
      <DemoBar />
      <h1 className="text-lg font-bold">ふりかえり</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">2タップで終わります。結果は、次の提案を変えるためだけに使います。</p>
      <h2 className="mt-4 text-sm font-bold">昨日までの一手</h2>
      {pending.length === 0 ? (
        <p className="mt-2 rounded-xl bg-white px-3 py-3 text-[13px] text-muted">ふりかえり待ちの一手はありません</p>
      ) : (
        <div className="mt-2 space-y-2">
          {pending.map((step) => (
            <article key={step.id} className="rounded-[14px] bg-white p-3 shadow-sm">
              <p className="text-[11px] text-muted">
                {dayName(step.date, store.today)}
                {step.time ? ` ${step.time}` : ''}・{step.scene || step.source}
              </p>
              <p className="mt-0.5 text-[15px] font-bold">{step.title}</p>
              <div className="mt-2 flex gap-2">
                <Button className="flex-1" variant="good" data-testid={`review-good-${step.id}`} onClick={() => store.setReview(step.id, 'good')}>
                  😊 うまくいった
                </Button>
                <Button className="flex-1" variant="meh" data-testid={`review-meh-${step.id}`} onClick={() => store.setReview(step.id, 'meh')}>
                  😐 微妙
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {done.length > 0 ? (
        <>
          <h2 className="mt-4 text-sm font-bold">記録した一手</h2>
          <div className="mt-2 space-y-1">
            {done.map((step) => (
              <button
                key={step.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg bg-step px-2.5 py-2 text-left text-[13px] text-step-ink"
                onClick={() => store.openSheet({ type: 'step', id: step.id })}
              >
                <span>{step.status === 'good' ? '😊' : '😐'}</span>
                <span>
                  {step.title}
                  {step.reason ? `（${step.reason}）` : ''}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      <h2 className="mt-4 text-sm font-bold">これまでの相談</h2>
      {data.threads.length === 0 ? (
        <p className="mt-2 text-[13px] text-muted">まだありません。新しい相談を始めても、ここから前の相談を開けます。</p>
      ) : (
        <div className="mt-2 space-y-2" data-testid="consult-history">
          {data.threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              className="block min-h-11 w-full rounded-xl bg-white px-3 py-2 text-left"
              data-testid={`thread-${thread.id}`}
              onClick={() => store.openThread(thread.id)}
            >
              <span className="block text-[11px] text-muted">{formatMd(thread.at)}</span>
              <span className="mt-0.5 block text-[14px] font-bold">{thread.title}</span>
              {thread.preview ? <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">{thread.preview}</span> : null}
            </button>
          ))}
        </div>
      )}
      <h2 className="mt-4 text-sm font-bold">ハレゴトが覚えていること</h2>
      {data.memories.length === 0 ? (
        <p className="mt-2 text-[13px] text-muted">まだありません。一手のあと、2タップするとここに残ります。</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.memories.slice(0, 4).map((memory) => (
            <p key={memory.id} className="rounded-xl bg-white px-3 py-2 text-[13px] leading-relaxed">
              <span className="text-muted">{formatMd(memory.date)}</span>
              <br />
              {memory.text}
            </p>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted">点数や回数の比べっこはしません</p>
    </div>
  )
}
