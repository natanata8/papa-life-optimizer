const DOW = ['日', '月', '火', '水', '木', '金', '土']

export function todayInTokyo(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function parseYmd(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(ymd: string, days: number): string {
  const date = parseYmd(ymd)
  date.setDate(date.getDate() + days)
  return formatYmd(date)
}

export function mondayOf(ymd: string): string {
  const date = parseYmd(ymd)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return formatYmd(date)
}

export function nextDow(today: string, dow: number): string {
  let cursor = today
  for (let i = 0; i < 7; i += 1) {
    if (parseYmd(cursor).getDay() === dow) return cursor
    cursor = addDays(cursor, 1)
  }
  return cursor
}

export function formatMd(ymd: string): string {
  const date = parseYmd(ymd)
  return `${date.getMonth() + 1}/${date.getDate()}(${DOW[date.getDay()]})`
}

export function dayName(ymd: string, today: string): string {
  if (ymd === today) return '今日'
  if (ymd === addDays(today, 1)) return '明日'
  if (ymd === addDays(today, -1)) return '昨日'
  return formatMd(ymd)
}

export function weekdayChar(ymd: string): string {
  return DOW[parseYmd(ymd).getDay()]
}

export function dowIndex(ymd: string): number {
  return parseYmd(ymd).getDay()
}

export const DOW_CHARS = DOW

export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function addMinutes(hhmm: string, delta: number): string {
  const [hour, minute] = hhmm.split(':').map(Number)
  let total = hour * 60 + minute + delta
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export function resolveToday(mode: '朝' | '昼' | '帰宅前' | '夜' | '金曜夜', realToday: string): string {
  if (mode !== '金曜夜') return realToday
  const friday = addDays(mondayOf(realToday), 4)
  return friday < realToday ? realToday : friday
}

export type Slot = '終日' | '朝' | '日中' | '夕方' | '夜'

export function slotOf(time: string): Slot {
  if (!time) return '終日'
  if (time < '10:00') return '朝'
  if (time < '16:00') return '日中'
  if (time < '19:00') return '夕方'
  return '夜'
}

export const SLOTS: Slot[] = ['終日', '朝', '日中', '夕方', '夜']
