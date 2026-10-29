import { useState } from 'react'
import { DemoBar } from '@/components/DemoBar.tsx'
import { Icon } from '@/components/icons.tsx'
import { HeroHome, TaskTile } from '@/components/marks.tsx'
import { houseLight } from '@/domain/house.ts'
import { NextHandCard } from '@/components/NextHand.tsx'
import { ToastBar } from '@/components/ToastBar.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { useStore } from '@/app/store.tsx'
import { formatMd, hourInRange } from '@/domain/dates.ts'
import { slotClock } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { morningKitLine, showMorningKit } from '@/domain/dayMode.ts'
import { glanceLine, liftLine, takenMargin } from '@/domain/glance.ts'
import { returnInfo } from '@/domain/profile.ts'
import {
  contextChips,
  listLabel,
  listedSteps,
  nextHand,
  overlapLine,
  rowAt,
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
  const light = houseLight({ tasks: taken.length, minutes: margin })
  const meter = Math.min(3, taken.length)
  const glance = glanceLine({
    quiet: cast.quiet,
    absorbed,
    slots: cast.slots.map((slot) => ({ label: slot.label, sky: slot.sky })),
  })
  const passed = Object.entries(data.accept ?? {}).some(([key, value]) => key.startsWith(`${store.today}|`) && value.phase === 'passed')
  const shared = taken.some((item) => item.sharedAt)
  const partner = data.profile.partner || '家族'
  const sign = absorbed ? '注意報はひとつ解除' : warning && peak ? `${peak.label}は${peak.sky}` : glance
  const primary = rows.find((row) => !row.item) ?? rows[0]
  const preview = rows.filter((row) => row.id !== primary?.id).slice(0, 2)
  const folded = rows.filter((row) => row.id !== primary?.id && !preview.some((item) => item.id === row.id))
  const openKit = () => {
    const event = data.childEvents.find((item) => item.items.includes('体操着') || item.title.includes('体操着') || item.category === '持ち物')
    store.setTab('cal')
    store.setCal('day', event?.date ?? store.today)
  }

  return (
    <div className="relative bg-paper px-3.5 pt-3 pb-36">
      <DemoBar title="今夜" fold />
      <section className="hero-card flex items-center gap-1 px-2 py-2.5" data-fold="hero" data-testid="hero-margin">
        <HeroHome windows={light.windows} sun={light.sun} className="h-16 w-[72px] shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-extrabold">
            <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${absorbed ? 'bg-accent' : 'bg-watch-line'}`} />
            <Phrase text={sign} />
          </p>
          <p className="mt-1 flex items-baseline">
            <span className={`text-[56px] leading-none font-extrabold tracking-tight ${margin > 0 ? 'text-plus' : 'text-accent'}`}>{margin}</span>
            <span className={`ml-0.5 text-lg font-extrabold ${margin > 0 ? 'text-plus' : 'text-accent'}`}>分</span>
          </p>
          <p className="text-xs font-bold leading-snug text-muted">
            <Phrase text={margin > 0 ? `家の余白（目安）・${hero.detail}` : '家の余白（目安）・引き受けると戻る'} />
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-meter" aria-hidden="true">
            <div className="h-full bg-accent" style={{ width: `${(meter / 3) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs font-bold tracking-wide text-muted" data-testid="hero-meter">{meter} / 3 引き受け</p>
        </div>
      </section>
      {primary ? (
        <article className="hare-card mt-3 px-4 py-3.5" data-fold="next" data-testid="tonight-next-card">
          <p className="text-xs font-extrabold tracking-wide text-muted">次にやること・1つだけ</p>
          <div className="mt-2 flex items-center gap-3">
            <TaskTile id={primary.id} large done={Boolean(primary.item)} />
            <h2 className="min-w-0 text-xl leading-snug font-extrabold">
              <Phrase text={rowTitle(primary.id, ages, ensoku)} />
            </h2>
          </div>
          {windowLabel && hourInRange(primary.start, windowLabel) && !primary.item ? (
            <p className="mt-2 inline-flex min-h-6 items-center gap-1 rounded-full bg-watch px-2 text-xs font-extrabold text-ink">
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-watch-line" />
              注意
              <span className="font-bold">{windowLabel}が重なる</span>
            </p>
          ) : null}
          <button
            type="button"
            data-testid={`tonight-take-${primary.id}`}
            className={`mt-3.5 inline-flex min-h-[52px] w-full items-center justify-center rounded-md text-[17px] font-extrabold text-white active:bg-[#003d99] ${primary.item ? 'bg-muted' : 'bg-accent'}`}
            onClick={() => {
              if (!primary.item) {
                store.takeRoutine(store.today, primary.id, primary.at)
                store.setTab('do')
                return
              }
              const snapshot = primary.item
              store.dropRoutine(store.today, primary.id)
              store.showToast('引き受けを外しました', () => store.restoreTaken(store.today, snapshot))
            }}
          >
            {primary.item ? '引き受けた' : '引き受ける'}
          </button>
        </article>
      ) : null}
      {showHand && hand ? (
        <div className="mt-3">
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
              store.setTab('do')
            }}
            onConsult={askTonight}
          />
        </div>
      ) : null}
      <div className="hare-card mt-3 px-3 py-2">
      {preview.length > 0 ? <p className="px-1 text-xs font-extrabold text-muted">あと{preview.length}つ</p> : null}
      <div>
        {preview.map((row, index) => (
          <div key={row.id} className="flex min-h-14 items-center gap-2 border-t border-line first:border-t-0" data-fold={`row-${index}`}>
            <span className="w-11 shrink-0 text-right text-[13px] font-extrabold text-muted">{row.start}</span>
            <TaskTile id={row.id} done={Boolean(row.item)} />
            <span className="min-w-0 flex-1 text-[15px] font-extrabold">
              <Phrase text={rowTitle(row.id, ages, ensoku)} />
            </span>
            <button
              type="button"
              data-testid={`tonight-take-${row.id}`}
              className={`inline-flex min-h-11 min-w-[68px] items-center justify-center rounded-md border-2 border-accent text-sm font-extrabold text-accent active:bg-accent-soft ${row.item ? 'bg-accent-soft' : 'bg-white'}`}
              onClick={() => {
                if (!row.item) store.takeRoutine(store.today, row.id, row.at)
                else {
                  const snapshot = row.item
                  store.dropRoutine(store.today, row.id)
                  store.showToast('引き受けを外しました', () => store.restoreTaken(store.today, snapshot))
                }
              }}
            >
              {row.item ? '済' : 'やる'}
            </button>
          </div>
        ))}
      </div>
      <details className="mt-2" data-fold="more">
        <summary data-testid="tonight-more" className="inline-flex min-h-11 w-full items-center justify-center gap-1 text-sm font-bold text-muted">
          ほかを見る
          <Icon name="chevron" size={18} className="rotate-90" />
        </summary>
        <div className="mt-2 space-y-2">
          {folded.map((row) => (
            <div key={row.id} className="flex min-h-11 items-center gap-2">
              <span className="w-12 text-right text-xs font-bold">{row.start}</span>
              <span className="min-w-0 flex-1 text-sm font-bold">
                <Phrase text={rowTitle(row.id, ages, ensoku)} />
              </span>
              <button type="button" data-testid={`tonight-take-${row.id}`} className="inline-flex min-h-11 min-w-[92px] items-center justify-center rounded-full border-2 border-accent text-sm font-bold text-accent" onClick={() => store.takeRoutine(store.today, row.id, row.at)}>
                やる
              </button>
            </div>
          ))}
          {kit ? (
            <button type="button" data-testid="morning-kit" className="flex min-h-11 w-full items-center text-left text-sm font-bold" onClick={openKit}>
              <Phrase text={kit} />
            </button>
          ) : null}
          <button type="button" data-testid="tonight-cant" className="flex min-h-11 w-full items-center text-left text-sm font-bold text-accent" onClick={() => store.openSheet({ type: 'cant', date: store.today, slotId: peak?.id ?? '夜' })}>
            今日はむずかしい → 小さく引き受ける
          </button>
          <button type="button" data-testid="tonight-consult" className="flex min-h-11 w-full items-center text-left text-sm font-bold text-accent" onClick={askTonight}>
            迷ったら相談
          </button>
          {store.demo && !store.ownHome ? (
            <button type="button" data-testid="start-own" className="flex min-h-11 w-full items-center text-left text-sm font-bold" onClick={store.startOwnHome}>
              自分の家族で始める
            </button>
          ) : null}
          {passed ? <p className="text-sm" data-testid="tonight-passed">今日はパスしました。記録は残していません。</p> : null}
          {absorbed ? <p className="text-sm text-muted"><Phrase text={liftLine(taken.map((item) => rowTitle(item.routineId as RoutineId, ages, ensoku)))} /></p> : null}
        </div>
      </details>
      </div>
      <div className="fixed bottom-[calc(53px+env(safe-area-inset-bottom))] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-paper px-3.5 pb-2">
        {store.toast ? <ToastBar className="mb-2" /> : null}
        <button
          type="button"
          data-testid="tonight-share"
          data-fold="share"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-md border-2 border-accent bg-white text-base font-extrabold text-accent active:bg-accent-soft"
          onClick={() => store.openShare()}
        >
          {shared ? '共有済み' : `${partner}に共有する`}
        </button>
      </div>
    </div>
  )
}
