import { addDays } from '@/domain/dates.ts'

export function googleCalendarUrl(title: string, date: string, time: string, details: string): string {
  const compact = date.replace(/-/g, '')
  let dates: string
  if (time) {
    const start = `${time.replace(':', '')}00`
    const [hour, minute] = time.split(':').map(Number)
    const endTotal = hour * 60 + minute + 30
    const end = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}${String(endTotal % 60).padStart(2, '0')}00`
    dates = `${compact}T${start}/${compact}T${end}`
  } else {
    dates = `${compact}/${addDays(date, 1).replace(/-/g, '')}`
  }
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `【一手】${title}`,
    details: `tONE（仮）の一手：${details}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${dates}`
}

export function lineShareUrl(text: string): string {
  return `https://line.me/R/share?text=${encodeURIComponent(text)}`
}

export function downloadIcs(title: string, date: string, time: string): void {
  const compact = date.replace(/-/g, '')
  const stamp = time ? `${time.replace(':', '')}00` : '000000'
  const start = time ? `DTSTART:${compact}T${stamp}` : `DTSTART;VALUE=DATE:${compact}`
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//tONE//JA',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@tone`,
    `DTSTAMP:${compact}T000000`,
    start,
    `SUMMARY:【一手】${title.replace(/\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const link = document.createElement('a')
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
  link.href = url
  link.download = 'tone-ippo.ics'
  link.click()
  URL.revokeObjectURL(url)
}
