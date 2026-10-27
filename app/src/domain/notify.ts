import { addDays, dayName } from '@/domain/dates.ts'
import { beforeLeaving, invisibleOn } from '@/domain/invisible.ts'
import { returnInfo } from '@/domain/profile.ts'
import type { FamEvent, Mode, Profile, Step } from '@/domain/types.ts'

export type Notice =
  | { kind: 'off'; text: string }
  | { kind: 'card'; time: string; body: string; target: 'review' | 'before' | 'calendar' | 'weekend' }

export function noticeFor(
  mode: Mode,
  today: string,
  profile: Profile,
  events: FamEvent[],
  steps: Step[],
  hidden: Record<string, true>,
): Notice {
  if (profile.notif === false) return { kind: 'off', text: '通知はオフです' }
  const pending = steps.filter((step) => step.date < today && !step.status)
  if (mode === '朝') {
    if (pending.length === 0) return { kind: 'off', text: '今朝の通知はありません' }
    return {
      kind: 'card',
      time: '7:30',
      body: '昨日の夕方、晴れにできた？',
      target: 'review',
    }
  }
  if (mode === '昼') {
    return { kind: 'off', text: '昼は通知しません。誘われた時に自分で開く時間帯です' }
  }
  if (mode === '帰宅前') {
    const info = returnInfo(profile.home)
    if (!info) {
      return { kind: 'off', text: '帰宅時間が「日による」か未設定なので、帰る前の通知は送っていません' }
    }
    const plan = beforeLeaving(invisibleOn(today, profile, events, hidden, today))
    return { kind: 'card', time: info.notify, body: `帰る前に1つだけ：${plan.title}`, target: 'before' }
  }
  if (mode === '夜') {
    const tomorrow = events.find((event) => event.date === addDays(today, 1))
    if (!tomorrow) return { kind: 'off', text: '今夜の通知はありません' }
    const related = [...invisibleOn(today, profile, events, hidden, today), ...invisibleOn(addDays(today, 1), profile, events, hidden, today)].filter(
      (item) => item.eventId,
    ).length
    return {
      kind: 'card',
      time: '21:00',
      body: `明日は「${tomorrow.title}」。前後の段取りが${related}件あります`,
      target: 'calendar',
    }
  }
  const weekend = events.filter((event) => event.date === addDays(today, 1) || event.date === addDays(today, 2))
  const extra = weekend.length > 0 ? `${dayName(weekend[0].date, today)}は「${weekend[0].title}」があります` : '予定はまだ空いています'
  return { kind: 'card', time: '21:00', body: `週末どうする？${extra}`, target: 'weekend' }
}
