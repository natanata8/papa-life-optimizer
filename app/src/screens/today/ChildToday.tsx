import { Button } from '@/components/ui/button.tsx'
import { useStore } from '@/app/store.tsx'
import { childName, eveningBringLines } from '@/domain/childEvents.ts'

const EVENING = new Set(['帰宅前', '夜', '金曜夜'])

export function ChildToday() {
  const store = useStore()
  const data = store.data
  if (!data) return null
  const todayEvents = data.childEvents
    .filter((event) => event.date === store.today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const reminders = EVENING.has(store.mode) ? eveningBringLines(data.childEvents, data.profile.kids, store.today) : []

  return (
    <section className="mt-4" data-testid="today-children">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">子どもの予定</h2>
        <Button size="sm" variant="ghost" data-testid="child-open" onClick={() => store.openSheet({ type: 'children' })}>
          一覧
        </Button>
      </div>
      {todayEvents.length === 0 && reminders.length === 0 ? (
        <div className="mt-2">
          <p className="text-[13px] text-muted">今日の園・学校の予定はまだありません。</p>
          <button
            type="button"
            data-testid="child-empty-photo"
            className="mt-2 inline-flex min-h-11 items-center rounded-xl bg-accent-soft px-3 text-[13px] font-bold text-margin"
            onClick={() => store.openSheet({ type: 'children', image: true })}
          >
            📷 お便りを撮って入れる
          </button>
        </div>
      ) : null}
      {todayEvents.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {todayEvents.map((event) => {
            const name = childName(data.profile.kids, event.childId)
            return (
              <button
                key={event.id}
                type="button"
                className="w-full rounded-[14px] bg-child px-3 py-2.5 text-left text-child-ink"
                onClick={() => store.openSheet({ type: 'children', editId: event.id })}
              >
                <p className="text-[15px] font-bold">
                  {event.allDay || !event.startTime ? '終日' : event.startTime} {event.title}
                </p>
                <p className="mt-0.5 text-[12px]">
                  {[name, event.category].filter(Boolean).join(' · ')}
                  {event.items.length > 0 ? ` · 持ち物 ${event.items.join('、')}` : ''}
                </p>
              </button>
            )
          })}
        </div>
      ) : null}
      {reminders.length > 0 ? (
        <div className="mt-2 rounded-xl border border-line bg-sand px-3 py-2.5" data-testid="bring-reminder">
          {reminders.map((line) => (
            <p key={line} className="text-[13px] leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  )
}
