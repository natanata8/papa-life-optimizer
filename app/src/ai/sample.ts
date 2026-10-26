import { addDays, formatMd } from '@/domain/dates.ts'
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
      '前回微妙だった一手は、今回の候補から外しています',
      '置き換える',
      '今夜',
      ['前回と違う一手を1つ選ぶ', '日時だけ先に伝える'],
    ),
  ]
}

function noteBlocked(answer: ToneAnswer, blocked: string[]): ToneAnswer {
  if (blocked.length === 0) return answer
  const extra = '前に微妙だった一手は、今回の候補から外しています。'
  return {
    ...answer,
    一手: withoutBlocked(answer.一手, blocked),
    気づき: answer.気づき ? `${answer.気づき}${extra}` : extra,
  }
}

export function sampleAnswer(request: ConsultRequest): ToneAnswer {
  if (request.entry === 'invisible') return invisibleAnswer(request)
  const blocked = blockedTitles(request.memory)
  if (request.scene === 'nomi') return noteBlocked(nomi(request), blocked)
  if (request.scene === 'tired') return noteBlocked(tired(request), blocked)
  if (request.scene === 'week') return noteBlocked(week(request), blocked)
  if (request.scene === 'me') return noteBlocked(mine(request), blocked)
  if (request.scene === 'late') return noteBlocked(late(request), blocked)
  return {
    状況整理: '受け取りました。近い場面が分かると、残る仕事を1つに絞れます。',
    気づき: '',
    一手: [step('近い場面を1つ選ぶ', '場面が分かると、一手と声かけを出せます', '今やる', '今夜', ['近い場面を1つ選ぶ'])],
    声かけ例: '',
    明日やること: '近い場面をもう一度選ぶ',
    questions: [],
    safety_flag: false,
  }
}

function invisibleAnswer(request: ConsultRequest): ToneAnswer {
  const hint = request.taskHints[0]
  const title = hint?.title || request.userText || 'この段取り'
  const short = title.split('：')[0]
  const steps = hint?.steps?.length ? hint.steps : ['中身を1つ確認する', '足りない物があればメモする']
  return {
    状況整理: hint?.why || `${title}は、やっている人以外からは見えにくい段取りです。全部を代わる必要はありません。`,
    気づき: '1つだけ自分の担当にできるかを見る、で足ります。',
    一手: [step(short, '今週分だけ自分がやってみると、次の声かけが具体的になります', '今やる', '今夜', steps)],
    声かけ例: `${short}、今週は俺がやってみる。いつもどうしてた？コツあったら教えて。`,
    明日やること: steps[0] ?? '中身を1つ確認する',
    questions: [],
    safety_flag: false,
  }
}

function childFact(request: ConsultRequest, around: string): string {
  const next = addDays(around, 1)
  const rows = request.childEvents.filter((event) => event.date === around || event.date === next)
  if (rows.length === 0) return ''
  return rows
    .map((event) => {
      const when = event.date === around ? 'その日' : '翌日'
      const who = event.child ? `${event.child}の` : ''
      const items = event.items.length > 0 ? `、持ち物は${event.items.join('・')}` : ''
      const due = event.deadline ? '、提出・支払いの期限' : ''
      return `${when}は${who}${event.title}${items}${due}`
    })
    .join('。')
}

function nomi(request: ConsultRequest): ToneAnswer {
  const date = request.sceneDate
  const when = formatMd(date)
  const who = request.answers[1]
  const duty = who === 'お風呂' || who === '寝かしつけ' ? who : '夜のこと'
  let prep = '登園バッグの準備'
  let second = step(
    `${formatMd(addDays(date, -1))}の夜に登園バッグを用意する`,
    '自分が抜ける日の前後の仕事を1つ先に引き取ります',
    '先にやる',
    '前日',
    ['着替えとおむつを袋に入れる', '連絡帳を書く', 'タオルと水筒をそろえる'],
  )
  if (request.flags.ensokuNextDay) {
    prep = '遠足のお弁当の仕込み'
    second = step(
      `${formatMd(addDays(date, -1))}の夜に遠足のお弁当を仕込む`,
      `飲み会の夜（${when}）が、遠足の前の晩と重なっています。仕込みを1日早めて自分がやります`,
      '先にやる',
      '前日',
      ['おかずを下ごしらえする', '材料とおやつを確認する', 'リュックに持ち物を入れる'],
    )
  } else if (request.flags.gomiAround) {
    prep = 'ゴミまとめ'
    second = step(
      `${when}の朝にゴミを集めて玄関へ`,
      '自分が抜ける日の前後の仕事を1つ先に引き取ります',
      '先にやる',
      '当日朝',
      ['各部屋のゴミを集める', '玄関に置いて朝は出すだけにする'],
    )
  }
  let morningWhy = '飲み会の翌朝は、相手の手が足りなくなりやすい時間です'
  if (request.family.support.includes('実家が近い（30分以内）')) {
    morningWhy += '。実家が近いので、朝だけ手伝いを頼む手もあります'
  }
  const firstTiming = date === request.today ? 'いま' : '今夜'
  const firstTitle = date === request.today
    ? '今すぐ、今夜の飲み会と帰る時間を伝える'
    : `今夜のうちに${when}の飲み会を伝える`
  return {
    状況整理: `行きたい気持ちは自然なことです。行くか行かないかの前に、抜ける時間に何が誰に移るかを先に整えましょう。${childFact(request, date)}`,
    気づき: '行くかどうかより、抜ける時間の仕事を先に渡しておくかどうかの方が、家に残りやすいです。',
    一手: [
      step(firstTitle, '直前の相談が一番もめやすいので、先に日時と帰る時間を伝えます', '事前に伝える', firstTiming, [
        '日時と帰る時間を決める',
        '夜に任せることを一言で伝える',
        '代わりに引き受けることを伝える',
      ]),
      second,
      step('翌朝の送りと朝ごはんを自分がやる', morningWhy, '後でフォロー', '翌朝', [
        '目覚ましを早めにかける',
        '朝ごはんを用意する',
        '送りを自分がやる',
      ]),
    ],
    声かけ例: `${when}の夜、会社の飲み会に誘われてて、22時半には帰るつもり。その日の${duty}をお願いすることになるから、${prep}は俺が前の日にやっとくね。翌朝の送りも俺がやる。行っても大丈夫そう？`,
    明日やること: prep === 'ゴミまとめ' ? '朝、ゴミを集めて玄関に置く' : '前日の夜に段取りを1つ終える',
    questions: [],
    safety_flag: false,
  }
}

function tired(request: ConsultRequest): ToneAnswer {
  const sharp = request.answers[0] === '言葉がきつい' ? '言葉がきついと、こちらも身構えてしまいますよね。' : ''
  let lead = `${sharp}疲れが重なっている時期かもしれません（理由は決めつけません）。理由を聞き出すより、今夜の負担を1つ減らすのが先です。`
  const state = request.family.pstate
  if (state && !['特になし', '答えない'].includes(state)) {
    lead += ` ${state}とのことなので、体を休められる一手を先にしています。`
  }
  return {
    状況整理: lead,
    気づき: '気持ちの原因を今夜決めるより、残っている仕事を1つ動かす方が先です。',
    一手: [
      step('今夜の寝かしつけを代わって30分空ける', '疲れている夜は、話すより手を動かす方が伝わります', '今やる', '今夜20時半', [
        'お風呂のあとの寝かしつけを自分がやる',
        '30分は相手が何もしなくていい時間にする',
      ]),
      step('明日の朝の園の準備を自分がやる', '毎朝の見えない仕事をひとつ引き取ります', '先にやる', '翌朝7時', [
        '連絡帳と体温を書く',
        '着替えを袋に入れる',
      ]),
      step('今夜は話し合いをしない', '疲れている夜に解決しようとしない。週末に一言だけ聞く', 'やらない', '週末', [
        '今夜は原因を聞かない',
        '週末に「最近しんどくない？」と聞く',
      ]),
    ],
    声かけ例: '今日は寝かしつけ俺がやるから、ゆっくりしてて。明日の朝の準備もやっとく。ほかに代わってほしいことあったら言ってな。',
    明日やること: '朝の園の準備を自分がやる',
    questions: [],
    safety_flag: false,
  }
}

function week(request: ConsultRequest): ToneAnswer {
  const wish = request.answers[0] ?? '近場でゆっくり'
  const partner = request.family.partner || '妻'
  const kids = request.family.kidsCount > 1 ? '子どもたち' : '子ども'
  let lead = '予定の多い週末です。土曜はゆっくりにして、裏の段取りだけ前倒しにしましょう。'
  let first = step('土曜の午前は家でゆっくり、午後に公園を30分', '予定の合間に、外出を短くします', '今やる', '土曜午前', [
    '午前は家にいる',
    '午後に近所の公園へ30分',
  ])
  let say = `土曜は近場でゆっくりしよか。日曜は実家やし。日曜の夜の園の準備は俺がやるわ。`
  if (wish === '妻をひとりにしたい') {
    lead = `いい考えです。${partner}が家にひとりでいられる時間をつくりましょう。日曜は予定があるので、土曜の午前がちょうどいいです。`
    first = step(`土曜の午前、${kids}を連れて公園と図書館へ`, '日曜の予定の前に、午前だけ外へ出ます', '今やる', '土曜午前', [
      '9:30に出る',
      '公園と図書館',
      '12時には帰る',
    ])
    say = `土曜の午前、${kids}連れて公園と図書館行ってくるわ。帰りに日用品も買ってくるから、足りないものあれば教えて。午前はゆっくりしてて。`
  } else if (wish === '家族で出かけたい') {
    lead = '日曜は予定があるので、土曜は近場で短めにすると、日曜に疲れを残しません。'
    first = step('土曜は家族で近場の公園、お昼は外で', '移動を短くして、日曜の予定に疲れを残しません', '今やる', '土曜昼', [
      '10時に出る',
      '徒歩か短い移動の公園',
      '13時には帰る',
    ])
  }
  if (request.family.car === 'ない') {
    first = { ...first, なぜ今: '車なし・歩いて行ける範囲で（家庭プロフィールより）' }
  }
  return {
    状況整理: lead,
    気づき: '週末の中身より、誰がひとりでいられる時間を先に置くかの方が残りやすいです。',
    一手: [
      first,
      step('出かける前に日用品の残りを見て、帰りに買う', '外出と買い物をセットにします', '先にやる', '土曜朝', [
        '洗剤・ティッシュ・おむつの残りを見る',
        '足りない物をメモする',
        '帰りに買う',
      ]),
      step('日曜の夜、週明けの園の持ち物を自分が確認する', '外出のあと夜の仕事を引き取ります', '後でフォロー', '日曜夜', [
        '園のお知らせを見る',
        '着替えとシーツの数を数える',
      ]),
    ],
    声かけ例: say,
    明日やること: '土曜の午前の出方を一言伝える',
    questions: [],
    safety_flag: false,
  }
}

function late(request: ConsultRequest): ToneAnswer {
  const when = request.answers[0] || '21時'
  const duty = request.answers[1] || '寝かしつけ'
  const unknown = when === 'まだわからない'
  const home = request.family.home
  const eta = unknown ? '分かった時点' : when
  const dutyLine = duty === '特になし' ? '夕食のあと片付け' : duty
  const say = unknown
    ? `残業で遅くなる。着く時刻は分かったらすぐ送る。今夜の${dutyLine}、お願いできる？帰ってから残りは俺がやる。`
    : `残業で遅くなる。${when}ごろ着く予定。今夜の${dutyLine}、お願いできる？帰ってから残りと明日の朝の準備は俺がやる。`
  return {
    状況整理: `残業で帰りが遅くなります。${unknown ? '着く時刻はまだ未定です。' : `${when}ごろ着く想定です。`}${dutyLine}がその時間、家に残ります。${home ? `ふだんの帰宅目安は${home}です。` : ''}${childFact(request, request.today)}`,
    気づき: '遅れることより、時刻と、帰ってから自分がやることが先に伝わると、家に残る仕事が減ります。',
    一手: [
      unknown
        ? step('分かった時点で、着く時刻をもう一度送る', '未定のまま夜になると、食事と風呂の段取りが家に残ります', '事前に伝える', 'いま', [
            'いま「遅くなる」だけ送る',
            '時刻が分かったら同じスレッドにもう一度送る',
          ])
        : step(`${when}ごろ着く、と今送る`, '先に時刻があると、食事と風呂の時間を動かせます', '事前に伝える', 'いま', [
            '着く時刻を1つ書く',
            '遅れる分を一文で送る',
          ]),
      step(`今夜の${dutyLine}を頼む`, '抜ける時間の仕事を、全部ではなく1つだけ渡します', '事前に伝える', 'いま', [
        `${dutyLine}を一文で頼む`,
        'ほかは帰ってから自分がやると書く',
      ]),
      step('帰ってから翌朝の準備を自分がやる', `${eta}に着いたあと、翌朝の負荷を引き取ります`, '後でフォロー', '翌朝', [
        '着替えと連絡帳を見る',
        '朝食の用意を自分がやる',
      ]),
    ],
    声かけ例: say,
    明日やること: '朝の準備を自分がやる',
    questions: [],
    safety_flag: false,
  }
}

function mine(request: ConsultRequest): ToneAnswer {
  const what = request.answers[0] || '自分の時間'
  const partner = request.family.partner || '妻'
  return {
    状況整理: `${what}の時間がほしいのは、ごく自然なことです。先に${partner}の時間を置いてから、自分の時間を置くと、気持ちよく取りやすくなります。`,
    気づき: '自分の時間だけを先に言うと、調整が残りやすいです。',
    一手: [
      step(`土曜の午前は自分が${request.family.kidsCount > 1 ? '子どもたち' : '子ども'}を見る`, `${partner}のひとり時間を先に置きます`, '先にやる', '土曜午前', [
        '午前の予定を空ける',
        'その時間は自分が子どもを見る',
      ]),
      step(`日曜の朝、自分の時間（${what}）`, '子どもが起きた直後は、相手の負担が少ない時間帯であることが多いです（家庭によって違います）', '今やる', '日曜朝', [
        '7時から9時まで',
        '終わったら朝の続きを自分がやる',
      ]),
      step('今夜、上の2つをセットで聞く', '自分の時間だけを先に言わない', '事前に伝える', '今夜', [
        '相手の時間を先に言う',
        '自分の時間は確認の形で聞く',
      ]),
    ],
    声かけ例: `土曜の午前は俺が子ども見るから、好きに使って。そのかわり、日曜の朝7時から9時まで${what}してもいい？`,
    明日やること: '土曜の午前を自分が子どもを見る、と伝える',
    questions: [],
    safety_flag: false,
  }
}
