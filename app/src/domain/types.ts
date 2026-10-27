export type SceneId = 'late' | 'week' | 'nomi' | 'me' | 'tired' | 'clash'

export type StepKind =
  | '今やる'
  | '先にやる'
  | '後回し'
  | 'やらない'
  | '休む'
  | '事前に伝える'
  | '置き換える'
  | '後でフォロー'

export type ToneStep = {
  タイトル: string
  なぜ今: string
  種類: StepKind
  タイミング: string
  タスク分解ステップ: string[]
}

export type ToneAnswer = {
  状況整理: string
  気づき: string
  一手: ToneStep[]
  声かけ例: string
  明日やること: string
  questions: string[]
  safety_flag: boolean
}

export type Mode = '朝' | '昼' | '帰宅前' | '夜' | '金曜夜'

export type Tab = 'home' | 'do' | 'out' | 'consult' | 'cal' | 'profile' | 'review'

export type Pronoun = '俺' | '僕' | '自分' | ''

export type AgeLabel =
  | '妊娠中'
  | '0〜5か月'
  | '6〜11か月'
  | '1歳'
  | '2歳'
  | '3歳'
  | '4歳'
  | '5歳'
  | '小1〜2'
  | '小3〜4'
  | '小5〜6'

export type School = '保育園' | '幼稚園' | '小学校' | 'まだ家で'

export type Kid = {
  id: string
  name: string
  ageLabel: AgeLabel | null
  age: number | null
  school: School | null
  schoolName: string
  birthday: string | null
}

export type ChildCategory = '行事' | '持ち物' | '提出物' | '通院・健診' | '習い事' | 'お休み' | 'その他'

export type ChildEventSource = 'manual' | 'image'

export type ChildEvent = {
  id: string
  childId: string
  title: string
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  category: ChildCategory
  items: string[]
  deadline: boolean
  notes: string
  source: ChildEventSource
}

export const CHILD_CATEGORIES: ChildCategory[] = ['行事', '持ち物', '提出物', '通院・健診', '習い事', 'お休み', 'その他']

export type GomiKind = '可燃' | 'プラ' | '資源'

export type Profile = {
  kids: Kid[]
  work: string | null
  offDad: string | null
  offPartner: string | null
  gomi: Record<GomiKind, number[]>
  shop: number | null
  home: string | null
  car: string | null
  area: string | null
  support: string[]
  outsource: string[]
  allergy: string | null
  pstate: string | null
  lesson: string | null
  partner: string
  pronoun: Pronoun
  showInv: boolean
  notif: boolean | null
  usual: string[]
  leaveAt: string | null
}

export type NiceKind = '誕生日' | '記念日' | '美容院' | 'ネイル' | 'その他'

export type NiceRecurrence = 'yearly' | 'monthly' | 'weekly'

export type NiceEvent = {
  id: string
  kind: NiceKind
  title: string
  date: string
  recurrence: NiceRecurrence | null
  note: string
}

export const NICE_KINDS: NiceKind[] = ['誕生日', '記念日', '美容院', 'ネイル', 'その他']

export type EventKind = 'pickup' | 'nomikai' | 'ensoku' | 'kisei' | 'other'

export type FamEvent = {
  id: string
  date: string
  time: string
  title: string
  who: string
  kind: EventKind
}

export type Step = {
  id: string
  suggestionId: string | null
  date: string
  time: string
  title: string
  why: string
  scene: string
  source: string
  status: 'good' | 'meh' | null
  reason: string
  taskId: string | null
  invisibleKey: string | null
  breakdown: string[]
  kind: string
}

export type Memory = {
  id: string
  date: string
  text: string
}

export type Suggestion = {
  id: string
  title: string
  date: string
  time: string
  why: string
  scene: string
  source: string
  taskId: string | null
  invisibleKey: string | null
  breakdown: string[]
  kind: string
}

export type Behind = {
  why: string
  lines: string[]
}

export type ConsultRetry = {
  scene: SceneId | null
  answers: string[]
  entry: string
  userText: string
  sceneTitle?: string
  care?: boolean
}

export type TakenRoutine = {
  routineId: string
  at: string
  checked: string[]
  sharedAt?: string
  partial?: string[]
  extra?: { id: string; title: string; minutes: number; tip?: string }[]
}

export type ChatMessage =
  | { id: string; role: 'me'; text: string }
  | { id: string; role: 'context'; chips: string[] }
  | { id: string; role: 'bot'; text: string; scenes?: boolean; safety?: 'stop'; selfHarm?: boolean; retry?: ConsultRetry }
  | {
      id: string
      role: 'answer'
      answer: ToneAnswer
      suggestionIds: string[]
      behind: Behind
      used: string[]
      sample: boolean
      care?: boolean
      selfHarm?: boolean
    }

export type ConsultThread = {
  id: string
  at: string
  title: string
  preview: string
  messages: ChatMessage[]
}

export type ConsultationRecord = {
  id: string
  createdAt: string
  scene: string
  entry: string
  safety: boolean
  answer: ToneAnswer | null
}

export type AcceptPhase = 'telling' | 'done' | 'passed' | 'later'

export type AcceptState = {
  phase: AcceptPhase
  line?: string
  small?: boolean
}

export type Persisted = {
  version: 1
  onboarded: boolean
  profile: Profile
  events: FamEvent[]
  niceEvents: NiceEvent[]
  childEvents: ChildEvent[]
  steps: Step[]
  memories: Memory[]
  notes: Record<string, string>
  hidden: Record<string, true>
  chat: ChatMessage[]
  suggestions: Record<string, Suggestion>
  dismiss: Record<string, true>
  consultations: ConsultationRecord[]
  threads: ConsultThread[]
  lifted: string[]
  /** 日付|時間帯 → 決めたあとの段階。パスは記録ではなく、その日の表示だけ。 */
  accept: Record<string, AcceptState>
  taken: Record<string, TakenRoutine[]>
  seenWelcome: boolean
}

export const GOMI_KINDS: GomiKind[] = ['可燃', 'プラ', '資源']

export const AGES: { label: AgeLabel; years: number }[] = [
  { label: '妊娠中', years: -1 },
  { label: '0〜5か月', years: 0 },
  { label: '6〜11か月', years: 0 },
  { label: '1歳', years: 1 },
  { label: '2歳', years: 2 },
  { label: '3歳', years: 3 },
  { label: '4歳', years: 4 },
  { label: '5歳', years: 5 },
  { label: '小1〜2', years: 7 },
  { label: '小3〜4', years: 9 },
  { label: '小5〜6', years: 11 },
]

export const MODES: Mode[] = ['朝', '昼', '帰宅前', '夜', '金曜夜']

export const MODE_META: Record<Mode, { time: string; where: string; hi: string; sub: string }> = {
  朝: { time: '07:40', where: '通勤電車', hi: 'おはようございます。', sub: '電車の中で30秒だけ。' },
  昼: { time: '12:20', where: '昼休み', hi: 'おつかれさまです。', sub: '誘われたら、返事の前にどうぞ。' },
  帰宅前: { time: '18:40', where: '会社を出る前', hi: 'おつかれさま。', sub: '帰る前に1つだけ。' },
  夜: { time: '22:10', where: '寝かしつけのあと', hi: '今日もおつかれさまでした。', sub: '明日の準備を1つだけ。' },
  金曜夜: { time: '21:30', where: '金曜の夜', hi: '1週間おつかれさまでした。', sub: '週末のこと、今のうちに。' },
}

export const REASONS: Record<'good' | 'meh', string[]> = {
  good: ['喜ばれた', '自分もラクだった', 'またやりたい'],
  meh: ['タイミングが悪かった', '伝え方が微妙', 'そもそも違った', 'できなかった'],
}

export const NOTE_OPTIONS = ['たぶん妻', '自分', '交代', 'わからない'] as const
