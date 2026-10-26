import { addDays } from '@/domain/dates.ts'
import type { ChildCategory, ChildEvent, Kid } from '@/domain/types.ts'
import { CHILD_CATEGORIES } from '@/domain/types.ts'

export type ExtractCandidate = {
  title: string
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  category: ChildCategory
  items: string[]
  deadline: boolean
  confidence: number
  childGuess: string
  notes: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID.test(value)
}

export function splitItems(text: string): string[] {
  return text
    .split(/[、,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
}

export function childName(kids: Kid[], childId: string): string {
  return kids.find((kid) => kid.id === childId)?.name ?? ''
}

export function attachSeedChildren(events: ChildEvent[], kids: Kid[]): ChildEvent[] {
  if (kids.length === 0) return events
  return events.map((event) => {
    if (kids.some((kid) => kid.id === event.childId)) return event
    const slot = event.childId.startsWith('seed:') ? Number(event.childId.slice(5)) : 0
    const kid = kids[Number.isFinite(slot) ? Math.min(slot, kids.length - 1) : 0]
    return kid ? { ...event, childId: kid.id } : event
  })
}

export function eveningBringLines(events: ChildEvent[], kids: Kid[], today: string): string[] {
  const tomorrow = addDays(today, 1)
  const lines: string[] = []
  for (const event of events.filter((item) => item.date === tomorrow)) {
    const name = childName(kids, event.childId)
    const who = kids.length > 1 && name ? `${name}の` : ''
    if (event.items.length > 0) lines.push(`明日は${who}${event.title}、${event.items.join('と')}`)
    else if (event.deadline) lines.push(`明日は${who}${event.title}の期限`)
  }
  return lines
}

export function upcomingChildEvents(events: ChildEvent[], today: string, days = 21): ChildEvent[] {
  const end = addDays(today, days)
  return events
    .filter((event) => event.date >= today && event.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
}

export function matchChildId(guess: string, kids: { id: string; name: string }[]): string {
  const text = guess.trim()
  if (!text) return kids[0]?.id ?? ''
  const hit = kids.find((kid) => kid.name && (kid.name === text || text.includes(kid.name) || kid.name.includes(text)))
  return hit?.id ?? kids[0]?.id ?? ''
}

export function asCategory(value: string): ChildCategory {
  return CHILD_CATEGORIES.find((item) => item === value) ?? 'その他'
}

export function sampleExtract(today: string, kids: { id: string; name: string }[]): ExtractCandidate[] {
  const older = kids[0]
  const younger = kids[1] ?? kids[0]
  return [
    {
      title: '遠足',
      date: addDays(today, 1),
      startTime: '',
      endTime: '',
      allDay: true,
      category: '行事',
      items: ['お弁当', '水筒', 'レジャーシート'],
      deadline: false,
      confidence: 0.86,
      childGuess: older?.name ?? '上の子',
      notes: '雨のときは中止',
    },
    {
      title: '健康診断',
      date: addDays(today, 3),
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      category: '通院・健診',
      items: ['問診票'],
      deadline: false,
      confidence: 0.74,
      childGuess: younger?.name ?? '',
      notes: '',
    },
    {
      title: '連絡帳の提出',
      date: addDays(today, 5),
      startTime: '',
      endTime: '',
      allDay: true,
      category: '提出物',
      items: ['連絡帳'],
      deadline: true,
      confidence: 0.63,
      childGuess: older?.name ?? '',
      notes: '',
    },
  ]
}
