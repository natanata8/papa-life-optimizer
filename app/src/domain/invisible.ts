import { addDays, dowIndex, mondayOf, parseYmd } from '@/domain/dates.ts'
import { hasDaycare, hasSmallChild } from '@/domain/profile.ts'
import type { FamEvent, GomiKind, Profile } from '@/domain/types.ts'
import { GOMI_KINDS } from '@/domain/types.ts'

export type InvDefId =
  | 'gomi'
  | 'enweek'
  | 'shop'
  | 'diaper'
  | 'vaccine'
  | 'fee'
  | 'med'
  | 'shoes'
  | 'wifetime'
  | 'ensoku2'
  | 'ensoku1'
  | 'nomi'
  | 'kisei'
  | 'kisei2'

export type InvSlot = '朝' | '日中' | '夕方' | '夜'

export type InvItem = {
  key: string
  def: InvDefId
  date: string
  title: string
  slot: InvSlot
  rel: string
  eventId?: string
}

type InvDef = {
  taskId: string
  title: string
  why: string
  steps: string[]
  minutes: number
}

export const INV_DEFS: Record<InvDefId, InvDef> = {
  gomi: {
    taskId: 'yu-092',
    title: '明日のゴミを前の夜に集める',
    why: '出すのは1分でも、「明日は何ゴミか」を覚えていて、前の夜に家中から集めるのは毎週続く裏の仕事です。',
    steps: ['各部屋とおむつ用のゴミ箱を集める', 'ゴミ袋が足りるか見て補充する', '玄関に置いておく（朝は出すだけにする）'],
    minutes: 5,
  },
  enweek: {
    taskId: 'yu-234',
    title: '週明けの園の持ち物チェック（着替え・おむつ・お昼寝シーツ）',
    why: '月曜の朝に足りないと気づくと、一番あわただしい時間がさらに崩れます。前の晩の確認がそれを防いでいます。',
    steps: ['園のお知らせ・連絡アプリを見る', '着替え・おむつ・シーツの数を数える', '足りない物を買い物メモに入れる'],
    minutes: 10,
  },
  shop: {
    taskId: 'yu-069',
    title: '日用品の残りを見て買い物メモを作る',
    why: '「なくなる前に気づく」こと自体が仕事です。誰かが見ているから切れずに回っています。',
    steps: ['洗剤・ティッシュ・ゴミ袋・おむつの残りを見る', 'メモを共有する', '出かけるついでに買う'],
    minutes: 10,
  },
  diaper: {
    taskId: 'yu-077',
    title: 'おむつ・おしりふきの残りとサイズの確認',
    why: '在庫切れやサイズアウトは急に来ます。残りを見て先に買っておくのが、見えない部分です。',
    steps: ['ストックの数を見る', '漏れが増えていないか（サイズ）', '残り3日分を切ったら買う'],
    minutes: 5,
  },
  vaccine: {
    taskId: 'yu-400',
    title: 'インフルエンザ予防接種の予約を確認',
    why: '予約枠は早く埋まることがあり、子どもは年齢によって2回接種になります（回数・間隔はかかりつけで確認）。日程を押さえる・母子手帳を用意する、が裏で動いています。',
    steps: ['かかりつけの予約方法と空きを見る', '家族の予定と照らして候補日を決める', '母子手帳・予診票を用意する'],
    minutes: 15,
  },
  fee: {
    taskId: 'yu-323',
    title: '保育料・給食費の引き落としを確認',
    why: '残高不足や未払いは、園から連絡が来て初めて分かります。誰かが毎月見ています。',
    steps: ['口座の残高と引き落とし日を見る', '園からの集金のお知らせを確認する'],
    minutes: 10,
  },
  med: {
    taskId: 'yu-311',
    title: '常備薬・解熱剤の期限と残りを確認',
    why: '夜中の発熱で「薬がない」と分かるのが一番つらい場面です。',
    steps: ['解熱剤・保湿剤・絆創膏の期限を見る', '体温計の電池を確かめる', '足りない物を買い物メモに入れる'],
    minutes: 10,
  },
  shoes: {
    taskId: 'yu-388',
    title: '靴・上履きのサイズ確認（季節の変わり目）',
    why: 'きつい靴は子どもが自分から言わないことが多く、気づいた人が買い替えています。',
    steps: ['つま先に指1本分の余裕があるか', '上履きに名前があるか', '必要ならサイズをメモする'],
    minutes: 10,
  },
  wifetime: {
    taskId: 'yu-357',
    title: '来週、パートナーのひとり時間をどこに置くか考える',
    why: '自分の時間を気持ちよく取るには、先に相手の時間を置くのが近道です。誰も言い出さないと消えやすい予定です。',
    steps: ['来週の予定から空きを探す', 'その時間は自分が子どもを見る', '「この時間どう？」と聞く'],
    minutes: 10,
  },
  ensoku2: {
    taskId: 'yu-266',
    title: '遠足のお弁当：中身を決めて材料・おやつを買う',
    why: 'お弁当は当日の朝の仕事に見えますが、献立決め・買い出し・前の晩の仕込みが裏にあります。',
    steps: ['お弁当の中身を決める', '材料・おやつ・ピックを買う', '水筒・レジャーシート・おしぼりを用意する'],
    minutes: 30,
  },
  ensoku1: {
    taskId: 'yu-225',
    title: '遠足の前の晩：お弁当の仕込みとリュック',
    why: '当日の朝をラクにするのは、前の晩の段取りです。',
    steps: ['おかずを下ごしらえする', 'リュックに持ち物を入れる', '持ち物に名前があるか見る'],
    minutes: 20,
  },
  nomi: {
    taskId: 'yu-113',
    title: '飲み会の夜のお風呂・寝かしつけを誰がやるか',
    why: '自分が抜ける時間の仕事は、消えずに誰かに移ります。先に決めておくのが見えない段取りです。',
    steps: ['その時間に、ふだん自分がやっていることを書き出す', '頼むのか、前後で何を代わるか決める'],
    minutes: 5,
  },
  kisei: {
    taskId: 'yu-394',
    title: '妻の実家ランチ：手土産と子どもの荷物',
    why: '手土産選び、着替え、おむつ、移動の段取りは「行くだけ」の人からは見えにくい仕事です。',
    steps: ['手土産を決めて買う', '子どもの着替え・おむつ・おやつ', '行き帰りの時間と昼寝を考える'],
    minutes: 20,
  },
  kisei2: {
    taskId: 'yu-391',
    title: 'ランチのお礼をひとこと送る',
    why: 'お礼の連絡も、誰かが気づいて送っています。',
    steps: ['写真を1枚選ぶ', 'お礼のメッセージを送る（自分から送ってもいい）'],
    minutes: 5,
  },
}

export const DAILY_TASKS: { id: string; title: string; frequency: string; minutes: number; category: string }[] = [
  { id: 'yu-233', title: '園からのお知らせを確認する', frequency: '毎日', minutes: 5, category: '育児' },
  { id: 'yu-227', title: '連絡帳・体温を記入する', frequency: '毎朝', minutes: 5, category: '育児' },
  { id: 'yu-293', title: '朝の体温・体調をチェックする', frequency: '毎朝', minutes: 3, category: '育児' },
  { id: 'yu-001', title: '前夜に朝食の献立を決める', frequency: '前夜・毎日', minutes: 5, category: '家事' },
  { id: 'yu-017', title: 'おやつの時間と量を決める', frequency: '毎日', minutes: 5, category: '家事' },
  { id: 'yu-294', title: '食欲・排泄・睡眠の変化を観察する', frequency: '毎日', minutes: 5, category: '育児' },
  { id: 'yu-353', title: '1日の出来事を共有する', frequency: '毎日', minutes: 10, category: 'くらし運営' },
]

export const SLOT_TIME: Record<InvSlot | '終日', string> = {
  朝: '07:30',
  日中: '12:00',
  夕方: '17:30',
  夜: '21:00',
  終日: '',
}

const BUY: Partial<Record<InvDefId, string>> = {
  ensoku2: '遠足のお弁当の材料とおやつ',
  diaper: 'おむつ・おしりふき',
  shop: '日用品（洗剤・ゴミ袋など）',
  kisei: '実家への手土産',
}

export function taskSnippet(taskId: string): { title: string; category: string; frequency: string; visibility: string } | null {
  const daily = DAILY_TASKS.find((task) => task.id === taskId)
  if (daily) return { title: daily.title, category: daily.category, frequency: daily.frequency, visibility: '見えない' }
  const def = Object.values(INV_DEFS).find((item) => item.taskId === taskId)
  if (!def) return null
  return { title: def.title, category: '家事・育児', frequency: '場面ごと', visibility: taskId === 'yu-092' || taskId === 'yu-225' || taskId === 'yu-266' ? '見える' : '見えない' }
}

export function invisibleOn(
  date: string,
  profile: Profile,
  events: FamEvent[],
  hidden: Record<string, true>,
  today: string,
): InvItem[] {
  if (!profile.showInv) return []
  const dow = dowIndex(date)
  const month = parseYmd(date).getMonth() + 1
  const week = mondayOf(today)
  const daycare = hasDaycare(profile)
  const small = hasSmallChild(profile)
  const items: InvItem[] = []

  const push = (item: InvItem) => {
    if (hidden[`${date}:${item.key}`]) return
    items.push(item)
  }

  for (const kind of GOMI_KINDS) {
    const tomorrow = (dow + 1) % 7
    if (profile.gomi[kind as GomiKind].includes(tomorrow)) {
      push({
        key: `gomi-${kind}`,
        def: 'gomi',
        date,
        title: `明日は${kind}ゴミ：前の夜に家中から集める`,
        slot: '夜',
        rel: 'ゴミの日の前の夜（家庭プロフィール）',
      })
    }
  }

  if (daycare && dow === 0) {
    push({
      key: 'enweek',
      def: 'enweek',
      date,
      title: INV_DEFS.enweek.title,
      slot: '夜',
      rel: '毎週日曜の夜（園に通っているため）',
    })
  }

  if (profile.shop !== null && dow === profile.shop) {
    push({
      key: 'shop',
      def: 'shop',
      date,
      title: INV_DEFS.shop.title,
      slot: '朝',
      rel: '毎週・買い物の曜日',
    })
  }

  if (small && dow === 4) {
    push({
      key: 'diaper',
      def: 'diaper',
      date,
      title: INV_DEFS.diaper.title,
      slot: '日中',
      rel: '毎週（2歳以下の子がいるため）',
    })
  }

  if (month >= 10 && month <= 12 && date === addDays(week, 2)) {
    push({
      key: 'vaccine',
      def: 'vaccine',
      date,
      title: INV_DEFS.vaccine.title,
      slot: '日中',
      rel: '秋〜冬・今週中に',
    })
  }

  if (month >= 10 && month <= 11 && date === addDays(week, 5)) {
    push({
      key: 'shoes',
      def: 'shoes',
      date,
      title: INV_DEFS.shoes.title,
      slot: '日中',
      rel: '季節の変わり目',
    })
  }

  if (dow === 6) {
    push({
      key: 'wifetime',
      def: 'wifetime',
      date,
      title: INV_DEFS.wifetime.title,
      slot: '夜',
      rel: '毎週・来週の前に',
    })
  }

  const tomorrowDate = addDays(date, 1)
  if (parseYmd(tomorrowDate).getDate() === 1 && daycare) {
    push({
      key: 'fee',
      def: 'fee',
      date,
      title: INV_DEFS.fee.title,
      slot: '日中',
      rel: '毎月・月末',
    })
  }

  if (parseYmd(date).getDate() === 1) {
    push({
      key: 'med',
      def: 'med',
      date,
      title: INV_DEFS.med.title,
      slot: '日中',
      rel: '毎月・月初め',
    })
  }

  for (const event of events) {
    if (event.kind === 'ensoku') {
      if (date === addDays(event.date, -2)) {
        push({
          key: `ens2-${event.id}`,
          def: 'ensoku2',
          date,
          title: INV_DEFS.ensoku2.title,
          slot: '日中',
          rel: `${event.title} の2日前`,
          eventId: event.id,
        })
      }
      if (date === addDays(event.date, -1)) {
        push({
          key: `ens1-${event.id}`,
          def: 'ensoku1',
          date,
          title: INV_DEFS.ensoku1.title,
          slot: '夜',
          rel: `${event.title} の前の晩`,
          eventId: event.id,
        })
      }
    }
    if (event.kind === 'nomikai' && date === addDays(event.date, -1)) {
      push({
        key: `nomi-${event.id}`,
        def: 'nomi',
        date,
        title: INV_DEFS.nomi.title,
        slot: '夜',
        rel: `${event.title} の前に`,
        eventId: event.id,
      })
    }
    if (event.kind === 'kisei') {
      if (date === addDays(event.date, -2)) {
        push({
          key: `kis-${event.id}`,
          def: 'kisei',
          date,
          title: INV_DEFS.kisei.title,
          slot: '夜',
          rel: `${event.title} の2日前`,
          eventId: event.id,
        })
      }
      if (date === addDays(event.date, 1)) {
        push({
          key: `kis2-${event.id}`,
          def: 'kisei2',
          date,
          title: INV_DEFS.kisei2.title,
          slot: '日中',
          rel: `${event.title} のあと`,
          eventId: event.id,
        })
      }
    }
  }

  return items
}

export function weekStats(
  weekStart: string,
  profile: Profile,
  events: FamEvent[],
  hidden: Record<string, true>,
  today: string,
): { count: number; minutes: number; related: number; daily: number; dailyMinutes: number } {
  let count = 0
  let minutes = 0
  let related = 0
  for (let i = 0; i < 7; i += 1) {
    for (const item of invisibleOn(addDays(weekStart, i), profile, events, hidden, today)) {
      count += 1
      minutes += INV_DEFS[item.def].minutes
      if (item.eventId) related += 1
    }
  }
  const dailyMinutes = DAILY_TASKS.reduce((sum, task) => sum + task.minutes, 0)
  return { count, minutes, related, daily: DAILY_TASKS.length, dailyMinutes }
}

export function beforeLeaving(items: InvItem[]): { title: string; line: string; item: InvItem | null } {
  const buy = items.find((item) => BUY[item.def])
  if (buy) {
    const what = BUY[buy.def] ?? ''
    return {
      title: `帰りに${what}を買う`,
      line: `今から帰るね。帰りに${what}買っていこか？ほかに要るものある？`,
      item: buy,
    }
  }
  const night = items.find((item) => item.slot === '夜')
  if (night) {
    const short = night.title.split('：')[0]
    return {
      title: night.title,
      line: `今から帰るね。今夜の「${short}」は俺がやるわ。`,
      item: night,
    }
  }
  return {
    title: '今夜のお風呂か寝かしつけ、どちらかを自分がやる',
    line: '今から帰るね。今夜はお風呂か寝かしつけ、どっちか俺がやるわ。どっちがいい？',
    item: null,
  }
}

export function adoptedKeys(steps: { invisibleKey: string | null }[]): Set<string> {
  return new Set(steps.map((step) => step.invisibleKey).filter((key): key is string => Boolean(key)))
}
