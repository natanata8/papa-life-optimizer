import { addDays, formatMd } from '@/domain/dates.ts'
import { fallbackScenes } from '@/domain/scenes.ts'
import type { StepKind, ToneAnswer, ToneStep } from '@/domain/types.ts'
import type { ConsultRequest } from '@/ai/types.ts'

function step(
  title: string,
  why: string,
  kind: StepKind,
  timing: string,
  tasks: string[],
): ToneStep {
  return { タイトル: title, なぜ今: why, 種類: kind, タイミング: timing, タスク分解ステップ: tasks }
}

function blockedTitles(memory: string[]): string[] {
  return memory
    .filter((line) => line.includes('微妙だった'))
    .map((line) => line.match(/「(.+?)」/)?.[1] ?? '')
    .filter(Boolean)
}

function withoutBlocked(items: ToneStep[], blocked: string[]): ToneStep[] {
  const kept = items.filter((item) => !blocked.some((title) => item.タイトル.includes(title) || title.includes(item.タイトル)))
  if (kept.length > 0) return kept
  return [
    step(
      '別のやり方を1つだけ選ぶ',
      '前回微妙だったやり方は、今回の候補から外しています',
      '置き換える',
      '今夜',
      ['前回と違うやり方を1つ選ぶ', '日時だけ先に伝える'],
    ),
  ]
}

function clip(text: string, max: number): string {
  const value = text.trim()
  return value.length <= max ? value : value.slice(0, max)
}

function finish(answer: ToneAnswer): ToneAnswer {
  return {
    ...answer,
    状況整理: clip(answer.状況整理, 120),
    気づき: clip(answer.気づき, 60),
    声かけ例: clip(answer.声かけ例, 80),
    明日やること: clip(answer.明日やること, 24),
    questions: answer.questions.slice(0, 2).map((item) => clip(item, 30)),
    一手: answer.一手.slice(0, 3).map((item) => ({
      ...item,
      タイトル: clip(item.タイトル, 20),
      なぜ今: clip(item.なぜ今, 40),
      タイミング: clip(item.タイミング, 8),
      タスク分解ステップ: item.タスク分解ステップ.slice(0, 6).map((task) => clip(task, 24)),
    })),
  }
}

function noteBlocked(answer: ToneAnswer, blocked: string[]): ToneAnswer {
  if (blocked.length === 0) return answer
  const extra = '前の案は外しています。'
  const room = 60 - extra.length
  const base = answer.気づき.length <= room ? answer.気づき : answer.気づき.slice(0, room)
  return {
    ...answer,
    一手: withoutBlocked(answer.一手, blocked),
    気づき: `${base}${extra}`,
  }
}

export function sampleAnswer(request: ConsultRequest): ToneAnswer {
  return finish(rawAnswer(request))
}

function rawAnswer(request: ConsultRequest): ToneAnswer {
  if (request.entry === 'invisible') return invisibleAnswer(request)
  if (request.userText.includes('湯船') || request.entry.includes('湯船')) return bathBoat()
  if (request.entry.startsWith('オウチ予報') || request.entry.startsWith('今夜の流れ')) return forecastConsult(request)
  const blocked = blockedTitles(request.memory)
  if (request.scene === 'nomi') return noteBlocked(nomi(request), blocked)
  if (request.scene === 'tired') return noteBlocked(tired(request), blocked)
  if (request.scene === 'week') return noteBlocked(week(request), blocked)
  if (request.scene === 'me') return noteBlocked(mine(request), blocked)
  if (request.scene === 'late') return noteBlocked(late(request), blocked)
  if (request.scene === 'clash') return noteBlocked(clash(request), blocked)
  if (request.userText.includes('お風呂を短く')) return bathBoat()
  const choices = fallbackScenes(request.userText)
  if (choices.length === 0) {
    return {
      状況整理: 'この文に近い場面は、まだありません。',
      気づき: 'お風呂、残業、週末、のどれかに言い換えると手順を出せます。',
      一手: [step('言い換えてもう一度', '近い言葉にすると手順が出ます', '今やる', '今夜', [])],
      声かけ例: '',
      明日やること: '',
      questions: [],
      safety_flag: false,
    }
  }
  return {
    状況整理: '近い場面を1つ選ぶと、手順を出せます。',
    気づき: '',
    一手: [step('近い場面を選ぶ', '下の場面から1つ', '今やる', '今夜', choices.map((title) => title.slice(0, 24)))],
    声かけ例: '',
    明日やること: '',
    questions: [],
    safety_flag: false,
  }
}

function shortTitle(title: string): string {
  const head = (title.split('：')[0] ?? title).split('（')[0].trim()
  if (head.length <= 20) return head
  const cut = head.split('を')[0]?.trim() ?? head
  return cut.length >= 6 && cut.length <= 20 ? cut : clip(head, 20)
}

function invisibleAnswer(request: ConsultRequest): ToneAnswer {
  const hint = request.taskHints[0]
  const title = hint?.title || request.userText || 'この段取り'
  const short = shortTitle(title)
  const steps = (hint?.steps?.length ? hint.steps : ['中身を1つ確認する', '足りない物があればメモする']).map((item) => clip(item, 24))
  const fact = hint?.why || 'やっている人以外からは見えにくい段取りです。'
  return {
    状況整理: `${fact}全部を代わる必要はありません。`,
    気づき: '1つだけ自分の担当にできるかを見る、で足ります。',
    一手: [step(short, '今週分だけ自分がやると、次の声かけが具体的になります', '今やる', '今夜', steps)],
    声かけ例: `${short}、今週は俺がやってみる。コツがあったら教えて。`,
    明日やること: steps[0] ?? '中身を1つ確認する',
    questions: [],
    safety_flag: false,
  }
}

function bathBoat(): ToneAnswer {
  return {
    状況整理: '湯船は短くてOK。代わりにこの3つを。',
    気づき: '全部やらなくても、上がったあとの3分は残します。',
    一手: [
      step('湯船は短くてOK', '代わりにこの3つで足ります', '今やる', 'お風呂', [
        '湯船は1分だけ。おもちゃを先に',
        '上がったらタオルで包む',
        '保湿は3分以内',
      ]),
    ],
    声かけ例: '湯船は1分だけにして、上がったらすぐ包むね。',
    明日やること: '保湿は3分以内',
    questions: [],
    safety_flag: false,
  }
}

function forecastConsult(request: ConsultRequest): ToneAnswer {
  if (request.userText.includes('持ち物')) {
    return {
      状況整理: '明日の持ち物が、今夜の枠に残っています。中身を一つだけ決めます。',
      気づき: '全部揃えなくて大丈夫です。一つ決まると、その枠は短くなります。',
      一手: [step('持ち物を一つ決める', '残っているのは中身の確認です', '今やる', '今夜', ['お弁当の中身を一つ決める', '玄関に置く'])],
      声かけ例: '明日の持ち物、お弁当は俺が詰めるね。',
      明日やること: '持ち物を一つ出す',
      questions: [],
      safety_flag: false,
    }
  }
  return {
    状況整理: '18時から20時は、風呂と寝かしつけが重なります。帰る時刻を先に一つ伝えます。',
    気づき: '遅れることより、風呂をどちらがやるかが先です。',
    一手: [step('帰る時刻を先に送る', '重なる時間を短くするには、時刻が先です', '事前に伝える', '今', ['着く時刻を送る', '風呂の担当を一つ決める'])],
    声かけ例: '19時までには帰るね。今夜の風呂、お願いできる？残りは俺がやる。',
    明日やること: '風呂の担当を一つ決める',
    questions: [],
    safety_flag: false,
  }
}

function childFact(request: ConsultRequest, around: string): string {
  const next = addDays(around, 1)
  const rows = request.childEvents.filter((event) => event.date === around || event.date === next)
  if (rows.length === 0) return ''
  const line = rows
    .slice(0, 1)
    .map((event) => {
      const when = event.date === around ? 'その日' : '翌日'
      const items = event.items.length > 0 ? `、${event.items.slice(0, 2).join('と')}` : ''
      return `${when}は${event.title}${items}`
    })
    .join('')
  return line.length <= 36 ? line : '前後に子どもの予定があります。'
}

function nomi(request: ConsultRequest): ToneAnswer {
  const date = request.sceneDate
  const who = request.answers[1]
  const duty = who === 'お風呂' ? '風呂' : who === '寝かしつけ' ? '寝かしつけ' : '夜のこと'
  let prep = '登園の準備'
  let second = step('前日に登園バッグを用意', '抜ける日の前後の仕事を、1つ先に引き取ります', '先にやる', '前日', [
    '着替えとおむつを袋に入れる',
    '連絡帳を書く',
    'タオルと水筒をそろえる',
  ])
  if (request.flags.ensokuNextDay) {
    prep = '弁当の仕込み'
    second = step('前日に弁当を仕込む', '飲み会の夜が遠足の前夜です。仕込みを早めます', '先にやる', '前日', [
      'おかずを下ごしらえする',
      '材料とおやつを確認する',
      'リュックに持ち物を入れる',
    ])
  } else if (request.flags.gomiAround) {
    prep = 'ゴミまとめ'
    second = step('朝、ゴミを玄関へ', '抜ける日の前後の仕事を、1つ先に引き取ります', '先にやる', '当日朝', [
      '各部屋のゴミを集める',
      '玄関に置いて朝は出すだけにする',
    ])
  }
  const morningWhy = request.family.support.includes('実家が近い（30分以内）')
    ? '翌朝は手が足りにくいです。実家が近いので朝だけ頼む手もあります'
    : '翌朝は手が足りなくなりやすい時間です'
  const when =
    date === request.today ? '今夜' : date === addDays(request.today, 1) ? '明日の夜' : `${formatMd(date)}の夜`
  return {
    状況整理: withChild('行きたい予定です。抜ける時間に、誰のどの仕事が移るかを先に1つ決めます。', request, date),
    気づき: '行くかどうかより、前日に何を終わらせるかの方が家に残りにくいです。',
    一手: [
      step('飲み会と帰る時刻を送る', '先に日時と帰る時刻を伝えると、家が動きやすいです', '事前に伝える', date === request.today ? 'いま' : '今夜', [
        '日時と帰る時間を決める',
        '夜に任せることを一言で伝える',
        '代わりに引き受けることを伝える',
      ]),
      second,
      step('翌朝の送りを自分がやる', morningWhy, '後でフォロー', '翌朝', ['目覚ましを早めにかける', '朝ごはんを用意する', '送りを自分がやる']),
    ],
    声かけ例: `${when}、飲み会に行く。22時半に帰る。${duty}は任せる。${prep}は前日にやる。`,
    明日やること: prep === 'ゴミまとめ' ? '朝、ゴミを集めて玄関に置く' : '前日の夜に段取りを1つ終える',
    questions: [],
    safety_flag: false,
  }
}

function tired(request: ConsultRequest): ToneAnswer {
  return {
    状況整理: withChild('しんどそうに見えます。理由は今夜決めません。残っている夜の仕事を1つ動かします。', request, request.today),
    気づき: '気持ちの原因より、残っている仕事を1つ動かす方が先です。',
    一手: [
      step('寝かしつけを30分引き取る', '話すより、手を1つ動かす方が先です', '今やる', '今夜', [
        'お風呂のあとの寝かしつけをやる',
        '30分は相手が休めるようにする',
      ]),
      step('朝の園の準備をやる', '毎朝の見えない仕事を、1つ引き取ります', '先にやる', '翌朝', ['連絡帳と体温を書く', '着替えを袋に入れる']),
      step('今夜は話し合いをしない', '疲れている夜は、原因を決めない', 'やらない', '今夜', ['今夜は原因を聞かない', '週末に近況だけ聞く']),
    ],
    声かけ例: '今日は寝かしつけ、俺がやるね。先に休んでて。朝の準備もやる。',
    明日やること: '朝の園の準備を自分がやる',
    questions: [],
    safety_flag: false,
  }
}

function week(request: ConsultRequest): ToneAnswer {
  const wish = request.answers[0] ?? '近場でゆっくり'
  const kids = request.family.kidsCount > 1 ? '子どもたち' : '子ども'
  let lead = '予定の多い週末です。土曜はゆっくりにして、裏の段取りだけ前倒しにします。'
  let first = step('土曜午前は家でゆっくり', '予定の合間に、外出を短くします', '今やる', '土曜午前', ['午前は家にいる', '午後に近所の公園へ30分'])
  let say = '土曜は近場でゆっくりしよう。日曜の夜の園の準備は俺がやる。'
  if (wish === '妻をひとりにしたい') {
    lead = '土曜の午前に、相手が家でひとりでいられる時間を先に置きます。'
    first = step('土曜午前、公園と図書館', '日曜の前に、午前だけ外へ出ます', '今やる', '土曜午前', ['9:30に出る', '公園と図書館', '12時には帰る'])
    say = `土曜の午前、${kids}連れて公園と図書館へ行く。午前はゆっくりしてて。`
  } else if (wish === '家族で出かけたい') {
    lead = '日曜は予定があります。土曜は近場で短めにすると、疲れを残しません。'
    first = step('土曜は近場の公園へ', '移動を短くして、日曜に疲れを残しません', '今やる', '土曜昼', ['10時に出る', '歩ける範囲の公園', '13時には帰る'])
    say = '土曜は家族で近場の公園へ。お昼は外で、13時には帰る。'
  }
  if (request.family.car === 'ない') {
    first = { ...first, なぜ今: '車なし。歩ける範囲で組み立てます' }
  }
  return {
    状況整理: lead,
    気づき: '週末の中身より、誰がひとりでいられる時間を先に置く方が残りやすいです。',
    一手: [
      first,
      step('出かける前に日用品を見る', '外出と買い物を1つにまとめます', '先にやる', '土曜朝', [
        '洗剤・ティッシュ・おむつの残りを見る',
        '足りない物をメモする',
        '帰りに買う',
      ]),
      step('日曜夜、園の持ち物を見る', '外出のあと、夜の仕事を引き取ります', '後でフォロー', '日曜夜', ['園のお知らせを見る', '着替えとシーツの数を数える']),
    ],
    声かけ例: say,
    明日やること: '土曜の午前の出方を一言伝える',
    questions: [],
    safety_flag: false,
  }
}

function late(request: ConsultRequest): ToneAnswer {
  const when = request.answers[0] || '21時'
  const duty = request.answers[1] || 'お風呂'
  const unknown = when === 'まだわからない'
  const dutyLine = duty === '特になし' ? '夕食のあと片付け' : duty === 'お風呂' ? '風呂' : duty
  const say = unknown
    ? `残業で遅くなる。着く時刻は分かったら送る。今夜の${dutyLine}、お願いできる？帰りに残りは俺がやる。`
    : `残業で遅くなる。${when}ごろ着く。今夜の${dutyLine}、お願いできる？帰りに残りは俺がやる。`
  const lead = unknown
    ? '帰りが遅くなります。時刻は未定です。分かった時刻と、家へ移る仕事を1つ伝えます。'
    : '帰りが遅くなります。着く時刻と、その時間に家へ移る仕事を先に1つ伝えます。'
  return {
    状況整理: withChild(lead, request, request.today),
    気づき: '遅れることより、時刻と帰り道の仕事が見えているかの方が先です。',
    一手: [
      unknown
        ? step('分かったら時刻を再送', '未定のままだと、食事と風呂の段取りが家に残ります', '事前に伝える', 'いま', [
            'いま「遅くなる」だけ送る',
            '時刻が分かったらもう一度送る',
          ])
        : step(`${when}ごろ着くと送る`, '先に時刻があると、食事と風呂の時間を動かせます', '事前に伝える', 'いま', [
            '着く時刻を1つ書く',
            '遅れる分を一文で送る',
          ]),
      step(`今夜の${dutyLine}を頼む`, '抜ける時間の仕事を、1つだけ渡します', '事前に伝える', 'いま', [
        `${dutyLine}を一文で頼む`,
        'ほかは帰ってから自分がやると書く',
      ]),
      step('翌朝の準備を自分がやる', '着いたあと、翌朝の準備を引き取ります', '後でフォロー', '翌朝', ['着替えと連絡帳を見る', '朝食の用意を自分がやる']),
    ],
    声かけ例: say,
    明日やること: '朝の準備を自分がやる',
    questions: [],
    safety_flag: false,
  }
}

function mine(request: ConsultRequest): ToneAnswer {
  const what = request.answers[0] || '自分の時間'
  return {
    状況整理: `${what}の時間を取りたい、で大丈夫です。先に相手のひとり時間を置きます。`,
    気づき: '自分の時間だけを先に言うと、調整が残りやすいです。',
    一手: [
      step('土曜午前は子どもを見る', '相手のひとり時間を先に置きます', '先にやる', '土曜午前', ['午前の予定を空ける', 'その時間は自分が子どもを見る']),
      step(`日曜朝に${what}`, '起きた直後は、相手の負担が少ない時間です', '今やる', '日曜朝', ['7時から9時まで', '終わったら朝の続きを自分がやる']),
      step('二つをセットで聞く', '自分の時間だけを先に言わない', '事前に伝える', '今夜', ['相手の時間を先に言う', '自分の時間は確認の形で聞く']),
    ],
    声かけ例: `土曜の午前は俺が子ども見るから、好きに使って。日曜の朝、${what}してもいい？`,
    明日やること: '土曜午前は自分が子どもを見る',
    questions: [],
    safety_flag: false,
  }
}

function clash(request: ConsultRequest): ToneAnswer {
  const left = request.answers[0] || '寝かしつけ'
  const first =
    left === '家事'
      ? step('今夜の家事を1つやる', '見える家事を1つ動かすと、夜の残りが減ります', '今やる', '今夜', ['残っている家事を1つ選ぶ', 'それ以外は翌朝に回す'])
      : left === '話し合い'
        ? step('今夜は話し合いをしない', '疲れている夜に、原因を決めない方が先です', 'やらない', '今夜', ['今夜は原因を聞かない', '返事は短く、行動で返す'])
        : step('今夜の寝かしつけをやる', '残っている夜の仕事を、1つ動かす方が先です', '今やる', '今夜', ['お風呂のあと寝かしつけをやる', '30分は相手が休めるようにする'])
  const say =
    left === '家事'
      ? '今夜の残り、俺がやるね。先に休んでて。'
      : left === '話し合い'
        ? '今日は寝かしつけ、俺がやるね。話は明日でいいよ。'
        : '今日は寝かしつけ、俺がやるね。先に休んでて。'
  return {
    状況整理: '怒られたあとに、理由を今夜決める必要はありません。残っている夜の仕事を1つ動かす方が先です。',
    気づき: '気持ちの原因より、家の余裕が足りていない可能性があります。',
    一手: [
      first,
      step('原因は今夜聞かない', '気持ちの原因は、今夜決めなくて大丈夫です', 'やらない', '今夜', ['今夜は原因を聞かない', '返事は短く、行動で返す']),
      step('朝の準備を1つやる', '翌朝の負荷を、自分が1つ引き取ります', '後でフォロー', '翌朝', ['着替えと連絡帳を見る', '朝食の用意を自分がやる']),
    ],
    声かけ例: say,
    明日やること: '朝の準備を1つ自分がやる',
    questions: [],
    safety_flag: false,
  }
}

function withChild(lead: string, request: ConsultRequest, around: string): string {
  const fact = childFact(request, around)
  if (!fact) return lead
  const next = `${lead}${fact}。`
  return next.length <= 120 ? next : lead
}
