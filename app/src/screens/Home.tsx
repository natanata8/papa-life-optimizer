import { Fragment, useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Icon } from '@/components/icons.tsx'
import { SkyMark } from '@/components/SkyMark.tsx'
import { NextHandCard } from '@/components/NextHand.tsx'
import { ToastBar } from '@/components/ToastBar.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'
import { formatMd, hourInRange } from '@/domain/dates.ts'
import { slotClock } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { morningKitLine, showMorningKit } from '@/domain/dayMode.ts'
import { glanceLine, liftLine, rowMark, skyWash, takenMargin } from '@/domain/glance.ts'
import { returnInfo } from '@/domain/profile.ts'
import {
  contextChips,
  footerLine,
  listLabel,
  listedSteps,
  nextHand,
  overlapLine,
  routineDone,
  routineForPeak,
  rowAt,
  rowNote,
  rowTitle,
  tonightIds,
  type RoutineId,
} from '@/domain/routines.ts'
import type { AgeLabel } from '@/domain/types.ts'

export function Home() {
  const store = useStore()
  const data = store.data
  const [later, setLater] = useState<string | null>(null)
  if (!data) return null
  const info = returnInfo(data.profile.home)
  const back = info?.back ?? null
  const ages = data.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
  const ensoku = data.childEvents.some((event) => event.date > store.today && (event.title.includes('遠足') || event.items.some((item) => item.includes('弁当'))))
  const cast = forecastFor(data, store.today)
  const peak = cast.slots.find((slot) => slot.id === cast.peak) ?? null
  const warning = Boolean(peak && (peak.sky === '注意報' || peak.sky === '警報'))
  const bits = (peak?.bits ?? []).map((bit) => (ensoku && /弁当|持/.test(bit) ? '明日の遠足の持ち物' : bit))
  const overlap = warning && peak ? overlapLine(slotClock(peak), bits) : ''
  const windowLabel = warning && peak ? slotClock(peak) : ''
  const ids = tonightIds(store.mode)
  const taken = data.taken?.[store.today] ?? []
  const hand = nextHand({ order: ids, taken, ages, ensoku })
  const showHand = Boolean(hand && hand.id !== later)
  const anyDone = taken.some((item) => routineDone(item, ages, ensoku))
  const peakRoutine = peak ? routineForPeak(peak.noun, peak.kind) : null
  const recommended = showHand && hand ? hand.id : !anyDone && peakRoutine && !taken.some((item) => item.routineId === peakRoutine) ? peakRoutine : null
  const kit = showMorningKit(data.profile.notif, store.mode) ? morningKitLine(data.childEvents, store.today) : null
  const askTonight = () => {
    const titles = taken.map((item) => rowTitle(item.routineId as RoutineId, ages, ensoku))
    store.askForecast(peak?.prompt || '今夜の流れについて、次の手順を一つ。', contextChips({
      dateLabel: `${formatMd(store.today)} 今夜`,
      back,
      titles,
      overlap,
      ages,
    }))
  }
  const rows = ids.map((id) => {
    const item = taken.find((row) => row.routineId === id)
    const anchor = item?.at || rowAt(id, back)
    const clock = listLabel(listedSteps(id, ages, ensoku, item?.partial, item?.extra), anchor)
    return { id, at: anchor, start: clock.start, item }
  })
  const hero = takenMargin(taken, ages, ensoku)
  const margin = hero.minutes
  const absorbed = margin > 0 && warning
  const wash = skyWash({ quiet: cast.quiet, absorbed })
  const glance = glanceLine({
    quiet: cast.quiet,
    absorbed,
    slots: cast.slots.map((slot) => ({ label: slot.label, sky: slot.sky })),
  })
  const glanceSky = cast.quiet ? '晴れ' : absorbed ? 'くもり' : peak?.sky ?? 'くもり'
  const passed = Object.entries(data.accept ?? {}).some(([key, value]) => key.startsWith(`${store.today}|`) && value.phase === 'passed')
  const shared = taken.some((item) => item.sharedAt)
  const doneCount = taken.filter((item) => routineDone(item, ages, ensoku)).length
  const finished = doneCount > 0 && doneCount === taken.length
  const clock = store.mode === '帰宅前' && info ? info.open : back ?? ''
  const partner = data.profile.partner || '家族'

  const heading = back
    ? taken.length > 0
      ? `帰宅 ${back}。${taken.length}つ引き受け中`
      : `帰宅 ${back}。先に決めておこう`
    : '今夜の流れを、先に決めておこう'

  return (
    <div className="relative px-3.5 pt-3.5 pb-44">
      <div aria-hidden="true" className={`sky sky-${wash}`} />
      <DemoBar title="今夜の流れ" meta={`${formatMd(store.today)} ${clock}`} fold />
      {store.demo && !store.ownHome ? (
        <div className="mb-3 flex gap-2" data-fold="sample">
          <p className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent-soft px-2 text-center text-xs font-bold text-accent-deep">サンプルの家族で表示中</p>
          <button type="button" data-testid="start-own" className="min-h-11 flex-1 rounded-xl bg-white text-xs font-bold" onClick={store.startOwnHome}>
            自分の家族で始める
          </button>
        </div>
      ) : null}
      <div data-fold="heading">
        <p className="flex items-center gap-2 text-sm font-bold">
          <SkyMark sky={glanceSky} size={26} lifted={absorbed} label={glance} />
          <span className="min-w-0">
            <Phrase text={glance} />
          </span>
        </p>
        <h2 className="mt-2 text-[23px] leading-snug font-bold">
          <Phrase text={heading} />
        </h2>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1" data-testid="hero-margin">
          <span className={`text-[48px] leading-none font-bold ${margin > 0 ? 'text-margin' : 'text-muted'}`}>{margin}</span>
          <span className="text-base font-bold">分</span>
          <span className="text-sm text-muted">
            <Phrase text={`の余白（目安）・${hero.detail}`} />
          </span>
        </p>
      </div>
      {passed ? <p className="mt-2 text-sm" data-testid="tonight-passed">今日はパスしました。記録は残していません。</p> : null}
      {finished && !hand ? <p className="mt-2 text-sm font-bold" data-testid="tonight-done">終わった</p> : null}
      {shared ? <p className="mt-1 text-sm font-bold text-margin" data-testid="tonight-shared">共有済み</p> : null}
      {warning && peak && overlap ? (
        <p
          className={`mt-2 flex min-w-0 items-start gap-2 rounded-2xl border-l-[5px] px-3 py-2 text-sm font-bold ${absorbed ? 'border-[#9aa6b2] bg-lift text-lift-ink' : peak.sky === '警報' ? 'border-alert-line bg-alert text-alert-ink' : 'border-watch-line bg-[#fff8d6] text-watch-ink'}`}
          data-fold="warning"
        >
          <SkyMark sky={absorbed ? 'くもり' : peak.sky} size={26} lifted={absorbed} />
          <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-1.5 text-xs font-bold ${absorbed ? 'bg-white text-lift-ink' : peak.sky === '警報' ? 'bg-alert-line text-white' : 'bg-watch-tag text-watch-ink'}`}>
            {absorbed ? '解除' : peak.sky}
          </span>
          <span className="min-w-0 flex-1">
            <Phrase text={absorbed ? liftLine(taken.map((item) => rowTitle(item.routineId as RoutineId, ages, ensoku))) : `${overlap}。備えておけば大丈夫`} />
          </span>
        </p>
      ) : cast.quiet ? (
        <p className="mt-3 flex items-center gap-2 text-base font-bold" data-fold="warning">
          <Icon name="sun" size={16} className="text-[#e0a04a]" />
          今日は晴れ。余白はそのまま使おう
        </p>
      ) : null}
      {kit ? (
        <button
          type="button"
          data-testid="morning-kit"
          data-fold="kit"
          className="mt-3 flex min-h-11 w-full items-center rounded-xl bg-white px-3 text-left text-sm font-bold"
          onClick={() => {
            const event = data.childEvents.find((item) => item.items.includes('体操着') || item.title.includes('体操着') || item.category === '持ち物')
            store.setTab('cal')
            store.setCal('day', event?.date ?? store.today)
          }}
        >
          <Phrase text={kit} />
        </button>
      ) : null}
      <p className="mt-3 text-xs font-bold text-muted">今夜の予報・時刻ごとの家のこと</p>
      <div className="mt-3 space-y-2">
        {rows.map((row, index) => {
          const on = Boolean(row.item)
          const finishedRow = Boolean(on && row.item && routineDone(row.item, ages, ensoku))
          const band = Boolean(windowLabel && hourInRange(row.start, windowLabel))
          const bandColor = peak?.sky === '警報' ? 'bg-alert-line' : 'bg-watch-line'
          const bandEdge = peak?.sky === '警報' ? 'border-alert-line' : 'border-watch-line'
          return (
            <Fragment key={row.id}>
            <div className="flex items-stretch gap-2" data-fold={`row-${index}`}>
              <div className="relative w-12 shrink-0 text-right">
                {index < rows.length - 1 ? (
                  <span aria-hidden="true" className={`absolute top-7 -bottom-2 left-1/2 w-1 -translate-x-1/2 ${band && !on ? bandColor : 'bg-line'}`} />
                ) : null}
                <p className="relative z-10 text-xs font-bold whitespace-nowrap">{row.start}</p>
              </div>
              <div className="relative z-10 flex w-7 shrink-0 justify-center pt-1">
                <SkyMark
                  size={28}
                  sky={rowMark({ taken: on, warning: band && peak?.sky !== '警報', alert: band && peak?.sky === '警報' })}
                  label={on ? '引き受けた' : band ? peak?.sky : '軽い'}
                />
              </div>
                <article className={`hare-card flex min-w-0 flex-1 items-center gap-2 p-2.5 ${showHand && hand?.id === row.id ? 'bg-accent-soft' : ''} ${band && !on ? `border-l-4 ${bandEdge}` : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1 text-[15px] font-bold">
                    <Phrase text={rowTitle(row.id, ages, ensoku)} />
                    {band && !on ? (
                      <span className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-xs font-bold ${peak?.sky === '警報' ? 'bg-alert-line text-white' : 'bg-watch-tag text-watch-ink'}`}>{peak?.sky}</span>
                    ) : null}
                    {row.id === recommended ? (
                      <span className="whitespace-nowrap rounded-full bg-watch px-1.5 py-0.5 text-xs font-bold text-watch-ink" data-testid={showHand && hand?.id === row.id ? 'tonight-next' : undefined}>
                        おすすめ
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted">
                    <Phrase text={rowNote(row.id, ages, ensoku, row.item?.partial, row.item?.extra)} />
                  </p>
                </div>
                <button
                  type="button"
                  data-testid={`tonight-take-${row.id}`}
                  className={`inline-flex min-h-11 min-w-[92px] shrink-0 items-center justify-center gap-1 rounded-full px-3 text-sm font-bold whitespace-nowrap ${on ? 'take-on' : 'take-open'}`}
                  onClick={() => {
                    if (!on || !row.item) {
                      store.takeRoutine(store.today, row.id, row.at)
                      return
                    }
                    const snapshot = row.item
                    store.dropRoutine(store.today, row.id)
                    store.showToast('引き受けを外しました', () => store.restoreTaken(store.today, snapshot))
                  }}
                >
                  <Icon name={on ? 'check' : 'plus'} size={16} />
                  {finishedRow ? '終わった' : on ? '引き受けた' : '引き受ける'}
                </button>
              </article>
            </div>
            {showHand && hand?.from === row.id ? (
              <div data-fold="next">
                <NextHandCard
                  hand={hand}
                  onLater={() => setLater(hand.id)}
                  onGo={() => {
                    if (hand.taken) {
                      store.setTab('do')
                      return
                    }
                    const at = rows.find((item) => item.id === hand.id)?.at ?? rowAt(hand.id, back)
                    store.takeRoutine(store.today, hand.id, at)
                  }}
                  onConsult={askTonight}
                />
              </div>
            ) : null}
            </Fragment>
          )
        })}
      </div>
      {showHand ? null : (
      <button
        type="button"
        data-testid="tonight-consult"
        data-fold="consult"
        className="hare-card mt-3 flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm font-bold"
        onClick={askTonight}
      >
        <Icon name="consult" size={18} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1">迷ったら相談（今夜の流れは入力済み）</span>
        <Icon name="chevron" size={16} className="shrink-0 text-muted" />
      </button>
      )}
      <div className="fixed bottom-[calc(53px+env(safe-area-inset-bottom))] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-paper px-3.5 pt-2 pb-2">
        <div data-fold="margin">
          {store.toast ? (
            <ToastBar />
          ) : (
            <p className="min-w-0 text-sm">
              <Phrase text={footerLine(taken.length, doneCount, margin)} />
            </p>
          )}
        </div>
        <button
          type="button"
          data-testid="tonight-share"
          data-fold="share"
          className="mt-2 inline-flex min-h-[54px] w-full items-center justify-center gap-1.5 rounded-xl bg-accent-deep text-base font-bold text-white"
          onClick={() => store.openShare()}
        >
          <Icon name="share" size={18} />
          {shared ? '共有済み' : `${partner}に共有する`}
        </button>
        {kit ? null : (
        <button
          type="button"
          data-testid="tonight-cant"
          data-fold="small"
          className="mt-1 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-accent-deep"
          onClick={() => store.openSheet({ type: 'cant', date: store.today, slotId: peak?.id ?? '夜' })}
        >
          今日はむずかしい → 小さく引き受ける
        </button>
        )}
      </div>
    </div>
  )
}
