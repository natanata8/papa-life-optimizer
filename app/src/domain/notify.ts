import { noticeBody } from '@/domain/forecast.ts'
import type { Profile } from '@/domain/types.ts'

export type Notice =
  | { kind: 'off'; text: string }
  | { kind: 'card'; time: string; body: string; target: 'review' | 'before' }

export function noticeFor(profile: Profile, pendingReview: boolean, quiet: boolean, headline: string): Notice {
  if (profile.notif === false) return { kind: 'off', text: '通知はオフです' }
  const body = noticeBody(quiet, pendingReview, headline)
  if (!body) return { kind: 'off', text: '今日は通知しません' }
  if (pendingReview) return { kind: 'card', time: '7:30', body, target: 'review' }
  return { kind: 'card', time: '18:00', body, target: 'before' }
}
