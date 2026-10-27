/**
 * オウチ予報。時間帯ごとの家の負荷だけを見る。人の気持ちや「家が雨」は出さない。
 * AI は呼ばない。入力はすでに揃った事実だけ。
 */

export type ForecastSlotId = '朝' | '昼' | '夕方' | '夜'

export type ForecastSky = '晴れ' | 'くもり' | 'にわか雨' | '注意報' | '警報'

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
  /** この日付の枠を、本人が備えて解除した。 */
  liftedSlots?: ForecastSlotId[]
  /** 前日が警報だった。条件が揃わない翌日は警報にしない。 */
  priorAlert?: boolean
}

export type ForecastSlot = {
  id: ForecastSlotId
  label: string
  range: string
  sky: ForecastSky
  /** 寝かしつけ注意報 のように、家の仕事の名前。晴れ・くもり・にわか雨は空。 */
  call: string
  reason: string
  umbrella: string
  prompt: string
  stack: number
  lifted: boolean
  note: string
}

export type Forecast = {
  date: string
  estimate: true
  known: boolean
  quiet: boolean
  line: string
  headline: string
  slots: ForecastSlot[]
  cleared: number
}

const SKY_RANK: Record<ForecastSky, number> = { 晴れ: 0, くもり: 1, にわか雨: 2, 注意報: 3, 警報: 4 }

export function worstSky(cast: Forecast): ForecastSlot | null {
  if (!cast.known) return null
  return [...cast.slots].sort((a, b) => SKY_RANK[b.sky] - SKY_RANK[a.sky] || Number(a.lifted) - Number(b.lifted))[0] ?? null
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

type Source = {
  weight: number
  reason: string
  fact: string
  umbrella: string
  range: string
  rank: number
  kind: UmbrellaKind
}

export function forecast(input: ForecastInput): Forecast {
  const loads = new Map<ForecastSlotId, Source[]>()
  const add = (id: ForecastSlotId, weight: number, reason: string, fact: string, kind: UmbrellaKind, range = RANGE[id]) => {
    if (weight <= 0 || !reason.trim() || !fact.trim()) return
    const list = loads.get(id) ?? []
    const current = list.find((item) => item.kind === kind)
    if (!current) {
      list.push({ weight, reason, fact, umbrella: pickUmbrella(kind, input.steps), range, rank: weight, kind })
      loads.set(id, list)
      return
    }
    current.weight += weight
    if (weight > current.rank) {
      current.reason = reason
      current.fact = fact
      current.range = range
      current.rank = weight
      current.umbrella = pickUmbrella(kind, input.steps)
    }
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
    add('夕方', 2, '残業が風呂の時間に重なる', '残業の記録あり', 'overtime', '18–20時')
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
    for (const source of loads.get('夕方') ?? []) {
      if (source.kind === 'bath' || source.kind === 'overtime') source.weight = Math.max(0, source.weight - 1)
    }
  }

  const tie = { 夕方: 0, 夜: 1, 朝: 2, 昼: 3 }
  const ranked = [...loads.entries()]
    .map(([id, sources]) => ({ id, sources: sources.filter((source) => source.weight > 0) }))
    .filter((item) => item.sources.length > 0)
    .sort((a, b) => weightOf(b.sources) - weightOf(a.sources) || b.sources.length - a.sources.length || tie[a.id] - tie[b.id])
    .slice(0, 2)
  const alertId = pickAlertSlot(input, ranked)
  const lifted = new Set(input.liftedSlots ?? [])

  const slots: ForecastSlot[] = ORDER.map((id) => emptySlot(id))
  for (const item of ranked) {
    const lead = [...item.sources].sort((a, b) => b.rank - a.rank)[0]
    if (!lead) continue
    const why = `${item.sources.map((source) => source.reason).join('、')}／${item.sources.map((source) => source.fact).join('・')}`
    if (!why.includes('／')) continue
    let sky = skyFromSources(item.sources)
    if (item.id === alertId) sky = '警報'
    const isLifted = lifted.has(item.id) || clearedByStep(input, lead.kind)
    if (isLifted && (sky === '注意報' || sky === '警報')) sky = 'くもり'
    const call = sky === '注意報' || (item.id === alertId && !isLifted) ? levelName(lead.kind, item.id, input.today, sky === '注意報' ? '注意報' : '警報') : ''
    const shownSky: ForecastSky = item.id === alertId && !isLifted ? '警報' : sky
    const prompt = `オウチ予報です。${lead.range}は${call || shownSky}。家の負荷の予報で、人の気持ちではありません。なぜ：${why}。傘は「${lead.umbrella}」。この枠を短くする一手を一つ。`
    slots[ORDER.indexOf(item.id)] = {
      id: item.id,
      label: item.id,
      range: lead.range,
      sky: shownSky,
      call: isLifted ? '' : call,
      reason: why,
      umbrella: lead.umbrella,
      prompt,
      stack: item.sources.length,
      lifted: isLifted && (skyFromSources(item.sources) === '注意報' || item.id === alertId),
      note: item.id === alertId || skyFromSources(item.sources) === '注意報' ? '備えておけば大丈夫' : '',
    }
  }

  const shown = slots.filter((slot) => slot.sky !== '晴れ')
  const quiet = shown.length === 0
  const headline = quiet
    ? QUIET_LINE
    : `だいたい晴れ・${shown
        .map((slot) => {
          const range = slot.range.split('–').join('〜')
          if (slot.lifted) return `${range}は解除`
          return slot.call || `${range}${slot.sky}`
        })
        .join('・')}`
  return {
    date: input.today,
    estimate: true,
    known: true,
    quiet,
    line: quiet ? QUIET_LINE : '',
    headline,
    slots,
    cleared: input.steps.filter((step) => step.status === 'good').length,
  }
}

export function unknownForecast(date: string): Forecast {
  return {
    date,
    estimate: true,
    known: false,
    quiet: true,
    line: '',
    headline: '',
    slots: ORDER.map((id) => emptySlot(id)),
    cleared: 0,
  }
}

function emptySlot(id: ForecastSlotId): ForecastSlot {
  return { id, label: id, range: RANGE[id], sky: '晴れ', call: '', reason: '', umbrella: '', prompt: '', stack: 0, lifted: false, note: '' }
}

function weightOf(sources: Source[]): number {
  return sources.reduce((sum, source) => sum + source.weight, 0)
}

function skyFromSources(sources: Source[]): ForecastSky {
  if (sources.length >= 2) return '注意報'
  if (sources.some((source) => source.weight >= 2)) return 'にわか雨'
  if (sources.length === 1) return 'くもり'
  return '晴れ'
}

function pickAlertSlot(input: ForecastInput, ranked: { id: ForecastSlotId; sources: Source[] }[]): ForecastSlotId | null {
  if (ranked.length === 0 || !alertCombo(input)) return null
  if (input.priorAlert && !alertCombo(input)) return null
  return ranked[0]?.id ?? null
}

function alertCombo(input: ForecastInput): boolean {
  const childToday = input.childEvents.some((event) => event.date === input.today && event.title.trim())
  const laneHeavy = input.lane.length >= 3
  const mehYesterday = input.steps.some((step) => step.date === addDays(input.today, -1) && step.status === 'meh')
  return input.overtime && childToday && laneHeavy && mehYesterday && !input.dadHome
}

function clearedByStep(input: ForecastInput, kind: UmbrellaKind): boolean {
  return input.steps.some((step) => step.date === input.today && step.status === 'good' && matchesKind(kind, step.title))
}

function levelName(kind: UmbrellaKind, slot: ForecastSlotId, today: string, sky: '注意報' | '警報'): string {
  const weekend = [0, 6].includes(utcDay(today))
  if (weekend && sky === '警報') return '週末ワンオペ警報'
  if (kind === 'leave' || slot === '朝') return sky === '警報' ? '朝の支度警報' : '朝の支度注意報'
  if (kind === 'prep') return `持ち物${sky}`
  if (kind === 'pickup') return `迎え${sky}`
  if (kind === 'child') return `段取り${sky}`
  return sky === '警報' ? '寝かしつけ警報' : '寝かしつけ注意報'
}

function utcDay(ymd: string): number {
  const [year, month, day] = ymd.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
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
