import { addDays } from './dates.ts'
import { stepsFor } from './routines.ts'
import type { AgeLabel, ChildEvent } from './types.ts'

export function shouldShowDayMode(profile: { work: string | null; home: string | null }): boolean {
  return profile.work === '自分が育休中' || profile.home === '日による・リモート'
}

export type DayStep = { id: string; title: string; minutes: number; tip?: string }
export type DayPack = { id: string; title: string; steps: DayStep[] }

const NAP_AGES = new Set<AgeLabel>(['0〜5か月', '6〜11か月', '1歳', '2歳', '3歳'])

/** 育休・在宅の昼。今夜の流れとは混ぜない。最大3つ。 */
export function dayPacks(ages: readonly string[]): DayPack[] {
  const laundry = stepsFor('laundry', [], false).map((step) => ({
    id: step.id,
    title: step.title,
    minutes: step.minutes,
    tip: step.id === 'ldy-4' ? '畳んでしまうまでが完了' : undefined,
  }))
  const packs: DayPack[] = [
    { id: 'laundry-line', title: '洗濯（干す・取り込むまで）', steps: laundry },
    { id: 'toys', title: '名もなき一手：おもちゃを戻す', steps: [{ id: 'toy-1', title: 'おもちゃを一箇所に戻す', minutes: 10 }] },
  ]
  if (ages.some((age) => NAP_AGES.has(age as AgeLabel))) {
    packs.push({
      id: 'nap',
      title: '昼寝のあとおやつまで',
      steps: [
        { id: 'nap-1', title: '昼寝を見守る', minutes: 20 },
        { id: 'nap-2', title: 'おやつを出す', minutes: 10, tip: 'おやつを出すまでが完了' },
      ],
    })
  }
  return packs.slice(0, 3)
}

export function showMorningKit(notif: boolean | null, mode: string): boolean {
  if (notif === false) return false
  if (notif === true) return true
  return mode === '帰宅前' || mode === '夜' || mode === '金曜夜'
}

/** お知らせの持ち物だけ。行事の遠足はここには出さない。 */
export function morningKitLine(events: readonly { date: string; items: string[]; category?: string; title: string }[], today: string): string | null {
  const tomorrow = addDays(today, 1)
  const items = [
    ...new Set(
      events
        .filter((event) => (event.date === today || event.date === tomorrow) && (event.category === '持ち物' || event.items.includes('体操着') || event.title.includes('体操着')))
        .flatMap((event) => event.items),
    ),
  ]
  if (items.length === 0) return null
  const extra = items.length - 1
  return extra > 0 ? `持ち物：${items[0]}（ほか${extra}）` : `持ち物：${items[0]}`
}

export function gymNotice(today: string, childId: string): Omit<ChildEvent, 'id'> {
  return {
    childId,
    title: '体操着持参',
    date: addDays(today, 1),
    startTime: '',
    endTime: '',
    allDay: true,
    category: '持ち物',
    items: ['体操着'],
    deadline: false,
    notes: '',
    source: 'image',
  }
}
