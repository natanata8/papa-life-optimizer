import { Fragment, useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Icon } from '@/components/icons.tsx'
import { NextHandCard } from '@/components/NextHand.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'
import { formatMd, hourInRange } from '@/domain/dates.ts'
import { slotClock } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { returnInfo } from '@/domain/profile.ts'
import {
  contextChips,
  footerLine,
  freedFor,
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
import { taskIcon } from '@/domain/taskIcon.ts'
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
  const recommended = showHand && hand ? hand.id : !anyDone && peak ? routineForPeak(peak.noun, peak.kind) : null
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
  const margin = taken.reduce((sum, item) => sum + freedFor(item.routineId as RoutineId, item.partial, ages, ensoku), 0)
  const passed = Object.entries(data.accept ?? {}).some(([key, value]) => key.startsWith(`${store.today}|`) && value.phase === 'passed')
  const shared = taken.some((item) => item.sharedAt)
  const doneCount = taken.filter((item) => routineDone(item, ages, ensoku)).length
  const finished = doneCount > 0 && doneCount === taken.length
  const clock = store.mode === '帰宅前' && info ? info.open : back ?? ''
  const partner = data.profile.partner || '家族'

  return (
    <div className="px-3.5 pt-3.5 pb-44">
      <DemoBar title="今夜の流れ" meta={`${formatMd(store.today)} ${clock}`} fold />
      {store.demo && !store.ownHome ? (
        <div className="mb-3 flex gap-2" data-fold="sample">
          <p className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent-soft px-2 text-center text-xs font-bold text-accent-deep">サンプルの家族で表示中</p>
          <button type="button" data-testid="start-own" className="min-h-11 flex-1 rounded-xl bg-white text-xs font-bold" onClick={store.startOwnHome}>
            自分の家族で始める
          </button>
        </div>
      ) : null}
      <h2 className="text-[22px] leading-snug font-bold" data-fold="heading">
        <Phrase text={back ? `帰宅 ${back}。先に決めておこう` : '今夜の流れを、先に決めておこう'} />
      </h2>
      {passed ? <p className="mt-2 text-sm" data-testid="tonight-passed">今日はパスしました。記録は残していません。</p> : null}
      {finished && !hand ? <p className="mt-2 text-sm font-bold" data-testid="tonight-done">終わった</p> : null}
      {shared ? <p className="mt-1 text-sm font-bold text-margin" data-testid="tonight-shared">共有済み</p> : null}
      {warning && peak && overlap ? (
        <p className={`mt-3 flex min-w-0 items-start gap-2 rounded-2xl px-3 py-2 text-sm font-bold ${peak.sky === '警報' ? 'bg-alert text-alert-ink' : 'bg-watch text-watch-ink'}`} data-fold="warning">
          <Icon name="cloud" size={16} className={`mt-0.5 shrink-0 ${peak.sky === '警報' ? 'text-alert-ink' : 'text-cloud-ink'}`} />
          <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-1.5 text-xs ${peak.sky === '警報' ? 'bg-white text-alert-ink' : 'bg-watch-tag text-watch-ink'}`}>{peak.sky}</span>
          <span className="min-w-0 flex-1">
            <Phrase text={overlap} />
          </span>
        </p>
      ) : cast.quiet ? (
        <p className="mt-3 flex items-center gap-2 text-base font-bold" data-fold="warning">
          <Icon name="sun" size={16} className="text-[#e0a04a]" />
          今日は晴れ。余白はそのまま使おう
        </p>
      ) : null}
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
              <div className="relative w-11 shrink-0">
                {index < rows.length - 1 ? (
                  <span aria-hidden="true" className={`absolute top-7 -bottom-2 left-1/2 w-1 -translate-x-1/2 ${band ? bandColor : 'bg-line'}`} />
                ) : null}
                <p className="relative z-10 text-center text-xs font-bold whitespace-nowrap">{row.start}</p>
                <span
                  aria-hidden="true"
                  className={`relative z-10 mx-auto mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${finishedRow ? 'border-margin bg-margin text-white' : on ? 'border-accent-deep bg-accent-deep' : 'border-faint bg-paper'}`}
                >
                  {finishedRow ? <Icon name="check" size={10} /> : null}
                </span>
              </div>
                <article className={`hare-card flex min-w-0 flex-1 items-center gap-2 p-2.5 ${showHand && hand?.id === row.id ? 'bg-accent-soft' : ''} ${band ? `border-l-4 ${bandEdge}` : ''}`}>
                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${on ? 'bg-accent-deep text-white' : 'bg-sand text-ink'}`}>
                  <Icon name={taskIcon(row.id)} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1 text-[15px] font-bold">
                    <Phrase text={rowTitle(row.id, ages, ensoku)} />
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
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-2.5 text-sm font-bold whitespace-nowrap ${on ? 'bg-accent-deep text-white' : 'bg-[#f3eee6]'}`}
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
        <div className="flex items-center gap-2" data-fold="margin">
          <div className="h-2 w-16 shrink-0 overflow-hidden rounded-full bg-sand" aria-hidden="true">
            <div className="h-full rounded-full bg-margin" style={{ width: `${margin <= 0 ? 0 : Math.max(12, Math.min(100, (margin / 90) * 100))}%` }} />
          </div>
          <p className="min-w-0 flex-1 text-sm">
            <Phrase text={footerLine(taken.length, doneCount, margin)} />
          </p>
        </div>
        <button
          type="button"
          data-testid="tonight-share"
          data-fold="share"
          className="mt-2 inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-xl bg-accent-deep text-base font-bold text-white"
          onClick={() => store.openShare()}
        >
          <Icon name="share" size={18} />
          {shared ? '共有済み' : `${partner}に共有する`}
        </button>
        <button
          type="button"
          data-testid="tonight-cant"
          data-fold="small"
          className="mt-1 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-accent-deep"
          onClick={() => store.openSheet({ type: 'cant', date: store.today, slotId: peak?.id ?? '夜' })}
        >
          今日はむずかしい → 小さく引き受ける
        </button>
      </div>
    </div>
  )
}
