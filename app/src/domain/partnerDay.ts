import { childName } from '@/domain/childEvents.ts'
import { DAYTIME_TASKS } from '@/domain/daytime-tasks.ts'
import { dowIndex } from '@/domain/dates.ts'
import { SLOT_TIME, invisibleOn } from '@/domain/invisible.ts'
import { hasDaycare, hasSmallChild, returnInfo } from '@/domain/profile.ts'
import type { ChildEvent, FamEvent, Profile } from '@/domain/types.ts'

export type PartnerBlock = {
  id: string
  time: string
  title: string
  line: string
  detail: string
  thanks: string
  minutes: number
  taskId: string | null
  invisibleKey: string | null
}

export type PartnerDay = {
  workday: boolean
  windowLabel: string
  note: string
  blocks: PartnerBlock[]
}

function daytime(id: string) {
  return DAYTIME_TASKS.find((item) => item.id === id) ?? null
}

function dadAtWork(date: string, profile: Profile): boolean {
  if (profile.work === '自分が育休中') return false
  const weekend = dowIndex(date) === 0 || dowIndex(date) === 6
  if (profile.offDad === '土日') return !weekend
  if (profile.offDad === '平日') return weekend
  return !weekend
}

function inWindow(time: string, start: string, end: string): boolean {
  return time >= start && time < end
}

function rank(id: string): number {
  if (id === 'pickup') return 0
  if (id === 'dropoff') return 1
  if (id.startsWith('child-')) return 2
  return 3
}

export function partnerDay(
  date: string,
  profile: Profile,
  events: FamEvent[],
  childEvents: ChildEvent[],
  hidden: Record<string, true>,
  today: string,
): PartnerDay {
  const back = returnInfo(profile.home)?.back ?? null
  const start = '08:00'
  const end = back ?? '19:00'
  const windowLabel = back ? `${start}〜${end}` : `${start}〜${end}（帰宅時刻は未設定）`
  if (!dadAtWork(date, profile)) {
    return { workday: false, windowLabel, note: 'この日は自分の休みです。日中の推定は出していません。', blocks: [] }
  }

  const blocks: PartnerBlock[] = []
  const schools = profile.kids.map((kid) => kid.school).filter((school): school is NonNullable<typeof school> => Boolean(school))
  const preschool = profile.kids.some((kid) => kid.age !== null && kid.age >= 3 && kid.age <= 5 && kid.school !== 'まだ家で' && kid.school !== '小学校')
  const commute = profile.work !== '両方フルタイム' && (hasDaycare(profile) || preschool)
  const commuteWhy = hasDaycare(profile)
    ? `園に通っている子がいます（${schools.join('・')}）。`
    : '3〜5歳の子がいます。園は未設定なので、通園する時間帯として見ています。'
  if (commute) {
    const drop = daytime('yu-229')
    blocks.push({
      id: 'dropoff',
      time: '08:20',
      title: '登園の送り',
      line: 'たぶんこの時間は、登園の送りです。',
      detail: `${commuteWhy}タスク一覧の「${drop?.title ?? '登園の送りをする'}」（${drop?.frequency ?? '平日朝'}、約${drop?.minutes ?? 22}分）を時刻の目安にしています。誰が送るかは決めていません。`,
      thanks: '今朝の送り、ありがとう。',
      minutes: drop?.minutes ?? 22,
      taskId: 'yu-229',
      invisibleKey: null,
    })
    if (inWindow('16:30', start, end)) {
      const pick = daytime('yu-230')
      blocks.push({
        id: 'pickup',
        time: '16:30',
        title: '降園の迎え',
        line: 'たぶんこの時間は、降園の迎えです。',
        detail: `帰宅の目安は${profile.home || '未設定'}です。この時刻は、まだ自分の仕事時間として見ています。タスク一覧の「${pick?.title ?? '降園の迎えをする'}」（${pick?.frequency ?? '平日夕方'}、約${pick?.minutes ?? 22}分）からの推定です。`,
        thanks: '今日もお迎えありがとう。',
        minutes: pick?.minutes ?? 22,
        taskId: 'yu-230',
        invisibleKey: null,
      })
    }
  }

  for (const event of childEvents.filter((item) => item.date === date)) {
    const time = event.allDay || !event.startTime ? '10:00' : event.startTime.slice(0, 5)
    if (!inWindow(time, start, end)) continue
    const who = childName(profile.kids, event.childId)
    const label = who ? `${who}の${event.title}` : event.title
    blocks.push({
      id: `child-${event.id}`,
      time,
      title: event.title,
      line: `たぶんこの時間は、${label}です。`,
      detail: '子どもの予定にある時間です。付き添う人が誰かは推定で、登録された担当ではありません。',
      thanks: `今日の${event.title}、ありがとう。`,
      minutes: 30,
      taskId: null,
      invisibleKey: null,
    })
  }

  for (const item of invisibleOn(date, profile, events, hidden, today)) {
    if (item.slot !== '日中') continue
    const time = SLOT_TIME[item.slot]
    if (!inWindow(time, start, end)) continue
    const short = item.title.split('：')[0] ?? item.title
    blocks.push({
      id: `inv-${item.key}`,
      time,
      title: short,
      line: `たぶんこの時間は、${short}です。`,
      detail: `${item.rel}。見えない仕事からの推定です。チェックも、担当の確定もしません。`,
      thanks: '今日も家のこと、ありがとう。',
      minutes: 10,
      taskId: null,
      invisibleKey: item.key,
    })
  }

  const homeYoung = hasSmallChild(profile) && profile.kids.some((kid) => kid.age !== null && kid.age <= 2 && kid.school !== '保育園' && kid.school !== '幼稚園')
  if (homeYoung && inWindow('12:00', start, end)) {
    const meal = daytime('yu-198')
    blocks.push({
      id: 'meal',
      time: '12:00',
      title: '食事の見守り',
      line: 'たぶんこの時間は、食事の見守りです。',
      detail: `小さい子がいて、園の予定が無い時間です。タスク一覧の「${meal?.title ?? '食べるペースを見守り声かけする'}」（${meal?.frequency ?? '毎食'}）を目安にしています。誰がやるかは決めていません。`,
      thanks: '今日も家のこと、ありがとう。',
      minutes: meal?.minutes ?? 20,
      taskId: meal?.id ?? null,
      invisibleKey: null,
    })
  }

  const kept = [...blocks].sort((a, b) => rank(a.id) - rank(b.id) || a.time.localeCompare(b.time)).slice(0, 4)
  kept.sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id))
  return {
    workday: true,
    windowLabel,
    note: '仕事中の家の側を、タスク一覧と予定から見ています。入力された予定ではありません。',
    blocks: kept,
  }
}

export function pickupThanks(day: PartnerDay): string {
  void day
  return '今日も家のこと、ありがとう。'
}
