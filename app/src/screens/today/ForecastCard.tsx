import { useStore } from '@/app/store.tsx'
import { Button } from '@/components/ui/button.tsx'
import { forecastFor } from '@/domain/forecastView.ts'
import type { ForecastSlot } from '@/domain/forecast.ts'

export function ForecastCard() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const cast = forecastFor(data, store.today)
  const busy = cast.slots.filter((slot) => slot.sky !== '晴れ')
  const review = data.steps
    .filter((step) => step.date < store.today && !step.status)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <section className="mt-3 rounded-[14px] bg-white p-3 shadow-sm" data-testid="forecast-card">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">オウチ予報</h2>
        <span className="text-[11px] font-bold text-muted">予報</span>
      </div>
      {cast.quiet ? (
        <p className="mt-2 text-[15px] leading-snug font-bold" data-testid="forecast-quiet">
          {cast.line}
        </p>
      ) : (
        <>
          <div className="mt-2 grid grid-cols-4 gap-1.5" data-testid="forecast-strip">
            {cast.slots.map((slot) => (
              <SlotChip key={slot.id} slot={slot} />
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {busy.map((slot) => (
              <div key={slot.id} className="rounded-xl bg-rain px-3 py-2.5 text-rain-ink">
                <p className="text-[13px] leading-snug font-bold">
                  {slot.range} {slot.sky}: {slot.reason}
                </p>
                <button
                  type="button"
                  data-testid={`forecast-ask-${slot.id}`}
                  className="mt-1.5 inline-flex min-h-11 items-center text-left text-[13px] font-bold"
                  onClick={() => store.askForecast(slot.prompt)}
                >
                  傘 {slot.umbrella}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {review ? (
        <div id="forecast-review" className="mt-3 border-t border-line pt-3" data-testid="forecast-review">
          <p className="text-[11px] font-bold text-accent">昨日の夕方、晴れにできた？</p>
          <p className="mt-0.5 text-[15px] leading-snug font-bold">{review.title}</p>
          <div className="mt-2 flex w-full gap-2">
            <Button className="min-h-11 flex-1" variant="good" onClick={() => store.setReview(review.id, 'good')}>
              うまくいった
            </Button>
            <Button className="min-h-11 flex-1" variant="meh" onClick={() => store.setReview(review.id, 'meh')}>
              微妙
            </Button>
            <Button size="sm" variant="ghost" className="min-h-11" onClick={() => store.setTab('review')}>
              一覧
            </Button>
          </div>
        </div>
      ) : null}
      {cast.cleared > 0 ? <p className="mt-2 text-[12px] text-muted">これまでに晴れにした枠 {cast.cleared}</p> : null}
    </section>
  )
}

function SlotChip({ slot }: { slot: ForecastSlot }) {
  const store = useStore()
  const rainy = slot.sky !== '晴れ'
  const className = `flex min-h-11 flex-col items-center justify-center rounded-xl px-1 text-[11px] leading-tight font-bold ${
    rainy ? 'bg-rain text-rain-ink' : 'bg-sun text-accent-deep'
  }`
  if (!rainy) {
    return (
      <div className={className} data-testid={`forecast-slot-${slot.id}`}>
        <span>{slot.label}</span>
        <span>{slot.sky}</span>
      </div>
    )
  }
  return (
    <button type="button" data-testid={`forecast-slot-${slot.id}`} className={className} onClick={() => store.openSheet({ type: 'forecast', slotId: slot.id })}>
      <span>{slot.label}</span>
      <span>{slot.sky}</span>
    </button>
  )
}
