import { useEffect, useState } from 'react'
import { useStore } from '@/app/store.tsx'
import { LevelBadge, SkyMark } from '@/components/SkyMark.tsx'
import { Button } from '@/components/ui/button.tsx'
import { logUsage } from '@/data/usage.ts'
import { addDays, formatMd } from '@/domain/dates.ts'
import { lineShareUrl } from '@/domain/export.ts'
import { marginAfter, marginLine, sendLine } from '@/domain/freed.ts'
import { slotClock, type Forecast, type ForecastSlot } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { returnInfo } from '@/domain/profile.ts'

const INTRO_KEY = 'tone-app:forecast-intro'

export function ForecastCard() {
  const store = useStore()
  const data = store.data
  const [intro, setIntro] = useState(() => localStorage.getItem(INTRO_KEY) !== '1')
  const [showLine, setShowLine] = useState(false)
  useEffect(() => {
    logUsage('forecast_viewed')
  }, [])
  if (!data) return null
  const cast = forecastFor(data, store.today)
  const tomorrow = forecastFor(data, addDays(store.today, 1), store.today)
  const tomorrowEvent = data.events.find((event) => event.date === addDays(store.today, 1))
  const peak = cast.slots.find((slot) => slot.id === cast.peak) ?? null
  const back = returnInfo(data.profile.home)?.back ?? null
  const review = data.steps
    .filter((step) => step.date < store.today && !step.status)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <section className="mt-3" data-testid="forecast-card">
      {intro ? (
        <div className="mb-2 flex items-start justify-between gap-2 rounded-xl bg-sun px-3 py-2" data-testid="forecast-intro">
          <p className="text-sm leading-relaxed">予報は採点じゃなくて、備えるためのもの。</p>
          <button
            type="button"
            className="inline-flex min-h-11 shrink-0 items-center px-2 text-sm font-bold text-accent-deep"
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
      {cast.quiet || !peak ? (
        <Quiet tomorrow={tomorrow} tomorrowTitle={tomorrowEvent?.title ?? ''} back={back} date={addDays(store.today, 1)} />
      ) : (
        <Busy peak={peak} cast={cast} back={back} showLine={showLine} onToggleLine={() => setShowLine((value) => !value)} />
      )}
      {peak && !cast.quiet ? (
        <>
          <SlotStrip cast={cast} peakId={peak.id} />
          <PeakLine slot={peak} />
        </>
      ) : null}
      {review ? (
        <div id="forecast-review" className="mt-4" data-testid="forecast-review">
          <p className="text-sm font-bold">昨日の一手、どうだった？</p>
          <p className="mt-1 text-sm leading-snug">{review.title}</p>
          <div className="mt-2 flex w-full gap-2">
            <Button className="min-h-11 flex-1" variant="good" onClick={() => store.setReview(review.id, 'good')}>
              よかった
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
    </section>
  )
}

function Busy({
  peak,
  cast,
  back,
  showLine,
  onToggleLine,
}: {
  peak: ForecastSlot
  cast: Forecast
  back: string | null
  showLine: boolean
  onToggleLine: () => void
}) {
  const store = useStore()
  const clock = slotClock(peak)
  const when = peak.id === '朝' ? '今朝' : peak.id === '夜' ? '今夜' : peak.id === '夕方' ? '夕方' : '今日'
  const glance = peak.lifted ? `晴れのちくもり（${peak.call || peak.sky}は解除）` : glanceLine(cast)
  const line = sendLine(peak.noun)
  return (
    <div>
      {peak.call ? (
        <div
          className={`flex items-center gap-2 rounded-xl border-l-[6px] px-3 py-2 text-sm leading-snug ${
            peak.lifted ? 'border-lift-ink bg-lift text-lift-ink' : peak.sky === '警報' ? 'border-alert-line bg-alert text-alert-ink' : 'border-watch-line bg-watch text-watch-ink'
          }`}
        >
          <LevelBadge sky={peak.lifted ? '注意報' : peak.sky} call={peak.lifted ? '解除' : peak.sky} lifted={peak.lifted} />
          <p className="break-keep font-bold">{peak.lifted ? `${peak.call}は解除。この調子で大丈夫` : `${peak.call} ${clock}。備えておけば大丈夫`}</p>
        </div>
      ) : null}
      <div className="mt-3 flex items-center gap-2">
        <SkyMark sky={peak.lifted ? 'くもり' : peak.sky} size={44} lifted={false} />
        <p className="text-sm leading-snug" data-testid="forecast-headline">
          {glance}
        </p>
      </div>
      <h1 className="mt-2 break-keep text-[26px] leading-snug font-bold">
        {peak.lifted ? `${when}の山場、ひとつ減りました` : `${when}は ${clock}が山場`}
      </h1>
      <h2 className="mt-1 break-keep text-[17px] leading-snug font-bold">
        {peak.lifted ? marginAfter(peak.noun, peak.freedMin) : marginLine(peak.noun, peak.freedMin)}
      </h2>
      <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
        {back ? <span>帰宅の目安 {back}</span> : null}
        <span>{peak.lifted ? `余白 ${cast.freeFrom ? `${cast.freeFrom}以降` : 'このあと'}` : `山場 ${clock}`}</span>
      </p>
      <article className={`mt-3 rounded-[14px] px-3 py-3 shadow-sm ${peak.lifted ? 'bg-margin-wash' : 'bg-white'}`}>
        <p className="text-sm font-bold text-margin">{peak.lifted ? '引き受けました' : '今日の一手（これだけでOK）'}</p>
        <p className="mt-1 break-keep text-[20px] leading-snug font-bold">{when}の{peak.noun}は自分がやる</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center gap-1 font-bold">
            {peak.lifted ? (
              <>
                <SkyMark sky="くもり" size={26} />
                くもり
              </>
            ) : (
              <>
                <SkyMark sky={peak.sky} size={26} />
                {peak.sky}
                <span aria-hidden="true">→</span>
                <SkyMark sky="くもり" size={26} />
                くもり
              </>
            )}
          </span>
          <span className="text-right font-bold text-margin">
            {peak.lifted ? 'うまれた余白（目安）' : '余白（目安）'}
            <span className="block text-[20px]">+{peak.freedMin}分</span>
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed" data-testid={`forecast-why-${peak.id}`}>
          なぜ {peak.reason.split('／')[0]}
        </p>
        {peak.lifted || showLine ? <p className="mt-2 text-sm leading-relaxed">送る文：「{line}」</p> : null}
        {peak.lifted ? (
          <>
            <a className="mt-3 flex min-h-[52px] items-center justify-center rounded-xl bg-margin text-[15px] font-bold text-white no-underline" href={lineShareUrl(line)}>
              LINEで送る
            </a>
            <button type="button" className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-margin" onClick={() => store.dropLift(store.today, peak.id)}>
              取り消す
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              data-testid={`forecast-lift-${peak.id}`}
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent-deep text-[15px] font-bold text-white"
              onClick={() => store.liftSlot(store.today, peak.id)}
            >
              引き受ける
            </button>
            <button type="button" className="mt-1 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-accent-deep" onClick={onToggleLine}>
              先に送る文を見る
            </button>
            {peak.call ? (
              <button
                type="button"
                data-testid={`forecast-ask-${peak.id}`}
                className="inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-margin"
                onClick={() => store.askForecast(peak.prompt)}
              >
                予報士に相談
              </button>
            ) : null}
          </>
        )}
      </article>
    </div>
  )
}

function Quiet({
  tomorrow,
  tomorrowTitle,
  back,
  date,
}: {
  tomorrow: Forecast
  tomorrowTitle: string
  back: string | null
  date: string
}) {
  const tomorrowPeak = tomorrow.slots.find((slot) => slot.id === tomorrow.peak)
  return (
    <div data-testid="forecast-quiet">
      <div className="flex items-center gap-2">
        <SkyMark sky="晴れ" size={44} />
        <p className="text-sm">一日晴れ</p>
      </div>
      <h1 className="mt-2 break-keep text-[26px] leading-snug font-bold">今日は晴れ。余白はそのまま使おう</h1>
      <h2 className="mt-1 text-[17px] leading-snug font-bold">重なる家のことはありません。</h2>
      {back ? <p className="mt-1 text-sm text-muted">帰宅の目安 {back}</p> : null}
      <div className="mt-4">
        <p className="text-sm font-bold">あす {formatMd(date)}</p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <SkyMark sky={tomorrow.known ? (tomorrow.quiet ? '晴れ' : tomorrowPeak?.sky ?? 'くもり') : 'none'} size={26} />
          <span>{tomorrow.known ? (tomorrow.quiet ? '晴れ' : tomorrowPeak?.call || tomorrowPeak?.sky) : '予報なし'}</span>
        </p>
        {tomorrowTitle ? <p className="mt-1 text-sm leading-relaxed text-muted">{tomorrowTitle}だけ用意しておくと安心。</p> : null}
      </div>
    </div>
  )
}

function SlotStrip({ cast, peakId }: { cast: Forecast; peakId: string | null }) {
  const store = useStore()
  return (
    <div className="mt-4" data-testid="forecast-strip">
      <p className="text-sm font-bold">今日の時間帯</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {cast.slots.map((slot) => {
          const hot = slot.id === peakId && !slot.lifted && (slot.sky === '注意報' || slot.sky === '警報')
          const ring = hot ? (slot.sky === '警報' ? 'border-2 border-alert-line bg-alert' : 'border-2 border-watch-line bg-watch') : 'bg-white'
          const count = slot.lifted ? Math.max(slot.stack - 1, 1) : slot.stack
          return (
            <button
              key={slot.id}
              type="button"
              data-testid={`forecast-slot-${slot.id}`}
              className={`flex min-h-11 flex-col items-center justify-center rounded-xl px-1 py-2 text-xs leading-tight font-bold ${ring}`}
              onClick={() => store.openSheet({ type: 'forecast', slotId: slot.id, date: store.today })}
            >
              <span>{slot.label}</span>
              <span className="font-normal text-muted">{slotClock(slot)}</span>
              <SkyMark sky={slot.lifted ? 'くもり' : slot.sky} size={26} />
              <span className={slot.lifted ? 'text-margin' : ''}>
                {slot.sky === '晴れ' && !slot.lifted ? '晴れ' : slot.lifted ? `${count}つに減った` : `${count}つ重なる`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PeakLine({ slot }: { slot: ForecastSlot }) {
  const clock = slotClock(slot)
  const bits = [...new Set(slot.lifted ? slot.bits.slice(1) : slot.bits)]
  const body = slot.lifted
    ? `${clock}：家のこと${bits.length}つ（${bits.join('・')}）。${slot.noun}は自分。`
    : `${clock}：家のこと${slot.stack}つが重なる（${bits.join('・')}）`
  return <p className="mt-2 text-sm leading-relaxed">{body}</p>
}

function glanceLine(cast: Forecast): string {
  const busy = cast.slots.filter((slot) => slot.sky !== '晴れ' && !slot.lifted)
  if (busy.length === 0) return '一日晴れ'
  const names = busy.map((slot) => `${slot.id}は${slot.call || slot.sky}`)
  return `晴れのち ${names.join('、')}`
}
