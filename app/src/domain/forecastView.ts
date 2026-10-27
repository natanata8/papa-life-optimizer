import { forecast, type Forecast, type ForecastInput } from '@/domain/forecast.ts'
import { partnerDay } from '@/domain/partnerDay.ts'
import { returnInfo } from '@/domain/profile.ts'
import type { Persisted } from '@/domain/types.ts'

export function forecastFor(data: Persisted, today: string): Forecast {
  return forecast(forecastInput(data, today))
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
