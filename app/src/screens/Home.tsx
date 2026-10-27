import { DemoBar } from '@/components/DemoBar.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { SkyMark } from '@/components/SkyMark.tsx'
import { useStore } from '@/app/store.tsx'
import { formatMd } from '@/domain/dates.ts'
import { slotClock } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { returnInfo } from '@/domain/profile.ts'
import {
  contextChips,
  freedFor,
  overlapLine,
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
  if (!data) return null
  const info = returnInfo(data.profile.home)
  const back = info?.back ?? null
  const ages = data.profile.kids.map((kid) => kid.ageLabel).filter((age): age is AgeLabel => Boolean(age))
  const ensoku = data.childEvents.some((event) => event.date > store.today && (event.title.includes('遠足') || event.items.some((item) => item.includes('弁当'))))
  const cast = forecastFor(data, store.today)
  const peak = cast.slots.find((slot) => slot.id === cast.peak) ?? null
  const warning = Boolean(peak && (peak.sky === '注意報' || peak.sky === '警報'))
  const overlap = warning && peak ? overlapLine(slotClock(peak), peak.bits) : ''
  const hot = new Set<RoutineId>(warning ? ['bath', 'bedtime', 'tomorrow'] : [])
  const recommended = peak ? routineForPeak(peak.noun, peak.kind) : null
  const ids = tonightIds(store.mode)
  const taken = data.taken?.[store.today] ?? []
  const rows = ids.map((id) => {
    const item = taken.find((row) => row.routineId === id)
    return { id, at: item?.at || rowAt(id, back), item }
  })
  const margin = taken.reduce((sum, item) => sum + freedFor(item.routineId as RoutineId, item.partial, ages, ensoku), 0)
  const passed = data.accept?.[`${store.today}|day`]?.phase === 'passed'
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
      {passed ? <p className="mt-2 text-sm">今日はパスしました。記録は残していません。</p> : null}
      {warning && peak && overlap ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-watch px-3 py-2 text-sm font-bold text-watch-ink" data-fold="warning">
          <SkyMark sky={peak.sky} size={24} />
          <span>
            <span className="mr-1 whitespace-nowrap">{peak.sky}</span>
            <Phrase text={overlap} />
          </span>
        </p>
      ) : cast.quiet ? (
        <p className="mt-3 text-base font-bold" data-fold="warning">
          今日は晴れ。余白はそのまま使おう
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        {rows.map((row, index) => {
          const on = Boolean(row.item)
          return (
            <article key={row.id} data-fold={`row-${index}`} className={`flex items-center gap-2 rounded-[14px] bg-white p-3 shadow-sm ${hot.has(row.id) ? 'border-l-4 border-watch-line' : ''}`}>
              <p className="w-12 shrink-0 text-sm font-bold whitespace-nowrap">{row.at}</p>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold">
                  {rowTitle(row.id, ages, ensoku)}
                  {row.id === recommended ? <span className="ml-1 rounded-full bg-watch px-1.5 py-0.5 text-xs font-bold text-watch-ink">おすすめ</span> : null}
                </p>
                <p className="text-xs text-muted">{rowNote(row.id, ages, ensoku)}</p>
              </div>
              <button
                type="button"
                data-testid={`tonight-take-${row.id}`}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm font-bold ${on ? 'bg-accent-deep text-white' : 'bg-[#f3eee6]'}`}
                onClick={() => (on ? store.dropRoutine(store.today, row.id) : store.takeRoutine(store.today, row.id, row.at))}
              >
                {on ? '✓ 引き受けた' : '引き受ける'}
              </button>
            </article>
          )
        })}
      </div>
      <button
        type="button"
        data-testid="tonight-consult"
        data-fold="consult"
        className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-[14px] bg-white px-3 text-left text-sm font-bold shadow-sm"
        onClick={() => {
          const titles = taken.map((item) => rowTitle(item.routineId as RoutineId, ages, ensoku))
          store.askForecast(peak?.prompt || '今夜の流れについて、次の手順を一つ。', contextChips({
            dateLabel: `${formatMd(store.today)} 今夜`,
            back,
            titles,
            overlap,
            ages,
          }))
        }}
      >
        <span className="min-w-0 flex-1">迷ったら相談（今夜の流れは入力済み）</span>
        <span aria-hidden="true">›</span>
      </button>
      <div className="fixed bottom-[calc(53px+env(safe-area-inset-bottom))] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-paper px-3.5 pt-2 pb-2">
        <p className="text-center text-sm" data-fold="margin">
          <Phrase text={taken.length ? `${taken.length}つ引き受け中 → 家に${margin}分の余白（目安）` : '引き受けると、家に余白が戻ります（目安）'} />
        </p>
        <button
          type="button"
          data-testid="tonight-share"
          data-fold="share"
          className="mt-2 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent-deep text-base font-bold text-white"
          onClick={() => store.openShare()}
        >
          {partner}に共有する
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
