import type { RoutineId } from './routines.ts'

export const TASK_ICONS = ['bath', 'bed', 'bag', 'tidy', 'laundry', 'dropoff', 'pickup', 'morning', 'dinner', 'hidden'] as const

export type TaskIcon = (typeof TASK_ICONS)[number]

const BY_ROUTINE: Record<RoutineId, TaskIcon> = {
  bath: 'bath',
  bedtime: 'bed',
  tomorrow: 'bag',
  dinnerClean: 'tidy',
  laundry: 'laundry',
  dropoff: 'dropoff',
  pickup: 'pickup',
  morning: 'morning',
}

export function taskIcon(id: RoutineId): TaskIcon {
  return BY_ROUTINE[id]
}

export type MarkName =
  | TaskIcon
  | 'plan'
  | 'clock'
  | 'warning'
  | 'consult'
  | 'outing'
  | 'drink'
  | 'me'
  | 'thought'
  | 'talk'
  | 'child'

/** 予定や相談の見出しから、同じ家の仕事の印を選ぶ。 */
export function titleIcon(title: string): MarkName {
  if (/風呂|湯船|保湿/.test(title)) return 'bath'
  if (/寝かし|布団/.test(title) || /寝/.test(title)) return 'bed'
  if (/持|準備|遠足|弁当/.test(title)) return 'bag'
  if (/片付|食器|シンク/.test(title)) return 'tidy'
  if (/洗濯/.test(title)) return 'laundry'
  if (/送り|登園/.test(title)) return 'dropoff'
  if (/迎/.test(title)) return 'pickup'
  if (/朝/.test(title)) return 'morning'
  if (/夕食|夕飯|ごはん|食事/.test(title)) return 'dinner'
  if (/見えない/.test(title)) return 'hidden'
  return 'plan'
}

export function chipIcon(label: string): MarkName {
  if (/子|歳/.test(label)) return 'child'
  if (/風呂|湯/.test(label)) return 'bath'
  if (/寝/.test(label)) return 'bed'
  if (/持|準備|遠足/.test(label)) return 'bag'
  if (/片付/.test(label)) return 'tidy'
  if (/洗濯/.test(label)) return 'laundry'
  if (/迎/.test(label)) return 'pickup'
  if (/送り|登園/.test(label)) return 'dropoff'
  if (/朝/.test(label)) return 'morning'
  if (/夕|ごはん|食事/.test(label)) return 'dinner'
  if (/見えない/.test(label)) return 'hidden'
  if (/帰宅|遅れ|時/.test(label)) return 'clock'
  if (/重な/.test(label)) return 'warning'
  return 'consult'
}

const SCENE_ICON = {
  late: 'clock',
  week: 'outing',
  nomi: 'drink',
  me: 'me',
  tired: 'thought',
  clash: 'talk',
} as const

export function sceneIcon(id: string): MarkName {
  return SCENE_ICON[id as keyof typeof SCENE_ICON] ?? 'consult'
}
