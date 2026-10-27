import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { useStore } from '@/app/store.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { SkyMark } from '@/components/SkyMark.tsx'
import { Button } from '@/components/ui/button.tsx'
import { logUsage } from '@/data/usage.ts'
import { addDays, formatMd } from '@/domain/dates.ts'
import { lineShareUrl } from '@/domain/export.ts'
import { marginAfter, sendLine } from '@/domain/freed.ts'
import { slotClock, type ForecastSlot } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { copyText } from '@/lib/utils.ts'

export function ForecastCard() {
  const store = useStore()
  const data = store.data
  const [whyOpen, setWhyOpen] = useState(false)
  useEffect(() => {
    logUsage('forecast_viewed')
  }, [])
  if (!data) return null
  const cast = forecastFor(data, store.today)
  const tomorrow = forecastFor(data, addDays(store.today, 1), store.today)
  const tomorrowEvent = data.events.find((event) => event.date === addDays(store.today, 1))
  const peak = cast.slots.find((slot) => slot.id === cast.peak) ?? null
  const review =
    store.mode === '朝'
      ? data.steps.filter((step) => step.date < store.today && !step.status).sort((a, b) => b.date.localeCompare(a.date))[0]
      : undefined
  const key = peak ? `${store.today}|${peak.id}` : ''
  const accept = key ? data.accept?.[key] : undefined
  const phase = cast.quiet || !peak ? 'quiet' : accept?.phase === 'telling' ? 'telling' : accept?.phase === 'done' ? 'done' : accept?.phase === 'passed' ? 'passed' : 'decide'

  return (
    <section data-testid="forecast-card">
      {phase === 'quiet' || phase === 'passed' || !peak ? (
        <Quiet
          passed={phase === 'passed'}
          tomorrow={tomorrow}
          tomorrowTitle={tomorrowEvent?.title ?? ''}
          date={addDays(store.today, 1)}
          onAsk={() => store.askForecast(peak?.prompt || '今日は晴れです。家の負荷の予報で、人の気持ちではありません。このあと一つだけ。')}
        />
      ) : phase === 'telling' ? (
        <Tell peak={peak} initial={accept?.line || sendLine(peak.noun)} small={Boolean(accept?.small)} />
      ) : phase === 'done' ? (
        <Done peak={peak} tomorrow={tomorrow} tomorrowTitle={tomorrowEvent?.title ?? ''} date={addDays(store.today, 1)} small={Boolean(accept?.small)} />
      ) : (
        <Decide peak={peak} whyOpen={whyOpen} onToggleWhy={() => setWhyOpen((value) => !value)} castSlots={cast.slots} />
      )}
      {review && phase !== 'telling' ? (
        <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="forecast-review" data-fold="review">
          <p className="text-sm font-bold">昨日の一手、どうだった？</p>
          <Button className="min-h-11" variant="good" onClick={() => store.setReview(review.id, 'good')}>
            よかった
          </Button>
          <Button className="min-h-11" variant="meh" onClick={() => store.setReview(review.id, 'meh')}>
            微妙
          </Button>
        </div>
      ) : null}
    </section>
  )
}

function whenOf(id: ForecastSlot['id']): string {
  if (id === '朝') return '今朝'
  if (id === '夜') return '今夜'
  if (id === '夕方') return '夕方'
  return '今日'
}

function questionOf(slot: ForecastSlot): string {
  const clock = slotClock(slot)
  if (slot.sky === '警報' && slot.kind === 'child') return `${clock}の${slot.noun}、自分が連れていく？`
  return `${whenOf(slot.id)}の${slot.noun}、引き受ける？`
}

function Decide({
  peak,
  whyOpen,
  onToggleWhy,
  castSlots,
}: {
  peak: ForecastSlot
  whyOpen: boolean
  onToggleWhy: () => void
  castSlots: ForecastSlot[]
}) {
  const store = useStore()
  const clock = slotClock(peak)
  const edge = peak.sky === '警報' ? 'border-alert-line' : 'border-watch-line'
  const bits = [...new Set(peak.bits)]
  return (
    <>
    <article className={`rounded-[14px] border-t-[6px] bg-white px-3 py-3 shadow-sm ${edge}`}>
      <p className={`inline-flex max-w-full min-h-7 items-center gap-1 rounded-full px-2 text-xs font-bold ${peak.sky === '警報' ? 'bg-alert text-alert-ink' : 'bg-watch text-watch-ink'}`} data-fold="badge">
        <SkyMark sky={peak.sky} size={24} />
        <span className="whitespace-nowrap">{`${peak.call} ${clock}`}</span>
      </p>
      <h2 className="mt-3 text-[25px] leading-snug font-bold" data-testid="forecast-headline" data-fold="question">
        <Phrase text={questionOf(peak)} />
      </h2>
      <p className="mt-2 text-base leading-relaxed" data-fold="margin">
        <Phrase text={`家に${peak.freedMin}分の余白（目安）。`} />
        <Phrase text="備えておけば大丈夫。" />
      </p>
      <button
        type="button"
        data-testid={`forecast-lift-${peak.id}`}
        data-fold="accept"
        className="mt-3 inline-flex min-h-[54px] w-full items-center justify-center rounded-xl bg-accent-deep text-[15px] font-bold text-white"
        onClick={() => store.beginAccept(store.today, peak.id, sendLine(peak.noun))}
      >
        引き受ける
      </button>
      <button
        type="button"
        data-testid="forecast-cant"
        data-fold="cant"
        className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#f3eee6] text-[15px] font-bold"
        onClick={() => store.openSheet({ type: 'cant', date: store.today, slotId: peak.id })}
      >
        今日は無理
      </button>
      <button type="button" data-testid="forecast-why-toggle" data-fold="why" className="mt-2 inline-flex min-h-11 items-center text-sm font-bold whitespace-nowrap text-accent-deep" onClick={onToggleWhy}>
        なぜ？（時間帯つき） {whyOpen ? '▲' : '▼'}
      </button>
      {whyOpen ? (
        <div className="mt-2">
          <p className="text-sm leading-relaxed" data-testid={`forecast-why-${peak.id}`}>
            <Phrase text={`なぜ：${peak.reason.split('／')[0]}`} />
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5" data-testid="forecast-strip">
            {castSlots.map((slot) => {
              const hot = slot.id === peak.id
              const ring = hot ? (slot.sky === '警報' ? 'border-2 border-alert-line bg-alert' : 'border-2 border-watch-line bg-watch') : 'bg-sand'
              return (
                <div key={slot.id} data-testid={`forecast-slot-${slot.id}`} className={`flex min-h-11 flex-col items-center rounded-xl px-1 py-2 text-xs font-bold ${ring}`}>
                  <span>{slot.label}</span>
                  <SkyMark sky={slot.sky} size={24} />
                  <span className="whitespace-nowrap">{slot.sky === '晴れ' ? '晴れ' : `${slot.stack}つ重なる`}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            <Phrase text={`${clock}は、家のこと${peak.stack}つ（${bits.join('・')}）が重なります。`} />
          </p>
        </div>
      ) : null}
    </article>
    <ConsultCard
      title="予報士に聞く"
      note={`${whenOf(peak.id)}のことは入力済み。ひとことでOK`}
      testId={`forecast-ask-${peak.id}`}
      onClick={() => store.askForecast(peak.prompt)}
    />
    </>
  )
}

function Tell({ peak, initial, small }: { peak: ForecastSlot; initial: string; small: boolean }) {
  const store = useStore()
  const [text, setText] = useState(initial)
  const finish = () => store.finishAccept(store.today, peak.id)
  return (
    <article className="rounded-[14px] border-t-[6px] border-[#9fc2e3] bg-white px-3 py-3 shadow-sm">
      <p className="text-xs font-bold text-muted" data-fold="steps">
        <span className="text-margin">✓ 決めた</span>
        <span> — </span>
        <span className="text-margin">2 伝える</span>
        <span> — 3 完了</span>
      </p>
      <h2 className="mt-3 text-[23px] leading-snug font-bold" data-fold="question">
        <Phrase text={small ? '小さい一手にしておこう' : `${peak.noun}は自分に。先に一言送っておこう`} />
      </h2>
      <label className="mt-3 block text-xs text-muted" htmlFor="send-line">
        送る文（編集できます）
      </label>
      <textarea
        id="send-line"
        data-fold="line"
        className="mt-1 w-full rounded-xl bg-[#f7f1e8] px-3 py-2 text-sm leading-relaxed"
        rows={3}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <a data-fold="send" className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl bg-margin text-sm font-bold text-white no-underline" href={lineShareUrl(text)}>
          LINEで送る
        </a>
        <button
          type="button"
          data-fold="copy"
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl bg-[#f3eee6] text-sm font-bold"
          onClick={() => {
            void copyText(text).then((ok) => {
              store.showToast(ok ? 'コピーしました' : 'コピーできませんでした')
              if (ok) finish()
            })
          }}
        >
          コピー
        </button>
      </div>
      <div className="mt-2 flex justify-between">
        <button type="button" data-fold="skip-send" className="inline-flex min-h-11 items-center text-sm font-bold text-accent-deep" onClick={finish}>
          送らずに完了
        </button>
        <button type="button" data-fold="undo" className="inline-flex min-h-11 items-center text-sm font-bold text-accent-deep" onClick={() => store.clearAccept(store.today, peak.id)}>
          取り消す
        </button>
      </div>
      <ConsultCard title="予報士に聞く" note="伝え方を相談する" testId={`forecast-ask-${peak.id}`} onClick={() => store.askForecast(`${peak.prompt} 伝える文を短く一つ。`)} />
    </article>
  )
}

function Done({
  peak,
  tomorrow,
  tomorrowTitle,
  date,
  small,
}: {
  peak: ForecastSlot
  tomorrow: ReturnType<typeof forecastFor>
  tomorrowTitle: string
  date: string
  small: boolean
}) {
  const store = useStore()
  return (
    <div>
      <article className="rounded-[14px] border-t-[6px] border-[#9fc2e3] bg-white px-3 py-3 shadow-sm">
        {small ? null : (
          <p className="inline-flex max-w-full items-center gap-1 rounded-full bg-margin-soft px-2 py-1 text-xs font-bold text-margin" data-fold="badge">
            <SkyMark sky="くもり" size={24} />
            <span className="whitespace-nowrap">{`${peak.call}は解除 → くもり`}</span>
          </p>
        )}
        <h2 className="mt-3 text-[25px] leading-snug font-bold" data-fold="question">
          {small ? '送っておきました' : `${whenOf(peak.id)}はこれでOK`}
        </h2>
        {small ? null : (
          <p className="mt-2 text-base leading-relaxed" data-fold="margin">
            <Phrase text={marginAfter(peak.noun, peak.freedMin)} />
          </p>
        )}
        <button type="button" data-fold="undo" className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-accent-deep" onClick={() => store.clearAccept(store.today, peak.id)}>
          取り消す
        </button>
      </article>
      <TomorrowLine tomorrow={tomorrow} title={tomorrowTitle} date={date} />
    </div>
  )
}

function Quiet({
  passed,
  tomorrow,
  tomorrowTitle,
  date,
  onAsk,
}: {
  passed: boolean
  tomorrow: ReturnType<typeof forecastFor>
  tomorrowTitle: string
  date: string
  onAsk: () => void
}) {
  return (
    <div data-testid="forecast-quiet">
      <article className={`rounded-[14px] px-3 py-3 shadow-sm ${passed ? 'bg-white' : 'bg-[#fff8ee]'}`}>
        <p className="inline-flex items-center gap-1 text-sm font-bold" data-fold="badge">
          <SkyMark sky="晴れ" size={24} />
          {passed ? '今日はパス' : '一日 晴れ'}
        </p>
        <h2 className="mt-3 text-[25px] leading-snug font-bold" data-testid="forecast-headline" data-fold="question">
          <Phrase text={passed ? '今日はパスしました。' : '今日は晴れ。余白はそのまま使おう'} />
        </h2>
        <p className="mt-2 text-base" data-fold="note">
          {passed ? '記録は残していません。' : '重なる家のことはありません。'}
        </p>
      </article>
      <TomorrowLine tomorrow={tomorrow} title={tomorrowTitle} date={date} />
      <ConsultCard title="予報士に聞く" note="なんでも。ひとことでOK" testId="forecast-ask-quiet" onClick={onAsk} />
    </div>
  )
}

function TomorrowLine({ tomorrow, title, date }: { tomorrow: ReturnType<typeof forecastFor>; title: string; date: string }) {
  const peak = tomorrow.slots.find((slot) => slot.id === tomorrow.peak)
  const sky = !tomorrow.known ? '予報なし' : tomorrow.quiet ? '晴れ' : peak?.call || peak?.sky || 'くもり'
  return (
    <div className="mt-3 flex items-start gap-2 text-sm" data-fold="tomorrow">
      <SkyMark sky={tomorrow.known ? (tomorrow.quiet ? '晴れ' : peak?.sky ?? 'くもり') : 'none'} size={24} />
      <div>
        <p>
          <Phrase text={`あす ${formatMd(date)}：${sky}。`} />
        </p>
        {title ? <p className="text-muted">{title}だけ。</p> : tomorrow.quiet ? null : <p className="text-muted">明日の朝に一手を出します。</p>}
      </div>
    </div>
  )
}

function ConsultCard({ title, note, testId, onClick }: { title: string; note: string; testId: string; onClick: () => void }) {
  return (
    <button type="button" data-testid={testId} data-fold="consult" className="mt-3 flex min-h-16 w-full items-center gap-2 rounded-[14px] bg-white px-3 py-2 text-left shadow-sm" onClick={onClick}>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-margin-soft text-margin">
        <UserRound size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs text-muted">{note}</span>
      </span>
      <span aria-hidden="true" className="text-muted">
        ›
      </span>
    </button>
  )
}
