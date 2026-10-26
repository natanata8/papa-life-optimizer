import { addDays, dayName, mondayOf } from '@/domain/dates.ts'
import { invisibleOn } from '@/domain/invisible.ts'
import type { Behind, FamEvent, Profile, SceneId } from '@/domain/types.ts'

export function behindFor(
  scene: SceneId,
  sceneDate: string,
  today: string,
  profile: Profile,
  events: FamEvent[],
  hidden: Record<string, true>,
): Behind {
  if (scene === 'nomi') {
    return {
      why: `${dayName(sceneDate, today)}の前後の裏側（カレンダーより）`,
      lines: linesFor([sceneDate, addDays(sceneDate, 1)], today, profile, events, hidden),
    }
  }
  if (scene === 'late') {
    return {
      why: '今夜、家に残る段取り',
      lines: linesFor([today, addDays(today, 1)], today, profile, events, hidden).slice(0, 4),
    }
  }
  if (scene === 'clash') {
    return {
      why: '今夜、家に残る段取り',
      lines: linesFor([today, addDays(today, 1)], today, profile, events, hidden).slice(0, 4),
    }
  }
  if (scene === 'tired') {
    const start = mondayOf(today)
    const dates = Array.from({ length: 7 }, (_, index) => addDays(start, index))
    return {
      why: '今週、裏で動いている見えない仕事（誰がやっているかは決めつけません）',
      lines: linesFor(dates, today, profile, events, hidden).slice(0, 4),
    }
  }
  const saturday = sceneDate
  const sunday = addDays(saturday, 1)
  return {
    why: 'この週末の予定と裏側（カレンダーより）',
    lines: linesFor([saturday, sunday], today, profile, events, hidden),
  }
}

function linesFor(
  dates: string[],
  today: string,
  profile: Profile,
  events: FamEvent[],
  hidden: Record<string, true>,
): string[] {
  const lines: string[] = []
  for (const date of dates) {
    for (const item of invisibleOn(date, profile, events, hidden, today)) {
      lines.push(`${dayName(date, today)}：${item.title}`)
    }
    for (const event of events.filter((item) => item.date === date)) {
      lines.push(`${dayName(date, today)}：予定 ${event.title}`)
    }
  }
  return lines
}

export function gomiAround(sceneDate: string, profile: Profile, events: FamEvent[], hidden: Record<string, true>, today: string): boolean {
  return [sceneDate, addDays(sceneDate, 1)].some((date) =>
    invisibleOn(date, profile, events, hidden, today).some((item) => item.def === 'gomi'),
  )
}
