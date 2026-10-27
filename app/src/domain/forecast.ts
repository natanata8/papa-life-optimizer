/**
 * オウチ予報。時間帯ごとの家の負荷だけを見る。人の気持ちや「家が雨」は出さない。
 * AI は呼ばない。入力はすでに揃った事実だけ。
 */

export type ForecastSlotId = '朝' | '昼' | '夕方' | '夜'

export type ForecastSky = '晴れ' | 'もよう' | 'にわか雨'

export type ForecastEvent = {
  date: string
  time: string
  title: string
  kind?: string
}

export type ForecastChild = {
  date: string
  startTime: string
  allDay: boolean
  title: string
  items: string[]
}

export type ForecastLane = {
  time: string
  title: string
}

export type ForecastStep = {
  date: string
  time: string
  title: string
  status: 'good' | 'meh' | null
}

export type ForecastInput = {
  today: string
  returnAt: string | null
  leaveAt: string | null
  usual: string[]
  dadHome: boolean
  kidCount: number
  events: ForecastEvent[]
  childEvents: ForecastChild[]
  lane: ForecastLane[]
  overtime: boolean
  steps: ForecastStep[]
}

export type ForecastSlot = {
  id: ForecastSlotId
  label: string
  range: string
  sky: ForecastSky
  reason: string
  umbrella: string
  prompt: string
}

export type Forecast = {
  date: string
  estimate: true
  quiet: boolean
  line: string
  headline: string
  slots: ForecastSlot[]
  cleared: number
}

const ORDER: ForecastSlotId[] = ['朝', '昼', '夕方', '夜']

const RANGE: Record<ForecastSlotId, string> = {
  朝: '7–11時',
  昼: '11–16時',
  夕方: '16–20時',
  夜: '20–22時',
}

const QUIET_LINE = '今日は晴れ。特にやることなし'

type UmbrellaKind = 'bath' | 'overtime' | 'party' | 'child' | 'prep' | 'pickup' | 'event' | 'leave'

const UMBRELLAS: Record<UmbrellaKind, [string, string]> = {
  bath: ['19時までに帰れたら晴れ間に', '風呂の担当を一言送る'],
  overtime: ['着く時刻を先に一つ送る', '残業の終わり時刻を一つ送る'],
  party: ['風呂は任せて、残りは帰りにやる、と先に送る', '抜ける前に、風呂の時刻を一つ送る'],
  child: ['持ち物を一つ玄関に出す', '開始の前に、残るものを一つ見る'],
  prep: ['中身を一つ今夜決める', '持ち物を一つ今夜出す'],
  pickup: ['迎えの時刻を一言送る', '迎えを誰がやるか一つ送る'],
  event: ['前後で自分がやることを一つ決める', 'その予定の前後で一つ引き取る'],
  leave: ['家を出る前に、送りを一つ決める', '出る時刻を一言送る'],
}

type Load = {
  weight: number
  reason: string
  fact: string
  umbrella: string
  range: string
  rank: number
  kind: UmbrellaKind
}

export function forecast(input: ForecastInput): Forecast {
  const loads = new Map<ForecastSlotId, Load>()
  const add = (id: ForecastSlotId, weight: number, reason: string, fact: string, kind: UmbrellaKind, range = RANGE[id]) => {
    if (weight <= 0 || !reason.trim() || !fact.trim()) return
    const current = loads.get(id)
    const umbrella = pickUmbrella(kind, input.steps)
    if (!current || weight > current.rank) {
      loads.set(id, {
        weight: (current?.weight ?? 0) + weight,
        reason,
        fact,
        umbrella,
        range,
        rank: weight,
        kind,
      })
      return
    }
    current.weight += weight
  }

  const usualBath = input.usual.some((item) => item === 'お風呂' || item === '寝かしつけ')
  const returnFact = input.returnAt ? `帰宅予定${input.returnAt}` : ''
  if (!input.dadHome && input.kidCount > 0 && input.returnAt && minutes(input.returnAt) >= 19 * 60) {
    const fact = usualBath ? `${returnFact}・普段の担当はお風呂` : returnFact
    add('夕方', 2, 'お風呂と寝かしつけが重なる', fact, 'bath', '18–20時')
  } else if (!input.dadHome && input.kidCount > 0 && !input.returnAt) {
    add('夕方', 1, '風呂の時間が空いている', '帰宅予定が未設定', 'bath')
  }

  if (input.overtime && input.kidCount > 0) {
    add('夕方', 2, 'お風呂と寝かしつけが重なる', '残業の記録あり', 'overtime', '18–20時')
  }

  for (const event of input.events) {
    if (event.date !== input.today && event.date !== addDays(input.today, 1)) continue
    const tomorrow = event.date !== input.today
    const slot = tomorrow ? '夜' : slotOf(event.time, false)
    const party = event.kind === 'nomikai' || event.title.includes('飲')
    if (party && event.title.trim()) {
      add(
        tomorrow ? '夜' : slot,
        2,
        tomorrow ? '明日の夜は家を空けるので、風呂と寝かしつけが残る' : '風呂と寝かしつけが残る',
        `予定「${event.title.trim()}」`,
        'party',
        tomorrow ? '今夜' : '18–20時',
      )
      continue
    }
    if (!tomorrow && event.title.trim()) {
      add(slot, 1, '前後に家の段取りが残る', `予定「${event.title.trim()}」`, 'event')
    }
  }

  for (const event of input.childEvents) {
    if (!event.title.trim()) continue
    if (event.date === input.today) {
      const slot = slotOf(event.startTime, event.allDay)
      const fact = event.items.length > 0 ? `持ち物「${event.items[0]}」` : `予定「${event.title.trim()}」`
      add(slot, 1, `${event.title.trim()}がある`, fact, 'child')
    }
    if (event.date === addDays(input.today, 1) && (event.items.length > 0 || event.allDay)) {
      const fact = event.items[0] ? `持ち物「${event.items[0]}」` : `予定「${event.title.trim()}」`
      add('夜', 1, `明日の${event.title.trim()}の持ち物が残っている`, fact, 'prep', '20–22時')
    }
  }

  if (input.leaveAt && /^\d/.test(input.leaveAt) && input.usual.includes('登園の送り') && input.kidCount > 0 && !input.dadHome) {
    add('朝', 1, '登園の送りが残る', `家を出る時刻${input.leaveAt}`, 'leave', '7–9時')
  }

  for (const block of input.lane) {
    if (!block.title.includes('迎え') && !block.title.includes('送り')) continue
    if (!block.time) continue
    if (input.returnAt && minutes(input.returnAt) >= minutes(block.time) + 60) {
      add('夕方', 1, '降園の時間と帰宅が離れている', `迎え${block.time}`, 'pickup')
    }
  }

  if (input.steps.some((step) => step.date === input.today && /風呂|寝かしつけ/.test(step.title))) {
    const evening = loads.get('夕方')
    if (evening) evening.weight = Math.max(0, evening.weight - 1)
  }

  const tie = { 夕方: 0, 夜: 1, 朝: 2, 昼: 3 }
  const ranked = [...loads.entries()]
    .filter(([, load]) => load.weight > 0)
    .sort((a, b) => b[1].weight - a[1].weight || tie[a[0]] - tie[b[0]])
    .slice(0, 2)
  const busy = new Map(ranked)

  const slots: ForecastSlot[] = ORDER.map((id) => {
    const load = busy.get(id)
    if (!load) {
      return { id, label: id, range: RANGE[id], sky: '晴れ', reason: '', umbrella: '', prompt: '' }
    }
    const why = `${load.reason}／${load.fact}`
    if (!why.includes('／') || !load.fact.trim()) {
      return { id, label: id, range: RANGE[id], sky: '晴れ', reason: '', umbrella: '', prompt: '' }
    }
    const sky: ForecastSky = load.weight >= 2 ? 'にわか雨' : 'もよう'
    const prompt = `オウチ予報です。${load.range}は${sky}。家の負荷の予報で、人の気持ちではありません。なぜ：${why}。傘は「${load.umbrella}」。この枠を短くする一手を一つ。`
    return { id, label: id, range: load.range, sky, reason: why, umbrella: load.umbrella, prompt }
  })

  const shown = slots.filter((slot) => slot.sky !== '晴れ')
  const quiet = shown.length === 0
  const headline = quiet ? QUIET_LINE : `だいたい晴れ・${shown.map((slot) => `${slot.range.split('–').join('〜')}${slot.sky}`).join('・')}`
  return {
    date: input.today,
    estimate: true,
    quiet,
    line: quiet ? QUIET_LINE : '',
    headline,
    slots,
    cleared: input.steps.filter((step) => step.status === 'good').length,
  }
}

export function noticeBody(quiet: boolean, pendingReview: boolean, headline: string): string | null {
  if (pendingReview) return '昨日の夕方、晴れにできた？'
  if (!quiet) return headline
  return null
}

function pickUmbrella(kind: UmbrellaKind, steps: ForecastStep[]): string {
  const [keep, next] = UMBRELLAS[kind]
  const related = steps
    .filter((step) => step.status && matchesKind(kind, step.title))
    .sort((a, b) => b.date.localeCompare(a.date))
  const latest = related[0]
  if (!latest || latest.status === 'good') return keep
  return next
}

function matchesKind(kind: UmbrellaKind, title: string): boolean {
  if (kind === 'bath' || kind === 'overtime') return /風呂|寝かしつけ/.test(title)
  if (kind === 'party') return /飲|風呂/.test(title)
  if (kind === 'child' || kind === 'prep') return /持ち物|遠足|避難/.test(title)
  if (kind === 'pickup') return /迎え/.test(title)
  if (kind === 'leave') return /送り|出る/.test(title)
  return /予定|段取り/.test(title)
}

function slotOf(time: string, allDay: boolean): ForecastSlotId {
  if (allDay || !time) return '朝'
  const hour = Math.floor(minutes(time) / 60)
  if (hour < 11) return '朝'
  if (hour < 16) return '昼'
  if (hour < 20) return '夕方'
  return '夜'
}

function minutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number)
  if (!Number.isFinite(hour)) return 0
  return hour * 60 + (minute || 0)
}

function addDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
