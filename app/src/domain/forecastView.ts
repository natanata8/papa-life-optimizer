import { forecast, unknownForecast, type Forecast, type ForecastInput, type ForecastSlotId } from '@/domain/forecast.ts'
import { partnerDay } from '@/domain/partnerDay.ts'
import { returnInfo } from '@/domain/profile.ts'
import type { Persisted } from '@/domain/types.ts'

export function forecastFor(data: Persisted, date: string, today = date): Forecast {
  const future = date > today
  const has =
    data.events.some((event) => event.date === date) ||
    data.childEvents.some((event) => event.date === date) ||
    data.steps.some((event) => event.date === date)
  if (future && !has) return unknownForecast(date)
  const input = forecastInput(data, date)
  input.liftedSlots = (data.lifted ?? [])
    .filter((key) => key.startsWith(`${date}|`))
    .map((key) => key.slice(date.length + 1) as ForecastSlotId)
  return forecast(input)
}

export function forecastInput(data: Persisted, today: string): ForecastInput {
  const back = returnInfo(data.profile.home)?.back ?? null
  const lane = partnerDay(today, data.profile, data.events, data.childEvents, data.hidden, today)
  const overtime =
    data.events.some((event) => event.date === today && event.title.includes('残業')) ||
    data.steps.some((step) => step.date === today && (step.title.includes('残業') || step.scene.includes('残業'))) ||
    data.consultations.some((item) => item.entry.includes('残業') || item.scene.includes('残業'))
  return {
    today,
    returnAt: back,
    leaveAt: data.profile.leaveAt,
    usual: data.profile.usual ?? [],
    dadHome: data.profile.work === '自分が育休中',
    kidCount: data.profile.kids.length,
    events: data.events.map((event) => ({ date: event.date, time: event.time, title: event.title, kind: event.kind })),
    childEvents: data.childEvents.map((event) => ({
      date: event.date,
      startTime: event.startTime,
      allDay: event.allDay,
      title: event.title,
      items: event.items,
    })),
    lane: lane.blocks.map((block) => ({ time: block.time, title: block.title })),
    overtime,
    steps: data.steps.map((step) => ({ date: step.date, time: step.time, title: step.title, status: step.status })),
  }
}
