import { addDays, mondayOf, nextDow } from '@/domain/dates.ts'
import type { SceneId } from '@/domain/types.ts'

export function sceneDateFor(scene: SceneId, answers: string[], today: string): string {
  if (scene === 'nomi') {
    const when = answers[0]
    if (when === '今日') return today
    if (when === '明日') return addDays(today, 1)
    if (when === '木曜') return nextDow(today, 4)
    if (when === '来週の金曜') return addDays(mondayOf(today), 11)
    return addDays(today, 1)
  }
  if (scene === 'week' || scene === 'me') return nextDow(today, 6)
  if (scene === 'late' || scene === 'clash') return today
  return today
}

export function placeTiming(timing: string, today: string, sceneDate: string): { date: string; time: string } {
  switch (timing) {
    case '今夜':
      return { date: today, time: '21:00' }
    case '今夜20時半':
      return { date: today, time: '20:30' }
    case 'いま':
      return { date: today, time: '' }
    case '前日':
      return { date: addDays(sceneDate, -1), time: '21:00' }
    case '当日朝':
      return { date: sceneDate, time: '07:00' }
    case '当日夜':
      return { date: sceneDate, time: '19:00' }
    case '翌朝':
      return { date: addDays(sceneDate, 1), time: '07:30' }
    case '翌朝7時':
      return { date: addDays(sceneDate, 1), time: '07:00' }
    case '土曜朝':
      return { date: nextDow(today, 6), time: '09:00' }
    case '土曜午前':
      return { date: nextDow(today, 6), time: '09:30' }
    case '土曜昼':
      return { date: nextDow(today, 6), time: '10:00' }
    case '日曜朝':
      return { date: addDays(nextDow(today, 6), 1), time: '07:00' }
    case '日曜夜':
      return { date: addDays(nextDow(today, 6), 1), time: '20:30' }
    case '週末':
      return { date: nextDow(today, 6), time: '10:00' }
    default:
      return { date: today, time: /^\d{2}:\d{2}$/.test(timing) ? timing : '21:00' }
  }
}
