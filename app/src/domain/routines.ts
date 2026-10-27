import { FREED_MIN, type UmbrellaKind } from './freed.ts'
import type { AgeLabel, Pronoun } from './types.ts'

export type RoutineId = 'bath' | 'bedtime' | 'tomorrow' | 'dinnerClean' | 'laundry' | 'dropoff' | 'pickup' | 'morning'

export type RoutineStep = {
  id: string
  title: string
  minutes: number
  offsetMin?: number
  tip?: string
  taskId?: string
  forAges?: AgeLabel[]
}

export type Routine = {
  id: RoutineId
  title: string
  defaultAt: string
  minutes: number
  freedKind: UmbrellaKind
  steps: RoutineStep[]
}

const YOUNG: AgeLabel[] = ['0〜5か月', '6〜11か月', '1歳', '2歳']
const OLDER: AgeLabel[] = ['3歳', '4歳', '5歳', '小1〜2', '小3〜4', '小5〜6']

export const ROUTINES: Routine[] = [
  {
    id: 'bath',
    title: 'お風呂',
    defaultAt: '19:40',
    minutes: 30,
    freedKind: 'bath',
    steps: [
      { id: 'bath-1', title: 'お湯をためて温度を見る', minutes: 2, offsetMin: 0, tip: '40℃前後', taskId: 'yu-106' },
      { id: 'bath-2', title: 'パジャマ・おむつ・タオルを脱衣所に出す', minutes: 2, offsetMin: 2, taskId: 'yu-105' },
      { id: 'bath-3', title: '下の子を洗う：頭→体', minutes: 5, offsetMin: 4, tip: '顔は最後にガーゼで拭くと泣きにくい', taskId: 'yu-109', forAges: YOUNG },
      { id: 'bath-up', title: '上の子を洗う：頭→体', minutes: 5, offsetMin: 9, tip: '下の子のあと。湯船は交代で', taskId: 'yu-110', forAges: OLDER },
      { id: 'bath-4', title: '湯船で温まる', minutes: 4, offsetMin: 14, tip: '5分前後。交代で待ってもらう', taskId: 'yu-110' },
      { id: 'bath-5', title: '上がったら保湿・着替え', minutes: 5, offsetMin: 18, tip: '体がしっとりしているうち（3分以内）に', taskId: 'yu-111' },
      { id: 'bath-6', title: '髪を乾かす', minutes: 2, offsetMin: 23, taskId: 'yu-112' },
      { id: 'bath-7', title: '歯みがきの仕上げ', minutes: 5, offsetMin: 25, taskId: 'yu-117' },
    ],
  },
  {
    id: 'bedtime',
    title: '寝かしつけ',
    defaultAt: '20:30',
    minutes: 30,
    freedKind: 'party',
    steps: [
      { id: 'bed-1', title: '寝室の明るさ・室温を整える', minutes: 3, offsetMin: 0, taskId: 'yu-279' },
      { id: 'bed-2', title: '歯みがき・トイレ', minutes: 5, offsetMin: 3, taskId: 'yu-117' },
      { id: 'bed-3', title: '絵本を1冊読む', minutes: 10, offsetMin: 8, taskId: 'yu-278' },
      { id: 'bed-4', title: '電気を消して横になる', minutes: 10, offsetMin: 18, taskId: 'yu-278' },
      { id: 'bed-5', title: '寝たあと布団をかけ直す', minutes: 2, offsetMin: 28, taskId: 'yu-280' },
    ],
  },
  {
    id: 'tomorrow',
    title: '明日の持ち物',
    defaultAt: '21:00',
    minutes: 15,
    freedKind: 'prep',
    steps: [
      { id: 'tmw-1', title: '園のお知らせ・持ち物を確認', minutes: 4, offsetMin: 0, taskId: 'yu-233' },
      { id: 'tmw-2', title: '着替え・水筒・タオルをそろえる', minutes: 5, offsetMin: 4, taskId: 'yu-226' },
      { id: 'tmw-3', title: '登園バッグに入れる', minutes: 3, offsetMin: 9, taskId: 'yu-225' },
      { id: 'tmw-4', title: '記名を確認', minutes: 3, offsetMin: 12, taskId: 'yu-259' },
    ],
  },
  {
    id: 'dinnerClean',
    title: '夕食の片付け',
    defaultAt: '21:30',
    minutes: 20,
    freedKind: 'event',
    steps: [
      { id: 'din-1', title: '食べ残し・こぼしを片付ける', minutes: 5, offsetMin: 0, taskId: 'yu-200' },
      { id: 'din-2', title: '食器を洗う', minutes: 8, offsetMin: 5, taskId: 'yu-021' },
      { id: 'din-3', title: '拭いてしまう', minutes: 4, offsetMin: 13, taskId: 'yu-022' },
      { id: 'din-4', title: 'コンロ・シンクを拭く', minutes: 3, offsetMin: 17, taskId: 'yu-023' },
    ],
  },
  {
    id: 'laundry',
    title: '洗濯',
    defaultAt: '21:00',
    minutes: 40,
    freedKind: 'event',
    steps: [
      { id: 'ldy-1', title: '仕分けて回す', minutes: 5, offsetMin: 0, taskId: 'yu-025' },
      { id: 'ldy-2', title: '干す', minutes: 15, offsetMin: 40, taskId: 'yu-026' },
      { id: 'ldy-3', title: '取り込む', minutes: 5, offsetMin: 0, taskId: 'yu-027' },
      { id: 'ldy-4', title: '畳んでしまう', minutes: 10, offsetMin: 5, taskId: 'yu-028' },
    ],
  },
  {
    id: 'dropoff',
    title: '保育園の送り',
    defaultAt: '08:00',
    minutes: 30,
    freedKind: 'leave',
    steps: [
      { id: 'drop-1', title: '体調・機嫌を見る', minutes: 3, offsetMin: 0, taskId: 'yu-228' },
      { id: 'drop-2', title: '連絡帳・体温を書く', minutes: 5, offsetMin: 3, taskId: 'yu-227' },
      { id: 'drop-3', title: '送る', minutes: 15, offsetMin: 8, taskId: 'yu-229' },
      { id: 'drop-4', title: '先生への伝言を共有', minutes: 5, offsetMin: 23, taskId: 'yu-231' },
    ],
  },
  {
    id: 'pickup',
    title: 'お迎え',
    defaultAt: '16:30',
    minutes: 30,
    freedKind: 'pickup',
    steps: [
      { id: 'pick-1', title: '迎えの時刻を伝える', minutes: 2, offsetMin: 0 },
      { id: 'pick-2', title: '迎えに行く', minutes: 15, offsetMin: 2, taskId: 'yu-230' },
      { id: 'pick-3', title: '先生からの伝言を聞いて共有', minutes: 5, offsetMin: 17, taskId: 'yu-231' },
      { id: 'pick-4', title: '汚れた服を洗濯へ', minutes: 5, offsetMin: 22, taskId: 'yu-235' },
    ],
  },
  {
    id: 'morning',
    title: '朝の支度',
    defaultAt: '07:00',
    minutes: 30,
    freedKind: 'leave',
    steps: [
      { id: 'am-1', title: '体温・体調を見る', minutes: 3, offsetMin: 0, taskId: 'yu-293' },
      { id: 'am-2', title: '着替えを手伝う', minutes: 8, offsetMin: 3, taskId: 'yu-206' },
      { id: 'am-3', title: '朝ごはんの取り分け', minutes: 8, offsetMin: 11, taskId: 'yu-003' },
      { id: 'am-4', title: '水筒を入れる', minutes: 3, offsetMin: 19, taskId: 'yu-019' },
      { id: 'am-5', title: '歯みがきの仕上げ', minutes: 5, offsetMin: 22, taskId: 'yu-117' },
    ],
  },
]

export const ENSOKU_STEPS: RoutineStep[] = [
  { id: 'ensoku-1', title: 'おかずを下ごしらえする', minutes: 8, offsetMin: 0, taskId: 'yu-225' },
  { id: 'ensoku-2', title: 'リュックに持ち物を入れる', minutes: 5, offsetMin: 8, taskId: 'yu-225' },
  { id: 'ensoku-3', title: '持ち物に名前があるか見る', minutes: 2, offsetMin: 13, taskId: 'yu-259' },
]

export function routineById(id: RoutineId): Routine {
  const found = ROUTINES.find((item) => item.id === id)
  if (!found) return ROUTINES[0]
  return found
}

export function stepsFor(id: RoutineId, ages: AgeLabel[], ensoku = false): RoutineStep[] {
  const routine = routineById(id)
  const source = id === 'tomorrow' && ensoku ? ENSOKU_STEPS : routine.steps
  return source.filter((step) => !step.forAges || step.forAges.some((age) => ages.includes(age)))
}

export function stepLabel(step: RoutineStep, ages: AgeLabel[]): string {
  if (step.id === 'bath-3' && ages.includes('1歳')) return '下の子（1歳）を洗う：頭→体'
  if (step.id === 'bath-up') {
    const older = ages.filter((age) => OLDER.includes(age))
    if (older.length === 1) return `上の子（${older[0]}）を洗う：頭→体`
  }
  return step.title
}

export function shownMinutes(id: RoutineId, ages: AgeLabel[], ensoku = false, partial?: string[]): number {
  const steps = stepsFor(id, ages, ensoku)
  const picked = partial?.length ? steps.filter((step) => partial.includes(step.id)) : steps
  return picked.reduce((sum, step) => sum + step.minutes, 0)
}

export function listedSteps(
  id: RoutineId,
  ages: AgeLabel[],
  ensoku = false,
  partial?: string[],
  extra?: { id: string; minutes: number; offsetMin?: number }[],
): { id: string; minutes: number; offsetMin: number }[] {
  const steps = stepsFor(id, ages, ensoku)
  const picked = partial?.length ? steps.filter((step) => partial.includes(step.id)) : steps
  const added = (extra ?? []).map((step) => ({ id: step.id, minutes: step.minutes, offsetMin: step.offsetMin ?? 0 }))
  return stepsInTime([...picked.map((step) => ({ id: step.id, minutes: step.minutes, offsetMin: step.offsetMin ?? 0 })), ...added])
}

/** 見出しの分数と開始時刻は、画面に出ている手順そのもの。 */
export function listLabel(steps: { minutes: number; offsetMin?: number }[], at: string): { start: string; minutes: number } {
  return {
    start: firstStepAt(at, steps),
    minutes: steps.reduce((sum, step) => sum + step.minutes, 0),
  }
}

export function rowTitle(id: RoutineId, ages: AgeLabel[], ensoku = false): string {
  if (id === 'bath') return ages.length >= 2 ? 'お風呂（2人とも）' : 'お風呂'
  if (id === 'tomorrow' && ensoku) return '明日の遠足の持ち物'
  if (id === 'bedtime' && ages.length >= 2) return '寝かしつけ'
  return routineById(id).title
}

export function rowNote(
  id: RoutineId,
  ages: AgeLabel[],
  ensoku = false,
  partial?: string[],
  extra?: { id: string; minutes: number; offsetMin?: number }[],
): string {
  const steps = listedSteps(id, ages, ensoku, partial, extra)
  const minutes = steps.reduce((sum, step) => sum + step.minutes, 0)
  if (id === 'bedtime' && ages.length >= 2 && !partial?.length && !extra?.length) return `約${minutes}分・2人いっしょ`
  return `約${minutes}分・${steps.length}つの手順`
}

/** 相談の「お風呂」は、その家のお風呂の開始時刻。21:00 には置かない。 */
export function placedTime(timing: string, back: string | null): string | null {
  if (timing === 'お風呂') return rowAt('bath', back)
  return null
}

const EVENING: RoutineId[] = ['bath', 'bedtime', 'tomorrow', 'dinnerClean']
const MORNING: RoutineId[] = ['morning', 'dropoff']

export function tonightIds(mode: '朝' | '昼' | '帰宅前' | '夜' | '金曜夜'): RoutineId[] {
  if (mode === '朝') return MORNING
  if (mode === '昼') return ['pickup']
  return EVENING
}

export function plusMinutes(hhmm: string, minutes: number): string {
  const [hour, minute] = hhmm.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  const next = ((total % (24 * 60)) + 24 * 60) % (24 * 60)
  return `${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`
}

export function rowAt(id: RoutineId, back: string | null): string {
  if (!back) return routineById(id).defaultAt
  const offset = { bath: 10, bedtime: 60, tomorrow: 90, dinnerClean: 120, pickup: 0, morning: 0, dropoff: 30, laundry: 90 }[id]
  return plusMinutes(back, offset)
}

export function overlapLine(range: string, bits: string[]): string {
  const names = [...new Set(bits.map((bit) => bit.trim()).filter(Boolean))]
  if (!range || names.length === 0) return ''
  return `${range}は${names.join('と')}が重なる`
}

export function routineForPeak(noun: string, kind: string): RoutineId {
  if (kind === 'prep' || noun.includes('持') || noun.includes('弁当')) return 'tomorrow'
  if (kind === 'leave') return 'dropoff'
  if (kind === 'pickup') return 'pickup'
  if (kind === 'child') return 'morning'
  return 'bath'
}

export function freedFor(routineId: RoutineId, partial: string[] | undefined, ages: AgeLabel[], ensoku = false): number {
  const sum = shownMinutes(routineId, ages, ensoku, partial)
  if (partial && partial.length > 0) return sum
  return sum || FREED_MIN[routineById(routineId).freedKind]
}

/** その時間に自分の予定があるか。重なる家の仕事は提案しない。 */
export function dadBusy(events: { time: string; who: string; kind?: string }[], range: string): boolean {
  const hours = range.match(/\d+/g)
  if (!hours || hours.length < 2) return false
  const start = Number(hours[0])
  const end = Number(hours[1])
  return events.some((event) => {
    const mine = event.who === '自分' || event.kind === 'nomikai'
    if (!mine || !event.time) return false
    const hour = Number(event.time.slice(0, 2))
    return hour >= start && hour < end
  })
}

/** 1つずつモードの開始位置。リストのチェックと同じ配列を見る。 */
export function firstUnchecked(stepIds: string[], checked: string[]): number {
  const index = stepIds.findIndex((id) => !checked.includes(id))
  return index < 0 ? stepIds.length : index
}

export function allStepsChecked(
  taken: { routineId: string; checked: string[]; partial?: string[]; extra?: { id: string }[] }[],
  ages: AgeLabel[],
  ensoku: boolean,
): boolean {
  if (taken.length === 0) return false
  return taken.every((item) => {
    const steps = stepsFor(item.routineId as RoutineId, ages, ensoku)
    const picked = item.partial?.length ? steps.filter((step) => item.partial?.includes(step.id)) : steps
    const ids = [...picked.map((step) => step.id), ...(item.extra ?? []).map((step) => step.id)]
    return ids.length > 0 && ids.every((id) => item.checked.includes(id))
  })
}

export function routineDone(
  item: { routineId: string; checked: string[]; partial?: string[]; extra?: { id: string }[] },
  ages: AgeLabel[],
  ensoku: boolean,
): boolean {
  return allStepsChecked([item], ages, ensoku)
}

/** やるの件数は、まだ終わっていない手順があるものだけ。共有済みでは消さない。 */
export function openRoutineCount(
  taken: { routineId: string; checked: string[]; partial?: string[]; sharedAt?: string; extra?: { id: string }[] }[],
  ages: AgeLabel[],
  ensoku: boolean,
): number {
  return taken.filter((item) => !routineDone(item, ages, ensoku)).length
}

export function footerLine(takenCount: number, doneCount: number, minutes: number): string {
  if (takenCount === 0) return '引き受けると、家に余白が戻ります（目安）'
  if (doneCount > 0 && doneCount === takenCount) return `${doneCount}つ終わった → 家に${minutes}分の余白（目安）`
  return `${takenCount}つ引き受け中 → 家に${minutes}分の余白（目安）`
}

/** 見出しの開始は、見える最初の手順の時刻。 */
export function firstStepAt(at: string, steps: { offsetMin?: number }[]): string {
  if (!at || steps.length === 0) return at
  const offset = Math.min(...steps.map((step) => step.offsetMin ?? 0))
  return plusMinutes(at, offset)
}

export function extraOffsets(steps: { offsetMin?: number; minutes: number }[], count: number, minutes = 3): number[] {
  const end = steps.reduce((max, step) => Math.max(max, (step.offsetMin ?? 0) + step.minutes), 0)
  return Array.from({ length: count }, (_, index) => end + index * minutes)
}

export function stepsInTime<T extends { offsetMin?: number }>(steps: T[]): T[] {
  return [...steps].sort((a, b) => (a.offsetMin ?? 0) - (b.offsetMin ?? 0))
}

export function withoutPassed<T extends { phase: string }>(accept: Record<string, T>, date: string): Record<string, T> {
  return Object.fromEntries(Object.entries(accept).filter(([key, value]) => !(key.startsWith(`${date}|`) && value.phase === 'passed')))
}

export function shareLine(input: { titles: string[]; pronoun: Pronoun; back: string | null }): string {
  const back = input.back ? `${input.back}に帰ります。` : ''
  if (input.titles.length === 0) return back || '今夜の家のことは、帰ってから話すね。'
  const list = input.titles.join('と')
  const who = input.pronoun ? `${input.pronoun}が` : ''
  const line = `今夜の${list}は${who}やるね。${back}`
  return line.replace('はやるね', 'をやるね')
}

export function contextChips(input: { dateLabel: string; back: string | null; titles: string[]; overlap: string; ages: string[] }): string[] {
  const chips = [input.dateLabel]
  if (input.back) chips.push(`帰宅 ${input.back}`)
  if (input.titles.length) chips.push(`引き受け：${input.titles.join('・')}`)
  if (input.overlap) chips.push(input.overlap)
  if (input.ages.length) chips.push(input.ages.join('・'))
  return chips
}

export function partialChoices(ages: AgeLabel[], ensoku: boolean): { routineId: RoutineId; stepIds: string[]; title: string; note: string }[] {
  const bath = stepsFor('bath', ages, false).filter((step) => step.id === 'bath-5' || step.id === 'bath-7')
  const bag = stepsFor('tomorrow', ages, ensoku).find((step) => step.id === 'ensoku-2' || step.id === 'tmw-3')
  const choices = []
  if (bath.length) {
    const minutes = bath.reduce((sum, step) => sum + step.minutes, 0)
    choices.push({
      routineId: 'bath' as const,
      stepIds: bath.map((step) => step.id),
      title: 'お風呂のあとの保湿と歯みがきだけ',
      note: `${bath.length}つの手順・約${minutes}分・家に${minutes}分の余白（目安）`,
    })
  }
  if (bag) {
    choices.push({
      routineId: 'tomorrow' as const,
      stepIds: [bag.id],
      title: ensoku ? '明日の持ち物を「リュックに入れる」だけ' : '明日の持ち物を「バッグに入れる」だけ',
      note: `1つの手順・約${bag.minutes}分`,
    })
  }
  return choices
}

/**
 * 答えの「使った家庭の情報」は、送った時点のチップの写し。
 * 年齢チップが残っているときだけ、子どもの行を載せる。
 */
export function usedFromChips(labels: string[], chips: string[] | undefined): string[] {
  if (!chips) return [...labels]
  return labels.filter((label) => {
    if (!label.startsWith('子ども：')) return true
    const ages = label.slice('子ども：'.length).split('・').filter(Boolean)
    return ages.some((age) => chips.some((chip) => chip.includes(age)))
  })
}

/** 今夜の流れの1画面目。下のナビは数えない。 */
export function tonightFold(input: { rows: number; warning: boolean; sample: boolean }): string[] {
  const items = ['bar']
  if (input.sample) items.push('sample')
  items.push('heading')
  if (input.warning) items.push('warning')
  for (let index = 0; index < input.rows; index += 1) items.push(`row-${index}`)
  items.push('consult', 'margin', 'share', 'small')
  return items
}
