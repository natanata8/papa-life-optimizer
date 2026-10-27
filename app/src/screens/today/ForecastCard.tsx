import { useEffect, useState } from 'react'
import { useStore } from '@/app/store.tsx'
import { LevelBadge, SkyMark } from '@/components/SkyMark.tsx'
import { Button } from '@/components/ui/button.tsx'
import { logUsage } from '@/data/usage.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import type { ForecastSlot } from '@/domain/forecast.ts'

const INTRO_KEY = 'tone-app:forecast-intro'

export function ForecastCard() {
  const store = useStore()
  const data = store.data
  const [intro, setIntro] = useState(() => localStorage.getItem(INTRO_KEY) !== '1')
  useEffect(() => {
    logUsage('forecast_viewed')
  }, [])
  if (!data) return null
  const cast = forecastFor(data, store.today)
  const busy = cast.slots.filter((slot) => slot.sky !== '晴れ')
  const review = data.steps
    .filter((step) => step.date < store.today && !step.status)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <section className="mt-3 rounded-[14px] bg-white p-3 shadow-sm" data-testid="forecast-card">
      {intro ? (
        <div className="mb-2 flex items-start justify-between gap-2 rounded-xl bg-sun px-3 py-2" data-testid="forecast-intro">
          <p className="text-[13px] leading-relaxed">予報は採点じゃなくて、備えるためのもの。</p>
          <button
            type="button"
            className="inline-flex min-h-11 shrink-0 items-center px-2 text-[13px] font-bold text-accent-deep"
            data-testid="forecast-intro-dismiss"
            onClick={() => {
              localStorage.setItem(INTRO_KEY, '1')
              setIntro(false)
            }}
          >
            わかった
          </button>
        </div>
      ) : null}
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">オウチ予報</h2>
        <span className="text-[11px] font-bold text-muted">予報</span>
      </div>
      <p className={`mt-1 text-[15px] leading-snug font-bold ${cast.quiet ? '' : 'text-ink'}`} data-testid={cast.quiet ? 'forecast-quiet' : 'forecast-headline'}>
        {cast.headline}
      </p>
      {cast.quiet ? null : (
        <>
          <div className="mt-2 grid grid-cols-4 gap-1.5" data-testid="forecast-strip">
            {cast.slots.map((slot) => (
              <SlotChip key={slot.id} slot={slot} />
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {busy.map((slot) => (
              <SlotDetail key={slot.id} slot={slot} />
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

function SlotDetail({ slot }: { slot: ForecastSlot }) {
  const store = useStore()
  const alert = slot.sky === '注意報' || slot.sky === '警報' || slot.lifted
  const tone = slot.sky === '警報' ? 'bg-alert text-alert-ink' : slot.sky === '注意報' ? 'border-2 border-watch-ink bg-watch text-watch-ink' : 'bg-rain text-rain-ink'
  return (
    <div className={`rounded-xl px-3 py-2 ${slot.lifted ? 'bg-cloud text-cloud-ink' : tone}`} data-testid={`forecast-detail-${slot.id}`}>
      <div className="flex items-center gap-2">
        <SkyMark sky={slot.sky} lifted={slot.lifted} />
        {slot.lifted ? <LevelBadge sky={slot.sky} call={slot.call} lifted /> : slot.call ? <LevelBadge sky={slot.sky} call={slot.call} lifted={false} /> : <p className="text-[13px] font-bold">{slot.range} {slot.sky}</p>}
      </div>
      {slot.note ? <p className="mt-1 text-[12px] leading-relaxed">{slot.note}</p> : null}
      <p className="mt-0.5 text-[13px] leading-snug" data-testid={`forecast-why-${slot.id}`}>
        なぜ {slot.reason}
      </p>
      <button type="button" data-testid={`forecast-ask-${slot.id}`} className="mt-1 inline-flex min-h-11 items-center text-left text-[13px] font-bold" onClick={() => store.askForecast(slot.prompt)}>
        傘 {slot.umbrella}
      </button>
      {alert ? (
        <div className="mt-1 flex flex-wrap gap-2">
          <button type="button" data-testid={`forecast-consult-${slot.id}`} className="inline-flex min-h-11 items-center text-[13px] font-bold" onClick={() => store.askForecast(slot.prompt)}>
            予報士に相談
          </button>
          {slot.lifted ? null : (
            <button type="button" data-testid={`forecast-lift-${slot.id}`} className="inline-flex min-h-11 items-center text-[13px] font-bold" onClick={() => store.liftSlot(store.today, slot.id)}>
              解除
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

function SlotChip({ slot }: { slot: ForecastSlot }) {
  const store = useStore()
  const rainy = slot.sky !== '晴れ'
  const tone = slot.lifted
    ? 'bg-cloud text-cloud-ink'
    : slot.sky === '警報'
      ? 'bg-alert text-alert-ink'
      : slot.sky === '注意報'
        ? 'border-2 border-watch-ink bg-watch text-watch-ink'
        : slot.sky === 'くもり'
          ? 'bg-cloud text-cloud-ink'
          : rainy
            ? 'bg-rain text-rain-ink'
            : 'bg-sun text-accent-deep'
  const className = `flex min-h-11 flex-col items-center justify-center rounded-xl px-1 text-[11px] leading-tight font-bold ${tone}`
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
