import { DemoBar } from '@/components/DemoBar.tsx'
import { Icon } from '@/components/icons.tsx'
import { Phrase } from '@/components/Phrase.tsx'
import { LevelBadge, SkyMark } from '@/components/SkyMark.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { slotClock, type ForecastSlotId } from '@/domain/forecast.ts'
import { forecastFor } from '@/domain/forecastView.ts'
import { DAY_ORDER, DOW_CHARS, SLOTS, addDays, dowIndex, formatMd, slotOf } from '@/domain/dates.ts'
import { DAILY_TASKS, adoptedKeys, invisibleOn, type InvItem } from '@/domain/invisible.ts'
import { partnerDay, type PartnerBlock } from '@/domain/partnerDay.ts'
import { returnInfo } from '@/domain/profile.ts'
import { capCards, skyWash, weekGlance } from '@/domain/glance.ts'
import { dadBusy, routineForPeak, rowAt } from '@/domain/routines.ts'
import { titleIcon } from '@/domain/taskIcon.ts'
import { WeekendCard } from '@/screens/today/WeekendCard.tsx'
import { childName } from '@/domain/childEvents.ts'
import { NoticeSample } from '@/screens/NoticeSample.tsx'
import type { ChildEvent, FamEvent, Step } from '@/domain/types.ts'

export function Calendar() {
  const store = useStore()
  const data = store.data
  if (!data) return null

  return (
    <div className="min-w-0 overflow-x-hidden px-3.5 pt-3.5 pb-28" data-testid="calendar">
      <DemoBar title="予定" />
      <div className="flex items-center justify-end">
        <div className="flex rounded-xl bg-[#f0e8df] p-0.5 text-xs font-bold">
          <button
            type="button"
            data-testid="cal-week"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] px-3 ${store.cal === 'week' ? 'bg-white text-ink' : 'text-muted'}`}
            onClick={() => store.setCal('week')}
          >
            週
          </button>
          <button
            type="button"
            data-testid="cal-day"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] px-3 ${store.cal === 'day' ? 'bg-white text-ink' : 'text-muted'}`}
            onClick={() => store.setCal('day', store.day)}
          >
            日
          </button>
        </div>
      </div>
      {store.cal === 'week' ? <Week /> : <Day />}
      <NoticeSample />
      <div className="mt-3 flex gap-2">
        <Button className="flex-1" size="lg" variant="ghost" onClick={() => store.openSheet({ type: 'addEvent' })}>
          <Icon name="plus" size={16} />
          家族の予定
        </Button>
        <Button className="flex-1" size="lg" variant="ghost" data-testid="cal-children" onClick={() => store.openSheet({ type: 'children' })}>
          <Icon name="plus" size={16} />
          子どもの予定
        </Button>
      </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
        <Phrase text="見えない家事は、家庭プロフィールと「家事・育児タスク一覧」から出ます。チェックや採点はしません。" />
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
    <button type="button" className={`inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-2.5 ${colors[tone]}`} onClick={onClick}>
      <Icon name={tone === 'inv' ? 'hidden' : tone === 'child' ? 'child' : tone === 'step' ? 'check' : tone === 'wife' ? 'me' : 'people'} size={14} />
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
    const open = Boolean(peak && (peak.sky === '注意報' || peak.sky === '警報') && date >= store.today)
    return { date, cast, peak, open }
  })
  const openRows = rows.filter((row) => {
    if (!row.open || !row.peak) return false
    const events = data.events.filter((event) => event.date === row.date)
    return !dadBusy(events, slotClock(row.peak))
  })
  const cards = capCards(openRows, 3)
  const weekMinutes = openRows.reduce((sum, row) => sum + (row.peak?.freedMin ?? 0), 0)
  const skies = rows.map((row) => (!row.cast.known ? 'none' : row.peak?.lifted ? '解除' : row.peak && row.peak.sky !== '晴れ' ? row.peak.sky : '晴れ'))
  const absorbed = rows.some((row) => row.open && (data.taken?.[row.date] ?? []).length > 0)
  const wash = skyWash({ quiet: rows.every((row) => row.cast.quiet), absorbed })

  return (
    <div data-testid="week-view" className="relative">
      <div aria-hidden="true" className={`sky sky-${wash}`} />
      <div className="relative">
      <DateBar
        label={`${formatMd(store.weekStart)}〜${formatMd(addDays(store.weekStart, 6))}`}
        prevLabel="前の週"
        nextLabel="次の週"
        onPrev={() => store.shiftWeek(-1)}
        onNext={() => store.shiftWeek(1)}
      />
      <p className="mt-3 flex items-center gap-2 text-sm font-bold">
        <SkyMark size={26} sky={skies.includes('注意報') ? '注意報' : skies.includes('くもり') ? 'くもり' : '晴れ'} label={weekGlance(skies)} />
        <Phrase text={weekGlance(skies)} />
      </p>
      <h2 className="mt-2 text-[23px] font-bold">先回りできること {openRows.length}</h2>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1">
        <span className={`text-[40px] leading-none font-bold ${weekMinutes > 0 ? 'text-margin' : 'text-faint'}`}>{weekMinutes}</span>
        <span className="text-sm text-muted">分 引き受ければ今週の余白（目安）</span>
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {rows.map((row) => {
          const dow = dowIndex(row.date)
          const peak = row.peak
          const known = row.cast.known
          const sky = !known ? 'none' : peak && peak.sky !== '晴れ' ? peak.sky : '晴れ'
          const label = !known ? '予報なし' : peak?.lifted ? '解除' : peak?.call || sky
          return (
            <button
              key={row.date}
              type="button"
              data-testid={`cal-date-${row.date}`}
              aria-label={`${formatMd(row.date)} ${DOW_CHARS[dow]} ${label}`}
              className={`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl py-1 ${row.date === store.today ? 'bg-watch/50' : ''} ${dow === 0 ? 'text-[#b3261e]' : dow === 6 ? 'text-margin' : ''}`}
              onClick={() => store.setCal('day', row.date)}
            >
              <span className="text-xs">{DOW_CHARS[dow]}</span>
              <span className="text-base leading-none font-bold">{Number(row.date.slice(8))}</span>
              <span data-testid={`cal-sky-${row.date}`} className="mt-1 inline-flex items-center justify-center">
                <SkyMark size={26} sky={sky === 'none' ? 'none' : sky} lifted={Boolean(peak?.lifted)} label={label} />
              </span>
              {sky === '注意報' || sky === '警報' ? (
                <span className={`mt-0.5 rounded-full px-1 text-xs font-bold ${sky === '警報' ? 'bg-alert-line text-white' : 'bg-watch-tag text-watch-ink'}`}>{sky === '警報' ? '警報' : '注意'}</span>
              ) : null}
            </button>
          )
        })}
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted" data-testid="week-legend">
        <span className="inline-flex items-center gap-1">
          <SkyMark size={24} sky="注意報" />
          注意報
        </span>
        <span className="inline-flex items-center gap-1">
          <SkyMark size={24} sky="警報" />
          警報
        </span>
        <span className="inline-flex items-center gap-1">
          <SkyMark size={24} sky="none" />
          予定ありなど
        </span>
      </p>
      <div className="mt-3 space-y-2">
        {cards.shown.map((row) => {
          const peak = row.peak
          if (!peak) return null
          const routineId = routineForPeak(peak.noun, peak.kind)
          const back = returnInfo(data.profile.home)?.back ?? null
          const at = rowAt(routineId, back)
          const taken = (data.taken?.[row.date] ?? []).some((item) => item.routineId === routineId)
          return (
            <article key={row.date} className="hare-card p-3">
              <p className="flex flex-wrap items-center gap-1 text-xs font-bold">
                <span className="whitespace-nowrap">{row.date === store.today ? `今日 ${formatMd(row.date)}` : formatMd(row.date)}</span>
                <span className="whitespace-nowrap">{slotClock(peak)}</span>
                <span className={`rounded-full px-2 py-0.5 whitespace-nowrap ${peak.sky === '警報' ? 'bg-alert text-alert-ink' : 'bg-watch text-watch-ink'}`}>{peak.sky}</span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-base font-bold">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                  <Icon name={titleIcon(peak.noun)} size={16} />
                </span>
                <Phrase text={peak.noun} />
              </p>
              {taken ? (
                <p className="mt-1 text-sm">✓ 引き受けた・やるに入っています</p>
              ) : peak.freedMin > 0 ? (
                <p className="mt-1 text-sm">
                  <Phrase text={`家に${peak.freedMin}分の余白（目安）`} />
                </p>
              ) : null}
              <div className="mt-2">
                {taken ? (
                  <button type="button" className="take-on inline-flex min-h-[54px] w-full items-center justify-center gap-1 rounded-xl text-sm font-bold" onClick={() => store.setTab('do')}>
                    <Icon name="check" size={16} />
                    引き受けた
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid={`week-accept-${row.date}`}
                    className="take-open inline-flex min-h-[54px] w-full items-center justify-center gap-1 rounded-xl text-sm font-bold"
                    onClick={() => {
                      store.takeRoutine(row.date, routineId, at)
                      store.showToast('引き受けました。「やる」に追加', () => store.dropRoutine(row.date, routineId))
                    }}
                  >
                    <Icon name="plus" size={14} />
                    引き受ける
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
      {cards.rest.length > 0 ? (
        <details className="mt-2">
          <summary className="inline-flex min-h-11 items-center text-sm font-bold text-accent-deep">ほか {cards.rest.length}</summary>
          <div className="mt-2 space-y-2">
            {cards.rest.map((row) => (
              <p key={row.date} className="text-sm">
                <Phrase text={`${formatMd(row.date)} ${row.peak?.noun ?? ''}を引き受ければ、家に${row.peak?.freedMin ?? 0}分の余白（目安）`} />
              </p>
            ))}
          </div>
        </details>
      ) : null}
      <WeekendCard />
      <p className="mt-3 text-xs leading-relaxed text-muted">
        <Phrase text="日付をタップすると、その日の予定と時間帯が見られます。" />
        <Phrase text="妻の1日・推定もそこにあります。" />
        <Phrase text="天気はつけません。" />
      </p>
      </div>
    </div>
  )
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
    <div className="min-w-0" data-testid="day-view">
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <FilterChip on={store.filters.ev} tone="event" onClick={() => store.toggleFilter('ev')}>
          家族の予定
        </FilterChip>
        <FilterChip on={store.filters.step} tone="step" onClick={() => store.toggleFilter('step')}>
          引き受けたこと
        </FilterChip>
        <FilterChip on={store.filters.inv} tone="inv" onClick={() => store.toggleFilter('inv')}>
          見えない家事
        </FilterChip>
        <FilterChip on={store.filters.child} tone="child" onClick={() => store.toggleFilter('child')}>
          子どもの予定
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
            見えない家事 {DAILY_TASKS.length}件（目安 約{minutes}分）
          </summary>
          <div className="mt-2 space-y-1">
            {DAILY_TASKS.map((task) => (
              <button
                key={task.id}
                type="button"
                data-testid={`daily-${task.id}`}
                aria-label={task.title}
                className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg bg-white/70 px-2 text-left text-[13px]"
                onClick={() => store.openSheet({ type: 'daily', taskId: task.id })}
              >
                <Icon name="hidden" size={16} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <Phrase text={task.title} />
                </span>
                <span className="text-xs text-muted">{task.frequency}</span>
              </button>
            ))}
          </div>
        </details>
      ) : null}
      {lane ? (
        <div className="mt-2 text-xs font-bold" data-testid="wife-lane">
          <p>自分の予定</p>
          <p className="text-muted">妻の1日・推定（点線）</p>
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
            <div className="mt-1 min-w-0 space-y-1">
              <div className="min-w-0 space-y-1">
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
                <div className="min-w-0 space-y-1">
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
        <Icon name="consult" size={16} />
        この日のことを相談
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
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-2" onClick={onPrev} aria-label={prevLabel}>
        <Icon name="back" size={18} />
      </button>
      <b className="text-sm">{label}</b>
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-2" onClick={onNext} aria-label={nextLabel}>
        <Icon name="chevron" size={18} />
      </button>
    </div>
  )
}

function EventPill({ event }: { event: FamEvent }) {
  const store = useStore()
  return (
    <button
      type="button"
      aria-label={`${event.time || '終日'} ${event.title}`}
      className="flex min-h-11 w-full min-w-0 items-center gap-1.5 rounded-lg bg-event px-2 text-left text-[13px] text-event-ink"
      onClick={() => store.openSheet({ type: 'event', id: event.id })}
    >
      <Icon name={event.who === '自分' ? 'me' : 'people'} size={16} className="shrink-0" />
      <span className="shrink-0 text-xs whitespace-nowrap">{event.time || '終日'}</span>
      <span className="min-w-0 flex-1">
        <Phrase text={event.title} />
      </span>
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
      aria-label={`${when} ${name} ${event.title}`}
      className="flex min-h-11 w-full min-w-0 flex-wrap items-center gap-1.5 rounded-lg bg-child px-2 text-left text-[13px] text-child-ink"
      onClick={() => store.openSheet({ type: 'children', editId: event.id })}
    >
      <Icon name="child" size={16} className="shrink-0" />
      <span className="shrink-0 text-xs whitespace-nowrap">{when}</span>
      <span className="min-w-0 basis-full">
        <Phrase text={`${name ? `${name} ` : ''}${event.title}${event.items.length > 0 ? `（${event.items.join('、')}）` : ''}`} />
      </span>
    </button>
  )
}

function StepPill({ step }: { step: Step }) {
  const store = useStore()
  return (
    <button
      type="button"
      aria-label={step.title}
      className="flex min-h-11 w-full min-w-0 items-center gap-1.5 rounded-lg bg-step px-2 text-left text-[13px] text-step-ink"
      onClick={() => store.openSheet({ type: 'step', id: step.id })}
    >
      <Icon name={step.status === 'good' ? 'check' : 'plan'} size={16} className="shrink-0" />
      {step.time ? <span className="text-xs">{step.time}</span> : null}
      <span className="min-w-0 flex-1">
        <Phrase text={`やること：${step.title}`} />
      </span>
    </button>
  )
}

function WifeBlock({ date, block }: { date: string; block: PartnerBlock }) {
  const store = useStore()
  return (
    <button
      type="button"
      data-testid={`wife-block-${block.id}`}
      aria-label={block.line}
      className="min-h-11 w-full min-w-0 rounded-lg border border-dashed border-line bg-[#f7f4ef]/90 px-1.5 py-2 text-left text-xs leading-snug text-muted"
      onClick={() => store.openSheet({ type: 'wife', date, blockId: block.id })}
    >
      <span className="block text-xs">推定 {block.time}</span>
      <span className="block">
        <Phrase text={block.line} />
      </span>
    </button>
  )
}

function InvisiblePill({ item, adopted }: { item: InvItem; adopted: boolean }) {
  const store = useStore()
  return (
    <button
      type="button"
      data-testid={`inv-${item.date}-${item.key}`}
      aria-label={item.title}
      className={`flex min-h-11 w-full min-w-0 items-start gap-1.5 rounded-lg border border-dashed px-2 py-2 text-left text-[13px] text-inv-ink ${adopted ? 'border-accent bg-accent-soft' : 'border-inv-line bg-inv'}`}
      onClick={() => store.openSheet({ type: 'invisible', date: item.date, key: item.key })}
    >
      <Icon name="hidden" size={16} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <Phrase text={adopted ? `${item.title}（引き受けた）` : item.title} />
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
