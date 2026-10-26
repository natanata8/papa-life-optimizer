import { DemoBar } from '@/components/DemoBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { DAY_ORDER, DOW_CHARS, SLOTS, addDays, dowIndex, formatMd, slotOf } from '@/domain/dates.ts'
import { DAILY_TASKS, adoptedKeys, invisibleOn, weekStats, type InvItem } from '@/domain/invisible.ts'
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
          👀 いまは予定から分かる段取りだけ出ています。<b>{missing.join('・')}</b>を入れると、裏で回っている仕事がもっと見えます →
        </button>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5 text-[12px]">
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
      {store.cal === 'week' ? <Week /> : <Day />}
      <div className="mt-3 flex gap-2">
        <Button className="flex-1" size="lg" variant="ghost" onClick={() => store.openSheet({ type: 'addEvent' })}>
          ＋ 家族の予定
        </Button>
        <Button className="flex-1" size="lg" variant="ghost" data-testid="cal-children" onClick={() => store.openSheet({ type: 'children' })}>
          ＋ 子どもの予定
        </Button>
      </div>
        <p className="mt-2 text-[11px] leading-relaxed text-faint">
        👀 は家庭プロフィールと「家事・育児タスク一覧」から自動で出ます。チェックや採点はしません。妻の1日は推定で、編集もチェックもできません。
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
    <button type="button" className={`rounded-full border border-line px-2.5 py-1 ${colors[tone]}`} onClick={onClick}>
      {children}
    </button>
  )
}

function Week() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const stats = weekStats(store.weekStart, data.profile, data.events, data.hidden, store.today)
  const adopted = adoptedKeys(data.steps)
  const days = DAY_ORDER.map((_, index) => addDays(store.weekStart, index))

  return (
    <div data-testid="week-view">
      <DateBar
        label={`${formatMd(store.weekStart)} 〜 ${formatMd(addDays(store.weekStart, 6))}`}
        onPrev={() => store.shiftWeek(-1)}
        onNext={() => store.shiftWeek(1)}
      />
      <p className="rounded-xl bg-inv px-3 py-2 text-[13px] leading-relaxed text-inv-ink">
        <b>👀 今週の裏側</b>：見えない仕事 <b>{stats.count}件</b>（目安 約{stats.minutes}分）、そのうち予定の前後に出るもの{' '}
        <b>{stats.related}件</b>。ほかに毎日まわっている仕事が {stats.daily}件あります（日の表示で見られます）。
      </p>
      <div className="mt-2 space-y-1.5">
        {days.map((date) => {
          const events = data.events.filter((event) => event.date === date).sort(byTime)
          const steps = data.steps.filter((step) => step.date === date).sort(byTime)
          const childEvents = data.childEvents.filter((event) => event.date === date).sort(byStart)
          const invisible = invisibleOn(date, data.profile, data.events, data.hidden, store.today)
          const lane = store.filters.wife ? partnerDay(date, data.profile, data.events, data.childEvents, data.hidden, store.today) : null
          const laneKeys = new Set((lane?.blocks ?? []).map((block) => block.invisibleKey).filter((key): key is string => Boolean(key)))
          const shownInvisible = invisible.filter((item) => !laneKeys.has(item.key))
          const dow = dowIndex(date)
          return (
            <div key={date} className={`flex gap-2 rounded-xl bg-white p-1.5 ${date === store.today ? 'ring-2 ring-accent' : ''}`}>
              <button
                type="button"
                data-testid={`cal-date-${date}`}
                className={`w-11 shrink-0 rounded-lg py-1 text-center ${dow === 0 ? 'text-[#c4554a]' : dow === 6 ? 'text-[#3d6b9a]' : ''}`}
                onClick={() => store.setCal('day', date)}
              >
                <span className="block text-[11px]">{date === store.today ? '今日' : DOW_CHARS[dow]}</span>
                <span className="text-base font-bold">{Number(date.slice(8))}</span>
              </button>
              <div className="min-w-0 flex-1 space-y-1">
                {store.filters.ev ? events.map((event) => <EventPill key={event.id} event={event} />) : null}
                {store.filters.child
                  ? childEvents.map((event) => <ChildPill key={event.id} event={event} name={childName(data.profile.kids, event.childId)} />)
                  : null}
                {store.filters.step ? steps.map((step) => <StepPill key={step.id} step={step} />) : null}
                {store.filters.inv
                  ? shownInvisible.slice(0, 2).map((item) => (
                      <InvisiblePill key={item.key} item={item} adopted={adopted.has(`${item.date}:${item.key}`)} />
                    ))
                  : null}
                {store.filters.inv && shownInvisible.length > 2 ? (
                  <button
                    type="button"
                    className="w-full rounded-lg bg-inv px-2 py-1 text-center text-[12px] text-inv-ink"
                    onClick={() => store.setCal('day', date)}
                  >
                    👀 ほか {shownInvisible.length - 2}件（日の表示で見る）
                  </button>
                ) : null}
                {lane && lane.blocks.length > 0 ? (
                  <button
                    type="button"
                    data-testid={`wife-week-${date}`}
                    className="w-full rounded-lg border border-dashed border-line bg-[#f7f4ef] px-2 py-1 text-left text-[12px] text-muted"
                    onClick={() => store.setCal('day', date)}
                  >
                    推定・{lane.blocks[0]?.title}
                    {lane.blocks.length > 1 ? ` ほか${lane.blocks.length - 1}` : ''}
                  </button>
                ) : null}
                {emptyDay(store.filters, events, steps, shownInvisible, childEvents, lane?.blocks.length ?? 0) ? (
                  <p className="px-1 py-1 text-xs text-faint">—</p>
                ) : null}
              </div>
            </div>
          )
        })}
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
  const laneKeys = new Set((lane?.blocks ?? []).map((block) => block.invisibleKey).filter((key): key is string => Boolean(key)))
  const dadInvisible = invisible.filter((item) => !laneKeys.has(item.key))
  const adopted = adoptedKeys(data.steps)
  const minutes = DAILY_TASKS.reduce((sum, task) => sum + task.minutes, 0)

  return (
    <div data-testid="day-view">
      <DateBar
        label={`${formatMd(store.day)}${store.day === store.today ? ' 今日' : ''}`}
        onPrev={() => store.shiftDay(-1)}
        onNext={() => store.shiftDay(1)}
      />
      {store.filters.inv ? (
        <details className="rounded-xl border border-dashed border-inv-line bg-inv px-3 py-2">
          <summary className="text-[13px] font-bold text-inv-ink">
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
                <span className="text-[11px] text-muted">{task.frequency}</span>
              </button>
            ))}
          </div>
        </details>
      ) : null}
      {lane ? (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold" data-testid="wife-lane">
          <p>自分</p>
          <p className="text-muted">妻の1日・推定</p>
        </div>
      ) : null}
      {lane && !lane.workday ? <p className="mt-1 text-[12px] leading-relaxed text-muted">{lane.note}</p> : null}
      {SLOTS.map((slot) => {
        const slotEvents = store.filters.ev ? events.filter((event) => slotOf(event.time) === slot) : []
        const slotChild = store.filters.child ? childEvents.filter((event) => slotOf(event.allDay ? '' : event.startTime) === slot) : []
        const slotSteps = store.filters.step ? steps.filter((step) => slotOf(step.time) === slot) : []
        const slotInv = store.filters.inv ? dadInvisible.filter((item) => item.slot === slot) : []
        const slotWife = lane?.blocks.filter((block) => slotOf(block.time) === slot) ?? []
        if (!slotEvents.length && !slotChild.length && !slotSteps.length && !slotInv.length && !slotWife.length && slot === '終日') return null
        return (
          <div key={slot} className="mt-2">
            <p className="text-[11px] font-bold text-muted">{slot}</p>
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
        <p className="mt-2 text-[11px] leading-relaxed text-faint">
          {lane.note}
          {lane.windowLabel}
        </p>
      ) : null}
      <Button className="mt-3" size="lg" onClick={() => store.askDay(store.day)}>
        💬 この日のことをAIに相談
      </Button>
    </div>
  )
}

function DateBar({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="my-2 flex items-center justify-between">
      <button type="button" className="rounded-lg px-2 py-1 text-lg" onClick={onPrev} aria-label="前へ">
        ‹
      </button>
      <b className="text-sm">{label}</b>
      <button type="button" className="rounded-lg px-2 py-1 text-lg" onClick={onNext} aria-label="次へ">
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
      <span className="text-[11px]">{event.time || '終日'}</span>
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
      <span className="text-[11px]">{when}</span>
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
      {step.time ? <span className="text-[11px]">{step.time}</span> : null}
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
      className="w-full rounded-lg border border-dashed border-line bg-[#f7f4ef]/90 px-1.5 py-1 text-left text-[11px] leading-snug text-muted"
      onClick={() => store.openSheet({ type: 'wife', date, blockId: block.id })}
    >
      <span className="block text-[10px]">推定 {block.time}</span>
      {block.line}
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
        {item.title}
        {adopted ? '（一手にした）' : ''}
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

function emptyDay(
  filters: { ev: boolean; step: boolean; inv: boolean; child: boolean },
  events: FamEvent[],
  steps: Step[],
  invisible: { key: string }[],
  childEvents: ChildEvent[],
  wifeCount: number,
) {
  const ev = filters.ev && events.length > 0
  const step = filters.step && steps.length > 0
  const inv = filters.inv && invisible.length > 0
  const child = filters.child && childEvents.length > 0
  return !ev && !step && !inv && !child && wifeCount === 0
}
