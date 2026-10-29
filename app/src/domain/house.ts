const ROOM: Record<string, string> = {
  bath: 'お風呂',
  bedtime: '寝かしつけ',
  tomorrow: '持ち物',
  dinnerClean: '片付け',
  laundry: '洗濯',
  dropoff: '送り',
  pickup: '迎え',
  morning: '朝の支度',
}

export type HouseLight = { windows: 0 | 1 | 2 | 3; sun: 0 | 1 | 2 | 3 }

/** 引き受けた数だけ窓が灯る。余白が0なら窓も太陽も出さない。太陽は1〜3段。 */
export function houseLight(input: { tasks: number; minutes: number }): HouseLight {
  const tasks = Math.max(0, Math.floor(input.tasks))
  if (input.minutes <= 0 || tasks <= 0) return { windows: 0, sun: 0 }
  const level = Math.min(3, tasks) as 1 | 2 | 3
  return { windows: level, sun: level }
}

export function takenHomeLine(ids: readonly string[]): string {
  const names = ids.map((id) => ROOM[id] ?? '家のこと')
  if (names.length === 0) return '今夜は、まだ引き受けていません'
  if (names.length === 1) return `今夜は${names[0]}を引き受けます`
  return `今夜は${names.slice(0, -1).join('と')}と${names.at(-1)}を引き受けます`
}
