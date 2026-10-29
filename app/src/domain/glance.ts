import { freedFor, type RoutineId } from './routines.ts'
import type { AgeLabel } from './types.ts'

const SHORT: Record<RoutineId, string> = {
  bath: 'お風呂',
  bedtime: '寝かしつけ',
  tomorrow: '持ち物',
  dinnerClean: '片付け',
  laundry: '洗濯',
  dropoff: '送り',
  pickup: '迎え',
  morning: '朝',
}

export function takenMargin(
  taken: readonly { routineId: string; partial?: string[] }[],
  ages: readonly AgeLabel[],
  ensoku: boolean,
): { minutes: number; detail: string } {
  const parts = taken.map((item) => ({
    label: SHORT[item.routineId as RoutineId] ?? '家のこと',
    minutes: freedFor(item.routineId as RoutineId, item.partial, [...ages], ensoku),
  }))
  const minutes = parts.reduce((sum, part) => sum + part.minutes, 0)
  return { minutes, detail: minutes === 0 ? '引き受けると戻る' : parts.map((part) => `${part.label}${part.minutes}`).join('＋') }
}

export function skyWash(input: { quiet: boolean; absorbed: boolean }): 'clear' | 'lifted' | 'dusk' {
  if (input.quiet) return 'clear'
  if (input.absorbed) return 'lifted'
  return 'dusk'
}

/** 上部の一行。引き受けたら注意報の解除、未なら時間帯の空。 */
export function glanceLine(input: { quiet: boolean; absorbed: boolean; slots: readonly { label: string; sky: string }[] }): string {
  if (input.quiet) return '今日は晴れ'
  if (input.absorbed) return '注意報はひとつ解除・この調子で大丈夫'
  const marks = input.slots.filter((slot) => slot.sky !== '晴れ').slice(0, 2)
  if (marks.length === 0) return '今夜はおおむね晴れ'
  return marks.map((slot) => `${slot.label}は${slot.sky}`).join('・')
}

export function liftLine(titles: readonly string[]): string {
  const names = titles.filter(Boolean)
  const what = names.length > 0 ? `${names.join('と')}を引き受けた。` : ''
  return `${what}山場がひとつ減りました`
}

export function rowMark(input: { taken: boolean; warning: boolean; alert: boolean }): 'くもり' | '注意報' | '警報' | '晴れ' {
  if (input.taken) return 'くもり'
  if (input.alert) return '警報'
  if (input.warning) return '注意報'
  return '晴れ'
}

export function weekGlance(skies: readonly string[]): string {
  const named = skies.filter((sky) => sky && sky !== 'none')
  if (named.length === 0) return '今週の予報は、まだありません'
  const count = (sky: string) => named.filter((item) => item === sky).length
  if (count('警報') > 0) return '今週は、備える日があります'
  if (count('くもり') >= named.length / 2) return '今週はおおむねくもり'
  if (count('晴れ') >= named.length / 2) return '今週はおおむね晴れ'
  if (count('注意報') > 0) return '今週は、備える日があります'
  return '今週は、まちまちです'
}

export function consultTelop(range: string | null, quiet: boolean): string {
  if (quiet || !range) return '今夜は、次の手だけやろう'
  return `今夜は ${range}が山場。次の手だけやろう`
}

export function capCards<T>(items: readonly T[], max = 3): { shown: T[]; rest: T[] } {
  return { shown: items.slice(0, max), rest: items.slice(max) }
}

/** 未引き受けの余白数字。紙 #fffaf4 の上で 4.5:1 以上、青より落ち着いた焦茶。 */
export const HERO_QUIET = '#736b63'

export function moreCountLabel(count: number): string {
  return `ほか${count}件`
}
