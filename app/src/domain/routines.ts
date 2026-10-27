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

export const ROUTINES: Routine[] = [
  {
    id: 'bath',
    title: 'お風呂',
    defaultAt: '19:40',
    minutes: 30,
    freedKind: 'bath',
    steps: [
      { id: 'bath-1', title: 'お湯をためて温度を見る', minutes: 3, offsetMin: 0, tip: '40℃前後', taskId: 'yu-106' },
      { id: 'bath-2', title: 'パジャマ・おむつ・タオルを脱衣所に出す', minutes: 3, offsetMin: 3, taskId: 'yu-105' },
      { id: 'bath-3', title: '下の子から洗う：頭→体', minutes: 10, offsetMin: 6, tip: '顔は最後にガーゼで拭くと泣きにくい', taskId: 'yu-109', forAges: YOUNG },
      { id: 'bath-4', title: '湯船で温まる', minutes: 8, offsetMin: 16, tip: '5〜10分。上の子は湯船で待ってもらう', taskId: 'yu-110' },
      { id: 'bath-5', title: '上がったら保湿・着替え', minutes: 5, offsetMin: 24, tip: '体がしっとりしているうち（3分以内）に', taskId: 'yu-111' },
      { id: 'bath-6', title: '髪を乾かす', minutes: 5, offsetMin: 29, taskId: 'yu-112' },
      { id: 'bath-7', title: '歯みがきの仕上げ', minutes: 5, offsetMin: 34, taskId: 'yu-117' },
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
  if (step.id === 'bath-3' && ages.includes('1歳')) return '下の子（1歳）から洗う：頭→体'
  return step.title
}

export function rowTitle(id: RoutineId, ages: AgeLabel[], ensoku = false): string {
  if (id === 'bath') return ages.length >= 2 ? 'お風呂（2人とも）' : 'お風呂'
  if (id === 'tomorrow' && ensoku) return '明日の遠足の持ち物'
  if (id === 'bedtime' && ages.length >= 2) return '寝かしつけ'
  return routineById(id).title
}

export function rowNote(id: RoutineId, ages: AgeLabel[], ensoku = false): string {
  const routine = routineById(id)
  const steps = stepsFor(id, ages, ensoku)
  if (id === 'bedtime' && ages.length >= 2) return `約${routine.minutes}分・2人いっしょ`
  return `約${routine.minutes}分・${steps.length}つの手順`
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
  if (partial && partial.length > 0) {
    const steps = stepsFor(routineId, ages, ensoku)
    return partial.reduce((sum, id) => sum + (steps.find((step) => step.id === id)?.minutes ?? 0), 0)
  }
  return FREED_MIN[routineById(routineId).freedKind]
}

export function shareLine(input: { titles: string[]; pronoun: Pronoun; back: string | null }): string {
  const back = input.back ? `${input.back}に帰ります。` : ''
  if (input.titles.length === 0) return back || '今夜の家のことは、帰ってから話すね。'
  const list = input.titles.join('と、')
  const who = input.pronoun ? `${input.pronoun}が` : ''
  return `今夜は${list}は${who}やるね。${back}`
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
