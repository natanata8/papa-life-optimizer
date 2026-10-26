import { addDays, formatMd, parseYmd } from '@/domain/dates.ts'
import type { NiceEvent, NiceKind, NiceRecurrence } from '@/domain/types.ts'

export type UpcomingNice = NiceEvent & { occurrence: string }

export function upcomingNice(events: NiceEvent[], today: string, days = 7): UpcomingNice[] {
  const end = addDays(today, days)
  return events
    .map((event) => {
      const occurrence = nextOnOrAfter(event.date, today, event.recurrence)
      return occurrence ? { ...event, occurrence } : null
    })
    .filter((event): event is UpcomingNice => Boolean(event && event.occurrence <= end))
    .sort((a, b) => a.occurrence.localeCompare(b.occurrence))
}

export function careHint(event: UpcomingNice, today: string): { hint: string; line: string } | null {
  if (event.kind !== '美容院' && event.kind !== 'ネイル') return null
  const when = event.occurrence === today ? '今日' : event.occurrence === addDays(today, 1) ? '明日' : null
  if (!when) return null
  const what = event.kind === '美容院' ? '美容院' : 'ネイル'
  const line =
    event.kind === '美容院'
      ? when === '今日'
        ? '今日カットやったん？似合ってる。'
        : '明日美容院だね。終わったらどうだったか教えて。'
      : when === '今日'
        ? '今日ネイル変えたん？見せて。'
        : '明日ネイルだね。帰ったら見せて。'
  return {
    hint: `${when}は${what}の日。帰ったら一言触れてみよう`,
    line,
  }
}

export function recurrenceLabel(recurrence: NiceRecurrence | null): string {
  if (recurrence === 'yearly') return '毎年'
  if (recurrence === 'monthly') return '毎月'
  if (recurrence === 'weekly') return '毎週'
  return ''
}

export function niceSummary(event: UpcomingNice, today: string): string {
  const repeat = recurrenceLabel(event.recurrence)
  const bits = [formatMd(event.occurrence), event.kind, event.title]
  if (repeat) bits.push(repeat)
  if (event.occurrence === today) bits.push('今日')
  return bits.join(' · ')
}

const KIND_PLACEHOLDER: Record<NiceKind, string> = {
  誕生日: '例：下の子の誕生日',
  記念日: '例：結婚記念日',
  美容院: '例：妻のカット',
  ネイル: '例：ネイル',
  その他: '例：資格の試験日',
}

export function nicePlaceholder(kind: NiceKind): string {
  return KIND_PLACEHOLDER[kind]
}

function nextOnOrAfter(anchor: string, today: string, recurrence: NiceRecurrence | null): string | null {
  if (!recurrence) return anchor >= today ? anchor : null
  let cursor = anchor
  for (let i = 0; i < 80 && cursor < today; i += 1) {
    cursor = step(cursor, recurrence)
  }
  return cursor >= today ? cursor : null
}

function step(ymd: string, recurrence: NiceRecurrence): string {
  const date = parseYmd(ymd)
  if (recurrence === 'weekly') date.setDate(date.getDate() + 7)
  if (recurrence === 'monthly') date.setMonth(date.getMonth() + 1)
  if (recurrence === 'yearly') date.setFullYear(date.getFullYear() + 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
