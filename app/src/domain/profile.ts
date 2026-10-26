import { uid } from '@/lib/utils.ts'
import type { AgeLabel, GomiKind, Kid, Mode, Profile, SceneId, School } from '@/domain/types.ts'
import { AGES } from '@/domain/types.ts'
import { addMinutes } from '@/domain/dates.ts'

export const WORK_OPTIONS = [
  '両方フルタイム',
  '片方が時短',
  '片方が専業',
  'パートナーが育休中',
  '自分が育休中',
  'その他',
] as const

export const OFF_OPTIONS = ['土日', '平日', 'シフト制', '不定期'] as const

export const RETURN_WINDOWS: { label: string; back: string | null }[] = [
  { label: '〜18時', back: '17:30' },
  { label: '18〜19時', back: '18:30' },
  { label: '19〜20時', back: '19:30' },
  { label: '20〜21時', back: '20:30' },
  { label: '21時以降', back: '21:30' },
  { label: '日による・リモート', back: null },
]

export const SCHOOL_OPTIONS: School[] = ['保育園', '幼稚園', '小学校', 'まだ家で']

export const SUPPORT_OPTIONS = [
  '実家が近い（30分以内）',
  '実家は遠い',
  'ファミサポ・一時保育',
  'シッター',
  'いない',
] as const

export const OUTSOURCE_OPTIONS = [
  '家事代行',
  'ネットスーパー・宅配',
  'ミールキット',
  '食洗機・乾燥機',
  '特になし',
] as const

export const ALLERGY_OPTIONS = ['なし', 'あり（園・学校に伝えている）', '検査中・わからない'] as const

export const PARTNER_STATE_OPTIONS = [
  '特になし',
  '妊娠中',
  '産後1年以内',
  '体調を崩しやすい時期',
  '答えない',
] as const

export const LESSON_OPTIONS = ['なし', '週1回', '週2回以上'] as const

export const CAR_OPTIONS = ['ある', 'ない', 'カーシェア・レンタル'] as const

export const AREA_OPTIONS = ['都市部（駅の近く）', '郊外', '地方'] as const

export const PARTNER_OPTIONS = ['妻', '奥さん', '嫁さん', 'ママ', '名前で'] as const

export type Privacy = '低' | '中' | '高'

export type FieldSpec = {
  key: string
  group: string
  title: string
  privacy: Privacy
  onboarding?: boolean
  multi?: boolean
  options?: readonly string[]
}

export const FIELDS: FieldSpec[] = [
  { key: 'kids', group: '家族', title: '子どもの人数と年齢', privacy: '中', onboarding: true },
  { key: 'work', group: '家族', title: '働き方', privacy: '中', onboarding: true, options: WORK_OPTIONS },
  { key: 'offDad', group: '家族', title: '自分の休み', privacy: '低', onboarding: true, options: OFF_OPTIONS },
  { key: 'offPartner', group: '家族', title: 'パートナーの休み', privacy: '低', onboarding: true, options: OFF_OPTIONS },
  { key: 'school', group: '子ども', title: '園・学校（子どもごと）', privacy: '中', options: SCHOOL_OPTIONS },
  { key: 'lesson', group: '子ども', title: '習い事', privacy: '低', options: LESSON_OPTIONS },
  { key: 'allergy', group: '子ども', title: '食物アレルギー', privacy: '高', options: ALLERGY_OPTIONS },
  { key: 'gomi', group: 'くらし', title: 'ゴミの日', privacy: '低' },
  { key: 'shop', group: 'くらし', title: '日用品の買い物の曜日', privacy: '低' },
  {
    key: 'home',
    group: '家族',
    title: 'パパの帰宅時間の目安（平日）',
    privacy: '低',
    onboarding: true,
    options: RETURN_WINDOWS.map((row) => row.label),
  },
  { key: 'car', group: 'くらし', title: '車', privacy: '低', options: CAR_OPTIONS },
  { key: 'area', group: 'くらし', title: '住まいのエリア', privacy: '中', options: AREA_OPTIONS },
  { key: 'support', group: '頼れる先', title: '頼れる人（複数可）', privacy: '中', multi: true, options: SUPPORT_OPTIONS },
  {
    key: 'outsource',
    group: '頼れる先',
    title: '使っているサービス（複数可）',
    privacy: '低',
    multi: true,
    options: OUTSOURCE_OPTIONS,
  },
  {
    key: 'pstate',
    group: 'パートナー',
    title: 'パートナーの今の状況（任意）',
    privacy: '高',
    options: PARTNER_STATE_OPTIONS,
  },
  { key: 'partner', group: 'パートナー', title: 'パートナーの呼び方', privacy: '低', options: PARTNER_OPTIONS },
]

export const PRIVACY_LABEL: Record<Privacy, string> = {
  低: '🔓 低',
  中: '🔒 中',
  高: '🔐 高',
}

export const LAZY_WHY: Record<string, string> = {
  school: '週明けの持ち物や行事の段取りを出すため',
  gomi: '前の夜に「明日はゴミの日」を出すため',
  shop: 'その日に日用品の残りチェックを出すため',
  home: '帰宅前の一手と通知の時刻を合わせるため',
  support: '抜ける日に頼れる先を一手に入れるため',
  car: '週末の行き先を、移動手段に合わせるため',
  area: '近場の行き先を出すため',
  kids: '一手を年齢に合わせるため',
  pstate: '無理のない一手にするため（答えなくてOK）',
}

export const HOME_LAZY: Record<Mode, string[]> = {
  朝: ['school', 'kids'],
  昼: ['home', 'support'],
  帰宅前: ['home', 'shop'],
  夜: ['gomi', 'school'],
  金曜夜: ['car', 'area'],
}

export const SCENE_LAZY: Record<SceneId, string[]> = {
  nomi: ['home', 'support'],
  tired: ['pstate'],
  week: ['car', 'area'],
  me: [],
  late: ['home'],
  clash: [],
}

export function emptyProfile(): Profile {
  return {
    kids: [],
    work: null,
    offDad: null,
    offPartner: null,
    gomi: { 可燃: [], プラ: [], 資源: [] },
    shop: null,
    home: null,
    car: null,
    area: null,
    support: [],
    outsource: [],
    allergy: null,
    pstate: null,
    lesson: null,
    partner: '妻',
    showInv: true,
    notif: null,
  }
}

export function isSet(profile: Profile, key: string): boolean {
  if (key === 'kids') return profile.kids.length > 0
  if (key === 'gomi') return Object.values(profile.gomi).some((days) => days.length > 0)
  if (key === 'school') return profile.kids.length > 0 && profile.kids.every((kid) => Boolean(kid.school))
  if (key === 'shop') return profile.shop !== null
  if (key === 'support') return profile.support.length > 0
  if (key === 'outsource') return profile.outsource.length > 0
  const value = profile[key as keyof Profile]
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== ''
}

export function kidName(index: number, total: number): string {
  if (total <= 1) return '子ども'
  if (total === 2) return index === 0 ? '上の子' : '下の子'
  return `${index + 1}人目`
}

export function kidsFromAges(labels: AgeLabel[]): Kid[] {
  return labels.map((label, index, all) => {
    const years = AGES.find((row) => row.label === label)?.years ?? null
    let school: School | null = null
    if (years !== null && years < 0) school = 'まだ家で'
    else if (years !== null && years >= 7) school = '小学校'
    return {
      id: uid(),
      name: kidName(index, all.length),
      ageLabel: label,
      age: years,
      school,
      schoolName: '',
      birthday: null,
    }
  })
}

export function returnInfo(home: string | null): { label: string; back: string; notify: string; open: string } | null {
  const row = RETURN_WINDOWS.find((item) => item.label === home)
  if (!row?.back) return null
  return {
    label: row.label,
    back: row.back,
    notify: addMinutes(row.back, -45),
    open: addMinutes(row.back, -35),
  }
}

export function lazyTitle(profile: Profile, key: string): string {
  if (key === 'school') {
    const kid = profile.kids.find((item) => !item.school)
    return `${kid?.name ?? '子ども'}は、どこに通っていますか？`
  }
  if (key === 'gomi') return '可燃ゴミの日は何曜日？'
  const field = FIELDS.find((item) => item.key === key)
  const title = (field?.title ?? key).replace('（複数可）', '').replace('（任意）', '').replace('（平日）', '')
  return `${title}は？`
}

export function fieldOptions(key: string): readonly string[] {
  return FIELDS.find((field) => field.key === key)?.options ?? []
}

export function hasDaycare(profile: Profile): boolean {
  return profile.kids.some((kid) => kid.school === '保育園' || kid.school === '幼稚園')
}

export function hasSmallChild(profile: Profile): boolean {
  return profile.kids.some((kid) => kid.age !== null && kid.age >= 0 && kid.age <= 2)
}

export function toggleGomi(profile: Profile, kind: GomiKind, dow: number): Profile {
  const current = profile.gomi[kind]
  const next = current.includes(dow) ? current.filter((day) => day !== dow) : [...current, dow]
  return { ...profile, gomi: { ...profile.gomi, [kind]: next } }
}

export function toggleMulti(profile: Profile, key: 'support' | 'outsource', value: string): Profile {
  const current = profile[key]
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  return { ...profile, [key]: next }
}

type ChoiceKey = 'work' | 'offDad' | 'offPartner' | 'home' | 'car' | 'area' | 'allergy' | 'pstate' | 'lesson' | 'partner'

export function setChoice(profile: Profile, key: ChoiceKey, value: string): Profile {
  if (key === 'partner') return { ...profile, partner: value }
  const current = profile[key]
  return { ...profile, [key]: current === value ? null : value }
}

export function setShop(profile: Profile, dow: number): Profile {
  return { ...profile, shop: profile.shop === dow ? null : dow }
}

export function setSchool(profile: Profile, index: number, school: School): Profile {
  return {
    ...profile,
    kids: profile.kids.map((kid, kidIndex) => (kidIndex === index ? { ...kid, school } : kid)),
  }
}

export function setKidAge(profile: Profile, index: number, label: AgeLabel): Profile {
  const years = AGES.find((row) => row.label === label)?.years ?? null
  return {
    ...profile,
    kids: profile.kids.map((kid, kidIndex) =>
      kidIndex === index ? { ...kid, ageLabel: label, age: years } : kid,
    ),
  }
}

export function addKid(profile: Profile): Profile {
  const count = profile.kids.length + 1
  const kids = profile.kids.map((kid, index) =>
    count === 2 && index === 0 ? { ...kid, name: '上の子' } : kid,
  )
  kids.push({
    id: uid(),
    name: count === 2 ? '下の子' : `${count}人目`,
    ageLabel: '1歳',
    age: 1,
    school: null,
    schoolName: '',
    birthday: null,
  })
  return { ...profile, kids }
}

export function removeKid(profile: Profile, index: number): Profile {
  return { ...profile, kids: profile.kids.filter((_, kidIndex) => kidIndex !== index) }
}

export function usedLabels(profile: Profile, scene: SceneId | null): string[] {
  const labels: string[] = []
  if (profile.kids.length > 0) {
    labels.push(`子ども：${profile.kids.map((kid) => kid.ageLabel || (kid.age !== null ? `${kid.age}歳` : '年齢未設定')).join('・')}`)
  }
  if (profile.work) labels.push(profile.work)
  if (scene === 'nomi') {
    if (profile.home) labels.push(`帰宅 ${profile.home}`)
    if (profile.support.length > 0) labels.push(`頼れる人：${profile.support.join('・')}`)
  }
  if (scene === 'late' && profile.home) labels.push(`帰宅 ${profile.home}`)
  if (scene === 'week') {
    if (profile.car) labels.push(`車：${profile.car}`)
    if (profile.offPartner) labels.push(`パートナーの休み：${profile.offPartner}`)
  }
  if (scene === 'tired' && profile.pstate && !['特になし', '答えない'].includes(profile.pstate)) {
    labels.push(`パートナー：${profile.pstate}`)
  }
  return labels
}

export function nextLazyKey(profile: Profile, mode: Mode, lock: string | null, dismissed: boolean): string | null {
  if (dismissed) return null
  if (lock && !isSet(profile, lock)) return lock
  if (lock === 'gomi') return 'gomi'
  const order = [...HOME_LAZY[mode], 'school', 'gomi', 'shop', 'home', 'car']
  return order.find((key) => !isSet(profile, key) && (key !== 'school' || profile.kids.length > 0)) ?? null
}
