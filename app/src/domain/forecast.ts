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

type Load = {
  weight: number
  reason: string
  umbrella: string
  range: string
  rank: number
}

export function forecast(input: ForecastInput): Forecast {
  const loads = new Map<ForecastSlotId, Load>()
  const add = (id: ForecastSlotId, weight: number, reason: string, umbrella: string, range = RANGE[id]) => {
    if (weight <= 0) return
    const current = loads.get(id)
    if (!current || weight > current.rank) {
      loads.set(id, {
        weight: (current?.weight ?? 0) + weight,
        reason,
        umbrella,
        range,
        rank: weight,
      })
      return
    }
    current.weight += weight
  }

  if (!input.dadHome && input.kidCount > 0 && input.returnAt && minutes(input.returnAt) >= 19 * 60) {
    add('夕方', 2, 'お風呂と寝かしつけが重なる', '19時までに帰れたら晴れ間に', '18–20時')
  } else if (!input.dadHome && input.kidCount > 0 && !input.returnAt) {
    add('夕方', 1, '帰る時刻が未定で、風呂の時間が空いている', '帰る時刻が分かったら、風呂をどちらがやるか一つ送る')
  }

  if (input.overtime) {
    add('夕方', 2, '残業で、お風呂と寝かしつけが重なる', input.returnAt && minutes(input.returnAt) >= 19 * 60 ? '19時までに帰れたら晴れ間に' : '着く時刻を先に一つ送る', '18–20時')
  }

  for (const event of input.events) {
    if (event.date !== input.today && event.date !== addDays(input.today, 1)) continue
    const tomorrow = event.date !== input.today
    const slot = tomorrow ? '夜' : slotOf(event.time, false)
    const party = event.kind === 'nomikai' || event.title.includes('飲')
    if (party) {
      add(
        tomorrow ? '夜' : slot,
        2,
        tomorrow ? '明日の夜は家を空けるので、風呂と寝かしつけが残る' : 'その時間は家の風呂と寝かしつけが残る',
        '風呂は任せて、残りは帰りにやる、と先に送る',
        tomorrow ? '今夜' : '18–20時',
      )
      continue
    }
    if (!tomorrow) {
      add(slot, 1, `${event.title}の前後に、家の段取りが残る`, '前後で自分がやることを一つ決める')
    }
  }

  for (const event of input.childEvents) {
    if (event.date === input.today) {
      const slot = slotOf(event.startTime, event.allDay)
      const stuff = event.items.length > 0 ? '持ち物を一つ玄関に出す' : '開始の前に、何が残るかを一つ見る'
      add(slot, 1, `${event.title}がある`, stuff)
    }
    if (event.date === addDays(input.today, 1) && (event.items.length > 0 || event.allDay)) {
      const thing = event.items[0] ? `${event.items[0]}を一つ今夜決める` : '持ち物を一つ今夜出す'
      add('夜', 1, `明日の${event.title}の持ち物が残っている`, thing, '20–22時')
    }
  }

  for (const block of input.lane) {
    if (!block.title.includes('迎え') && !block.title.includes('送り')) continue
    if (input.returnAt && minutes(input.returnAt) >= minutes(block.time) + 60) {
      add('夕方', 1, '降園の時間と帰宅が離れている', '迎えの時刻を一言送る')
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
    const sky: ForecastSky = load.weight >= 2 ? 'にわか雨' : 'もよう'
    const prompt = `オウチ予報です。${load.range}は${sky}。家の負荷の予報で、人の気持ちではありません。${load.reason}。傘は「${load.umbrella}」。この枠を短くする一手を一つ。`
    return { id, label: id, range: load.range, sky, reason: load.reason, umbrella: load.umbrella, prompt }
  })

  const quiet = ranked.length === 0
  return {
    date: input.today,
    estimate: true,
    quiet,
    line: quiet ? QUIET_LINE : '',
    slots,
    cleared: input.steps.filter((step) => step.status === 'good').length,
  }
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
