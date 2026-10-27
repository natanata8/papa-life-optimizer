import { DemoBar } from '@/components/DemoBar.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { LevelBadge, SkyMark } from '@/components/SkyMark.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { type ForecastSlotId } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { SHOW_WEEKLY_MARGIN, weekActionLine, weekSummaryLine } from '@/domain/freed.ts'
import { DAY_ORDER, DOW_CHARS, SLOTS, addDays, dowIndex, formatMd, slotOf, weekdayChar } from '@/domain/dates.ts'
import { DAILY_TASKS, adoptedKeys, invisibleOn, type InvItem } from '@/domain/invisible.ts'
import { partnerDay, type PartnerBlock } from '@/domain/partnerDay.ts'
import { isSet } from '@/domain/profile.ts'
import { childName } from '@/domain/childEvents.ts'
import type { ChildEvent, FamEvent, Step } from '@/domain/types.ts'

const HINTS: Record<string, string> = {
  gomi: 'ゴミの日',
  school: '園・学校',
  shop: '買い物の曜日',
}

export function Calendar() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const missing = ['gomi', 'school', 'shop'].filter((key) => !isSet(data.profile, key)).map((key) => HINTS[key])

  return (
    <div className="px-3.5 pt-3.5 pb-28" data-testid="calendar">
      <DemoBar />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">カレンダー</h1>
        <div className="flex rounded-xl bg-[#f0e8df] p-0.5 text-xs font-bold">
          <button
            type="button"
            data-testid="cal-week"
            className={`rounded-[10px] px-3 py-1.5 ${store.cal === 'week' ? 'bg-white text-ink' : 'text-muted'}`}
            onClick={() => store.setCal('week')}
          >
            週
          </button>
          <button
            type="button"
            data-testid="cal-day"
            className={`rounded-[10px] px-3 py-1.5 ${store.cal === 'day' ? 'bg-white text-ink' : 'text-muted'}`}
            onClick={() => store.setCal('day', store.day)}
          >
            日
          </button>
        </div>
      </div>
      {missing.length > 0 ? (
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-inv-line bg-inv px-3 py-2 text-left text-[13px] leading-relaxed text-inv-ink"
          onClick={() => store.setTab('profile')}
        >
          <Phrase text="👀 いまは予定から分かる段取りだけ出ています。" />
          <b>
            <Phrase text={missing.join('・')} />
          </b>
          <Phrase text="を入れると、裏で回っている仕事がもっと見えます。" />
        </button>
      ) : null}
      {store.cal === 'week' ? <Week /> : <Day />}
      <div className="mt-3 flex gap-2">
        <Button className="flex-1" size="lg" variant="ghost" onClick={() => store.openSheet({ type: 'addEvent' })}>
          ＋ 家族の予定
        </Button>
        <Button className="flex-1" size="lg" variant="ghost" data-testid="cal-children" onClick={() => store.openSheet({ type: 'children' })}>
          ＋ 子どもの予定
        </Button>
      </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
        <Phrase text="👀 は家庭プロフィールと、「家事・育児タスク一覧」から出ます。チェックや採点はしません。" />
        <Phrase text="妻の1日は推定です。編集もチェックもできません。" />
      </p>
    </div>
  )
}

function FilterChip({
  on,
  tone,
  children,
  onClick,
}: {
  on: boolean
  tone: 'event' | 'step' | 'inv' | 'child' | 'wife'
  children: string
  onClick: () => void
}) {
  const colors = {
    event: on ? 'bg-event text-event-ink' : 'bg-white text-faint',
    step: on ? 'bg-step text-step-ink' : 'bg-white text-faint',
    inv: on ? 'bg-inv text-inv-ink' : 'bg-white text-faint',
    child: on ? 'bg-child text-child-ink' : 'bg-white text-faint',
    wife: on ? 'bg-[#f3f0ea] text-muted' : 'bg-white text-faint',
  }
  return (
    <button type="button" className={`inline-flex min-h-11 items-center rounded-full border border-line px-2.5 ${colors[tone]}`} onClick={onClick}>
      {children}
    </button>
  )
}

function Week() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const days = DAY_ORDER.map((_, index) => addDays(store.weekStart, index))
  const rows = days.map((date) => {
    const cast = forecastFor(data, date, store.today)
    const peak = cast.slots.find((slot) => slot.id === cast.peak) ?? null
    const yama = Boolean(peak && !peak.lifted && (peak.sky === '注意報' || peak.sky === '警報'))
    const child = data.childEvents.filter((event) => event.date === date).sort(byStart)[0]
    const event = data.events.filter((item) => item.date === date).sort(byTime)[0]
    const step = data.steps.filter((item) => item.date === date).sort(byTime)[0]
    const main = child
      ? `${childName(data.profile.kids, child.childId)} ${child.title}`.trim()
      : event
        ? event.title
        : step
          ? step.title
          : ''
    return { date, cast, peak, yama, main }
  })
  const yamaRows = rows.filter((row) => row.yama && row.peak)
  const yamaLabel = yamaRows.map((row) => `${weekdayChar(row.date)}の${row.peak?.id}`).join('と')
  const marginTotal = yamaRows.reduce((sum, row) => sum + (row.peak?.freedMin ?? 0), 0)

  return (
    <div data-testid="week-view">
      <DateBar
        label={`${formatMd(store.weekStart)} 〜 ${formatMd(addDays(store.weekStart, 6))}`}
        prevLabel="前の週"
        nextLabel="次の週"
        onPrev={() => store.shiftWeek(-1)}
        onNext={() => store.shiftWeek(1)}
      />
      <div className="rounded-xl bg-margin-wash px-3 py-2 text-sm leading-relaxed">
        <p className="font-bold">
          <Phrase text={yamaLabel ? `今週の山場は ${yamaLabel}` : '今週の山場はありません'} />
        </p>
        {SHOW_WEEKLY_MARGIN && yamaRows.length > 0 ? (
          <p className="mt-1">
            <Phrase text={weekSummaryLine(yamaRows.length, marginTotal)} />
          </p>
        ) : null}
      </div>
      <div className="mt-2 divide-y divide-line overflow-hidden rounded-xl bg-white">
        {rows.map((row) => {
          const dow = dowIndex(row.date)
          const peak = row.peak
          const sky = !row.cast.known ? 'none' : peak && peak.sky !== '晴れ' ? peak.sky : '晴れ'
          const heading = weekHeading(row.cast.known, peak)
          const second =
            row.yama && peak
              ? weekActionLine(peak.noun, peak.freedMin)
              : row.cast.known && row.cast.freeFrom
                ? `余白：${row.cast.freeFrom}以降`
                : row.cast.known && row.cast.quiet
                  ? '余白：夜はまるごと'
                  : ''
          return (
            <div key={row.date} className={`flex gap-2 px-2 py-2 ${row.date === store.today ? 'bg-watch/40' : ''}`}>
              <button
                type="button"
                data-testid={`cal-date-${row.date}`}
                className={`flex w-12 shrink-0 flex-col items-center justify-center rounded-lg ${dow === 0 ? 'text-[#b3261e]' : dow === 6 ? 'text-margin' : ''}`}
                onClick={() => store.setCal('day', row.date)}
              >
                <span className="text-xs">{row.date === store.today ? '今日' : DOW_CHARS[dow]}</span>
                <span className="text-xl leading-none font-bold">{Number(row.date.slice(8))}</span>
              </button>
              <button
                type="button"
                data-testid={`cal-sky-${row.date}`}
                aria-label={!row.cast.known ? '予報なし' : peak?.lifted ? '解除' : peak?.call || (sky === 'none' ? '予報なし' : sky)}
                className="inline-flex min-h-11 w-9 shrink-0 items-center justify-center"
                onClick={() => {
                  if (!row.cast.known || !peak || peak.sky === '晴れ') {
                    store.setCal('day', row.date)
                    return
                  }
                  store.openSheet({ type: 'forecast', slotId: peak.id, date: row.date })
                }}
              >
                <SkyMark sky={sky} size={28} lifted={Boolean(peak?.lifted)} />
              </button>
              <button type="button" className="min-w-0 flex-1 py-1 text-left" onClick={() => store.setCal('day', row.date)}>
                <p className="flex flex-wrap items-center gap-1 text-[15px] leading-snug font-bold">
                  <span>
                    <Phrase text={heading} />
                  </span>
                  {row.yama && peak ? <LevelBadge sky={peak.sky} call={peak.sky} lifted={false} /> : null}
                </p>
                {second ? (
                  <p className="mt-0.5 text-sm leading-snug text-margin">
                    <Phrase text={second} />
                  </p>
                ) : null}
                {row.main ? <p className="mt-0.5 truncate text-[13px] leading-snug text-muted">{row.main}</p> : null}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function weekHeading(known: boolean, peak: { id: string; sky: string; lifted: boolean } | null): string {
  if (!known) return '予報なし'
  if (!peak || peak.sky === '晴れ') return '晴れ'
  if (peak.lifted) return 'くもり'
  if (peak.sky === '注意報' || peak.sky === '警報') return `${peak.id}が山場`
  if (peak.sky === 'にわか雨') return `${peak.id}がいそがしい`
  return 'くもり'
}

function Day() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const events = data.events.filter((event) => event.date === store.day).sort(byTime)
  const childEvents = data.childEvents.filter((event) => event.date === store.day).sort(byStart)
  const steps = data.steps.filter((step) => step.date === store.day).sort(byTime)
  const invisible = invisibleOn(store.day, data.profile, data.events, data.hidden, store.today)
  const lane = store.filters.wife ? partnerDay(store.day, data.profile, data.events, data.childEvents, data.hidden, store.today) : null
  const cast = forecastFor(data, store.day, store.today)
  const laneKeys = new Set((lane?.blocks ?? []).map((block) => block.invisibleKey).filter((key): key is string => Boolean(key)))
  const dadInvisible = invisible.filter((item) => !laneKeys.has(item.key))
  const adopted = adoptedKeys(data.steps)
  const minutes = DAILY_TASKS.reduce((sum, task) => sum + task.minutes, 0)

  return (
    <div data-testid="day-view">
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <FilterChip on={store.filters.ev} tone="event" onClick={() => store.toggleFilter('ev')}>
          ■ 家族の予定
        </FilterChip>
        <FilterChip on={store.filters.step} tone="step" onClick={() => store.toggleFilter('step')}>
          ■ 自分の一手
        </FilterChip>
        <FilterChip on={store.filters.inv} tone="inv" onClick={() => store.toggleFilter('inv')}>
          👀 見えない仕事
        </FilterChip>
        <FilterChip on={store.filters.child} tone="child" onClick={() => store.toggleFilter('child')}>
          ■ 子どもの予定
        </FilterChip>
        <FilterChip on={store.filters.wife} tone="wife" onClick={() => store.toggleFilter('wife')}>
          推定 妻の1日
        </FilterChip>
      </div>
      <DateBar
        label={`${formatMd(store.day)}${store.day === store.today ? ' 今日' : ''}`}
        prevLabel="前の日"
        nextLabel="次の日"
        onPrev={() => store.shiftDay(-1)}
        onNext={() => store.shiftDay(1)}
      />
      {store.filters.inv ? (
        <details className="rounded-xl border border-dashed border-inv-line bg-inv px-3 py-2">
          <summary className="py-2 text-[13px] font-bold text-inv-ink">
            👀 毎日まわっている見えない仕事 {DAILY_TASKS.length}件（目安 約{minutes}分）
          </summary>
          <div className="mt-2 space-y-1">
            {DAILY_TASKS.map((task) => (
              <button
                key={task.id}
                type="button"
                data-testid={`daily-${task.id}`}
                className="flex w-full items-center gap-2 rounded-lg bg-white/70 px-2 py-1.5 text-left text-[13px]"
                onClick={() => store.openSheet({ type: 'daily', taskId: task.id })}
              >
                <span>👀</span>
                <span className="flex-1">{task.title}</span>
                <span className="text-xs text-muted">{task.frequency}</span>
              </button>
            ))}
          </div>
        </details>
      ) : null}
      {lane ? (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold" data-testid="wife-lane">
          <p>自分</p>
          <p className="text-muted">妻の1日・推定</p>
        </div>
      ) : null}
      {lane && !lane.workday ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          <Phrase text={lane.note} />
        </p>
      ) : null}
      {SLOTS.map((slot) => {
        const slotEvents = store.filters.ev ? events.filter((event) => slotOf(event.time) === slot) : []
        const slotChild = store.filters.child ? childEvents.filter((event) => slotOf(event.allDay ? '' : event.startTime) === slot) : []
        const slotSteps = store.filters.step ? steps.filter((step) => slotOf(step.time) === slot) : []
        const slotInv = store.filters.inv ? dadInvisible.filter((item) => item.slot === slot) : []
        const slotWife = lane?.blocks.filter((block) => slotOf(block.time) === slot) ?? []
        if (!slotEvents.length && !slotChild.length && !slotSteps.length && !slotInv.length && !slotWife.length && slot === '終日') return null
        const forecastId = forecastSlotId(slot)
        const skySlot = forecastId ? cast.slots.find((item) => item.id === forecastId) : null
        return (
          <div key={slot} className="mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold text-muted">{slot}</p>
              {cast.known && skySlot && skySlot.sky !== '晴れ' ? (
                <button
                  type="button"
                  data-testid={`cal-slot-${slot}`}
                  className="inline-flex min-h-11 items-center gap-1"
                  onClick={() => store.openSheet({ type: 'forecast', slotId: skySlot.id, date: store.day })}
                >
                  <SkyMark sky={skySlot.sky} lifted={skySlot.lifted} />
                  {skySlot.lifted || skySlot.call ? (
                    <LevelBadge sky={skySlot.sky} call={skySlot.call} lifted={skySlot.lifted} />
                  ) : (
                    <span className={`text-xs font-bold ${skySlot.sky === 'くもり' ? 'text-cloud-ink' : 'text-rain-ink'}`}>{skySlot.sky}</span>
                  )}
                </button>
              ) : null}
            </div>
            <div className={lane ? 'mt-1 grid grid-cols-2 items-start gap-1' : 'mt-1 space-y-1'}>
              <div className="space-y-1">
                {slotEvents.map((event) => (
                  <EventPill key={event.id} event={event} />
                ))}
                {slotChild.map((event) => (
                  <ChildPill key={event.id} event={event} name={childName(data.profile.kids, event.childId)} />
                ))}
                {slotSteps.map((step) => (
                  <StepPill key={step.id} step={step} />
                ))}
                {slotInv.map((item) => (
                  <InvisiblePill key={item.key} item={item} adopted={adopted.has(`${item.date}:${item.key}`)} />
                ))}
                {!slotEvents.length && !slotChild.length && !slotSteps.length && !slotInv.length ? <p className="px-1 text-xs text-faint">—</p> : null}
              </div>
              {lane ? (
                <div className="space-y-1">
                  {slotWife.map((block) => (
                    <WifeBlock key={block.id} date={store.day} block={block} />
                  ))}
                  {slotWife.length === 0 ? <p className="px-1 text-xs text-faint">—</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
      {lane?.workday ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          <Phrase text={`${lane.note}${lane.windowLabel}`} />
        </p>
      ) : null}
      <Button className="mt-3" size="lg" onClick={() => store.askDay(store.day)}>
        💬 この日のことをAIに相談
      </Button>
    </div>
  )
}

function forecastSlotId(slot: string): ForecastSlotId | null {
  if (slot === '朝' || slot === '夕方' || slot === '夜') return slot
  if (slot === '日中') return '昼'
  return null
}

function DateBar({
  label,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  label: string
  prevLabel: string
  nextLabel: string
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="my-2 flex items-center justify-between">
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-2 text-lg" onClick={onPrev} aria-label={prevLabel}>
        ‹
      </button>
      <b className="text-sm">{label}</b>
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-2 text-lg" onClick={onNext} aria-label={nextLabel}>
        ›
      </button>
    </div>
  )
}

function EventPill({ event }: { event: FamEvent }) {
  const store = useStore()
  return (
    <button
      type="button"
      className="flex w-full items-center gap-1.5 rounded-lg bg-event px-2 py-1.5 text-left text-[13px] text-event-ink"
      onClick={() => store.openSheet({ type: 'event', id: event.id })}
    >
      <span>{event.who === '自分' ? '🙋' : '👪'}</span>
      <span className="text-xs">{event.time || '終日'}</span>
      <span className="truncate">{event.title}</span>
    </button>
  )
}

function ChildPill({ event, name }: { event: ChildEvent; name: string }) {
  const store = useStore()
  const when = event.allDay || !event.startTime ? '終日' : event.startTime
  return (
    <button
      type="button"
      data-testid={`child-${event.id}`}
      className="flex w-full items-center gap-1.5 rounded-lg bg-child px-2 py-1.5 text-left text-[13px] text-child-ink"
      onClick={() => store.openSheet({ type: 'children', editId: event.id })}
    >
      <span className="text-xs">{when}</span>
      <span className="truncate">
        {name ? `${name} ` : ''}
        {event.title}
        {event.items.length > 0 ? `（${event.items.join('、')}）` : ''}
      </span>
    </button>
  )
}

function StepPill({ step }: { step: Step }) {
  const store = useStore()
  return (
    <button
      type="button"
      className="flex w-full items-center gap-1.5 rounded-lg bg-step px-2 py-1.5 text-left text-[13px] text-step-ink"
      onClick={() => store.openSheet({ type: 'step', id: step.id })}
    >
      <span>{step.status === 'good' ? '😊' : step.status === 'meh' ? '😐' : '👉'}</span>
      {step.time ? <span className="text-xs">{step.time}</span> : null}
      <span className="truncate">一手：{step.title}</span>
    </button>
  )
}

function WifeBlock({ date, block }: { date: string; block: PartnerBlock }) {
  const store = useStore()
  return (
    <button
      type="button"
      data-testid={`wife-block-${block.id}`}
      className="w-full rounded-lg border border-dashed border-line bg-[#f7f4ef]/90 px-1.5 py-1 text-left text-xs leading-snug text-muted"
      onClick={() => store.openSheet({ type: 'wife', date, blockId: block.id })}
    >
      <span className="block text-xs whitespace-nowrap">推定 {block.time}</span>
      <Phrase text={block.line} />
    </button>
  )
}

function InvisiblePill({ item, adopted }: { item: InvItem; adopted: boolean }) {
  const store = useStore()
  return (
    <button
      type="button"
      data-testid={`inv-${item.date}-${item.key}`}
      className={`flex w-full items-start gap-1.5 rounded-lg border border-dashed px-2 py-1.5 text-left text-[13px] text-inv-ink ${adopted ? 'border-accent bg-accent-soft' : 'border-inv-line bg-inv'}`}
      onClick={() => store.openSheet({ type: 'invisible', date: item.date, key: item.key })}
    >
      <span>👀</span>
      <span>
        <Phrase text={adopted ? `${item.title}（一手にした）` : item.title} />
      </span>
    </button>
  )
}

function byTime(a: { time: string }, b: { time: string }) {
  return (a.time || '').localeCompare(b.time || '')
}

function byStart(a: { startTime: string }, b: { startTime: string }) {
  return (a.startTime || '').localeCompare(b.startTime || '')
}
