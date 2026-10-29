import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dayPacks, gymNotice, morningKitLine, shouldShowDayMode, showMorningKit } from './dayMode.ts'
import { hourInRange } from './dates.ts'
import { labelChunks, phraseChunks } from './freed.ts'
import { SCENE_LIST } from './scenes.ts'
import { TASK_ICONS, taskIcon, titleIcon } from './taskIcon.ts'
import { FREED_MIN } from './freed.ts'
import { fallbackScenes } from './scenes.ts'
import {
  BEDTIME_SLIP,
  ROUTINES,
  completionBound,
  dadBusy,
  isBedtimeSlip,
  answerClock,
  nextHand,
  extraOffsets,
  firstStepAt,
  firstUnchecked,
  footerLine,
  freedFor,
  listLabel,
  listedSteps,
  openRoutineCount,
  overlapLine,
  placedTime,
  plusMinutes,
  routineDone,
  rowAt,
  rowTitle,
  shareLine,
  swapPronoun,
  shownMinutes,
  stepsFor,
  stepsInTime,
  tonightFold,
  usedFromChips,
  withoutPassed,
} from './routines.ts'

test('重なる理由は、時刻と名前を1文にする', () => {
  const line = overlapLine('20〜22時', ['寝かしつけ', 'お弁当の準備'])
  assert.equal(line, '20〜22時は寝かしつけとお弁当の準備が重なる')
  assert.equal(line.includes('／'), false)
})

test('お風呂の手順は年齢で出し分け、上の子を洗う手順がある', () => {
  const both = stepsFor('bath', ['4歳', '1歳'], false)
  assert.equal(both.some((step) => step.id === 'bath-3'), true)
  assert.equal(both.some((step) => step.id === 'bath-up'), true)
  assert.equal(shownMinutes('bath', ['4歳', '1歳'], false), FREED_MIN.bath)
  const older = stepsFor('bath', ['4歳'], false)
  assert.equal(older.some((step) => step.id === 'bath-3'), false)
  assert.equal(older.some((step) => step.id === 'bath-up'), true)
})

test('余白は見える手順の合計で、表と揃う', () => {
  assert.equal(freedFor('bath', undefined, ['4歳', '1歳'], false), 30)
  assert.equal(freedFor('tomorrow', undefined, ['4歳'], true), 15)
  assert.equal(freedFor('bath', ['bath-5', 'bath-7'], ['1歳'], false), 10)
  assert.equal(shownMinutes('bath', ['1歳'], false, ['bath-5', 'bath-7']), 10)
})

test('送る文は何を誰がいつやるかを書く', () => {
  const line = shareLine({ titles: ['お風呂（2人とも）', '明日の遠足の持ち物'], pronoun: '俺', back: '19:30' })
  assert.equal(line, '今夜のお風呂（2人とも）と明日の遠足の持ち物は俺がやるね。19:30に帰ります。')
  assert.equal(shareLine({ titles: ['お風呂（2人とも）'], pronoun: '俺', back: '19:30' }), '今夜のお風呂（2人とも）は俺がやるね。19:30に帰ります。')
  assert.equal(line.includes('任せて'), false)
  assert.equal(line.includes('手伝'), false)
  assert.equal(line.includes('は俺が') && line.indexOf('は') !== line.lastIndexOf('は'), false)
  const bath = shareLine({ titles: ['お風呂（2人とも）'], pronoun: '俺', back: '19:30', bound: completionBound(['bath']) })
  assert.equal(bath, '今夜のお風呂（2人とも）は俺がやるね。\n拭く・保湿までやる。19:30に帰ります。')
  assert.equal(bath.includes('手伝'), false)
  assert.equal(completionBound(['bedtime']), '')
  assert.equal(shareLine({ titles: ['寝かしつけ'], pronoun: '俺', back: '19:30' }).includes('手伝'), false)
  assert.equal(rowTitle('morning', ['1歳']).includes('手伝'), false)
  const share = readFileSync(new URL('../screens/Share.tsx', import.meta.url), 'utf8')
  assert.equal(share.includes('ありがとう'), false)
  assert.equal(share.includes('手伝'), false)
  const sample = readFileSync(new URL('../ai/sample.ts', import.meta.url), 'utf8')
  for (const row of sample.split('\n')) {
    if (!row.includes('声かけ例:')) continue
    assert.equal(row.includes('手伝'), false, row.trim())
  }
})

test('一人称を変えても、直した文は一人称だけ替わる', () => {
  const base = '今夜のお風呂は俺がやるね。19:30に帰ります。'
  assert.equal(swapPronoun(base, '俺', '僕'), '今夜のお風呂は僕がやるね。19:30に帰ります。')
  assert.equal(swapPronoun(base, '俺', '自分'), '今夜のお風呂は自分がやるね。19:30に帰ります。')
  assert.equal(swapPronoun(base, '俺', ''), '今夜のお風呂をやるね。19:30に帰ります。')
  assert.equal(swapPronoun('お風呂は俺が先に入る。子どもは19:50。', '俺', '僕'), 'お風呂は僕が先に入る。子どもは19:50。')
  assert.equal(swapPronoun('今夜のお風呂をやるね。19:30に帰ります。', '', '僕'), '今夜のお風呂は僕がやるね。19:30に帰ります。')
  assert.equal(swapPronoun('今夜は任せるね。', '俺', '僕'), null)
  assert.equal(swapPronoun('今夜は任せるね。', '', '俺'), null)
})

test('1つずつはリストと同じチェックの、最初の未了から始まる', () => {
  assert.equal(firstUnchecked(['a', 'b', 'c'], ['a']), 1)
  assert.equal(firstUnchecked(['a', 'b'], ['a', 'b']), 2)
  assert.equal(firstUnchecked(['a'], []), 0)
})

test('自分の予定と重なる時間には家の仕事を提案しない', () => {
  const party = [{ time: '19:00', who: '自分', kind: 'nomikai' }]
  assert.equal(dadBusy(party, '18〜20時'), true)
  assert.equal(dadBusy(party, '20〜22時'), false)
  assert.equal(dadBusy([], '18〜20時'), false)
})

test('相談の使用情報は送った時点のチップで決まり、前の答えは変わらない', () => {
  const labels = ['子ども：4歳・1歳', '両方フルタイム']
  const sent = ['10/27 今夜', '4歳・1歳', '帰宅 19:30']
  const first = usedFromChips(labels, sent)
  assert.deepEqual(first, labels)
  const kept = [...first]
  const next = usedFromChips(labels, sent.filter((chip) => chip !== '4歳・1歳'))
  assert.deepEqual(next, ['両方フルタイム'])
  assert.deepEqual(first, kept)
})

test('仕事名と手順と場面は、語の途中で割れない', () => {
  const labels = [
    '明日の遠足の持ち物',
    'パジャマ・おむつ・タオルを脱衣所に出す',
    '下の子（1歳）を洗う：頭→体',
    '上の子（4歳）を洗う：頭→体',
    '妻がしんどそうで気になる',
    '怒られて、どうしたらいいか分からない',
    ...ROUTINES.flatMap((routine) => [routine.title, ...routine.steps.map((step) => step.title)]),
    ...SCENE_LIST.map((scene) => scene.title),
  ]
  for (const label of labels) {
    const chunks = labelChunks(label)
    assert.equal(chunks.join(''), label, label)
    for (const chunk of chunks) assert.ok([...chunk].length <= 8 || chunk.includes('（目安）'), `${label} → ${chunk}`)
    for (const broken of ['物', 'す', '体', 'る', 'いか']) assert.equal(chunks.includes(broken), false, `${label} → ${broken}`)
  }
  assert.ok(labelChunks('明日の遠足の持ち物').some((chunk) => chunk.includes('持ち物')))
  assert.ok(labelChunks('下の子（1歳）を洗う：頭→体').some((chunk) => chunk.includes('頭→体')))
  assert.ok(labelChunks('妻がしんどそうで気になる').some((chunk) => chunk.includes('気になる')))
  assert.ok(labelChunks('怒られて、どうしたらいいか分からない').some((chunk) => chunk.includes('いいか')))
  assert.ok(labelChunks('パジャマ・おむつ・タオルを脱衣所に出す').some((chunk) => chunk.includes('出す')))
})

test('注意報の線は、その時間の中だけ', () => {
  assert.equal(hourInRange('19:40', '20〜22時'), false)
  assert.equal(hourInRange('20:00', '20〜22時'), true)
  assert.equal(hourInRange('20:30', '20〜22時'), true)
  assert.equal(hourInRange('21:30', '20〜22時'), true)
  assert.equal(hourInRange('22:00', '20〜22時'), false)
})

test('家の仕事には、それぞれ一つの印がある', () => {
  const seen = new Set(ROUTINES.map((routine) => taskIcon(routine.id)))
  for (const name of ['bath', 'bed', 'bag', 'tidy', 'laundry', 'dropoff', 'pickup', 'morning'] as const) {
    assert.equal(seen.has(name), true, name)
  }
  assert.equal(titleIcon('お風呂'), 'bath')
  assert.equal(titleIcon('夕食の片付け'), 'tidy')
  assert.equal(titleIcon('夕食'), 'dinner')
  assert.equal(titleIcon('見えない家事'), 'hidden')
  assert.equal(TASK_ICONS.includes(taskIcon('bath')), true)
})

test('表示の分数は見える手順の合計で、開始は最初の手順', () => {
  for (const routine of ROUTINES) {
    const ages = ['4歳', '1歳'] as const
    const steps = listedSteps(routine.id, [...ages], false)
    const at = rowAt(routine.id, '19:30')
    const label = listLabel(steps, at)
    const sum = stepsFor(routine.id, [...ages], false).reduce((total, step) => total + step.minutes, 0)
    assert.equal(label.minutes, sum, routine.id)
    assert.equal(label.start, plusMinutes(at, steps[0]?.offsetMin ?? 0), routine.id)
  }
  const partial = listedSteps('bath', ['4歳', '1歳'], false, ['bath-5', 'bath-7'])
  const partialLabel = listLabel(partial, rowAt('bath', '19:30'))
  assert.equal(partialLabel.start, '19:58')
  assert.equal(partialLabel.minutes, 10)
  const base = listedSteps('tomorrow', ['4歳', '1歳'], true)
  const offsets = extraOffsets(base, 2)
  const added = listedSteps('tomorrow', ['4歳', '1歳'], true, undefined, [
    { id: 'x', minutes: 3, offsetMin: offsets[0] },
    { id: 'y', minutes: 3, offsetMin: offsets[1] },
  ])
  const addedLabel = listLabel(added, rowAt('tomorrow', '19:30'))
  assert.equal(added.length, 5)
  assert.equal(addedLabel.minutes, 21)
  assert.equal(addedLabel.start, plusMinutes(rowAt('tomorrow', '19:30'), added[0]?.offsetMin ?? 0))
})

test('お風呂の相談は、お風呂の開始時刻に置く', () => {
  assert.equal(placedTime('お風呂', '19:30'), '19:40')
  assert.equal(placedTime('今夜', '19:30'), null)
})

test('相談の時刻は、書いた仕事の開始', () => {
  for (const routine of ROUTINES) {
    assert.equal(answerClock(routine.title, '', '19:30'), rowAt(routine.id, '19:30'), routine.id)
    assert.equal(answerClock('今夜', routine.title, '18:00'), rowAt(routine.id, '18:00'), routine.id)
  }
  assert.equal(answerClock('寝かしつけ', '', '19:30'), '20:30')
  assert.notEqual(answerClock('寝かしつけ', '', '19:30'), '21:00')
  assert.equal(answerClock('お風呂', '湯船は短くてOK', '19:30'), '19:40')
  assert.equal(answerClock('今夜', '言い換えてもう一度', '19:30'), null)
})

test('小さいお風呂の見出しは、最初の手順の時刻から始まる', () => {
  assert.equal(firstStepAt('19:40', [{ offsetMin: 18 }, { offsetMin: 25 }]), '19:58')
  assert.equal(firstStepAt('19:40', [{ offsetMin: 0 }, { offsetMin: 2 }]), '19:40')
})

test('手順が全部終わると、行と余白の文は終わったになる', () => {
  const ages = ['4歳', '1歳'] as const
  const ids = stepsFor('bath', [...ages], false).map((step) => step.id)
  const open = { routineId: 'bath', checked: ids.slice(0, 1) }
  const done = { routineId: 'bath', checked: ids }
  assert.equal(routineDone(open, [...ages], false), false)
  assert.equal(routineDone(done, [...ages], false), true)
  assert.equal(footerLine(1, 0, 30), '1つ引き受け中 → 家に30分の余白（目安）')
  assert.equal(footerLine(1, 1, 30), '1つ終わった → 家に30分の余白（目安）')
})

test('パスした日に引き受けると、パスは残らない', () => {
  const accept = { '2026-10-27|夜': { phase: 'passed' }, '2026-10-27|夕方': { phase: 'done' }, '2026-10-28|夜': { phase: 'passed' } }
  const next = withoutPassed(accept, '2026-10-27')
  assert.equal(next['2026-10-27|夜'], undefined)
  assert.equal(next['2026-10-27|夕方']?.phase, 'done')
  assert.equal(next['2026-10-28|夜']?.phase, 'passed')
})

test('共有しても、終わっていない手順の件数は残る', () => {
  const ages = ['4歳', '1歳'] as const
  const ids = stepsFor('bath', [...ages], false).map((step) => step.id)
  const shared = [{ routineId: 'bath', checked: [], sharedAt: '2026-10-27T10:00:00.000Z' }]
  assert.equal(openRoutineCount(shared, [...ages], false), 1)
  assert.equal(openRoutineCount([{ routineId: 'bath', checked: ids, sharedAt: '2026-10-27T10:00:00.000Z' }], [...ages], false), 0)
})

test('足した手順は最後の時刻のあとで、時刻順に並ぶ', () => {
  const base = [
    { id: 'a', offsetMin: 0, minutes: 8 },
    { id: 'b', offsetMin: 13, minutes: 2 },
  ]
  const offsets = extraOffsets(base, 2)
  assert.deepEqual(offsets, [15, 18])
  const merged = stepsInTime([
    { id: 'b', offsetMin: 13 },
    { id: 'x', offsetMin: offsets[0] },
    { id: 'a', offsetMin: 0 },
    { id: 'y', offsetMin: offsets[1] },
  ])
  assert.deepEqual(merged.map((step) => step.id), ['a', 'b', 'x', 'y'])
})

test('日表示と重なりの文は、語の途中で割れない', () => {
  const child = '上の子 遠足（お弁当の日）（お弁当、水筒、レジャーシート）'
  const estimate = 'この時間の見立ては「インフルエンザ予防接種の予約を確認」。'
  const banner = overlapLine('20〜22時', ['寝かしつけ', '明日の遠足の持ち物'])
  for (const text of [child, estimate, banner]) {
    const chunks = phraseChunks(text)
    assert.equal(chunks.join(''), text)
    assert.ok(chunks.length > 1)
  }
  assert.ok(phraseChunks(child).some((chunk) => chunk.includes('お弁当の日')))
  assert.ok(phraseChunks(child).some((chunk) => chunk.includes('レジャーシート')))
  assert.ok(phraseChunks(estimate).some((chunk) => chunk.includes('予約を確認')))
  assert.ok(phraseChunks(banner).every((chunk) => chunk.length <= 16))
})

test('お風呂の質問には、お風呂の場面だけを出す', () => {
  const scenes = fallbackScenes('下の子がお風呂を嫌がる')
  assert.deepEqual(scenes, ['お風呂を短くする'])
  assert.equal(scenes.includes('飲み会に行きたい'), false)
  assert.equal(scenes.includes('残業で遅くなる'), false)
})

test('終わった枠の次は、まだ残っている時刻枠を一つだけ返す', () => {
  const ages = ['4歳', '1歳'] as const
  const bath = { routineId: 'bath', checked: stepsFor('bath', [...ages], true).map((step) => step.id) }
  const next = nextHand({ order: ['bath', 'bedtime', 'tomorrow', 'dinnerClean'], taken: [bath], ages: [...ages], ensoku: true })
  assert.equal(next?.id, 'bedtime')
  assert.equal(next?.taken, false)
  assert.equal(next?.label, '次：寝かしつけ（約30分）')
  assert.equal(nextHand({ order: ['bath', 'tomorrow'], taken: [bath], ages: [...ages], ensoku: true })?.label, '次：明日の持ち物')
  assert.equal(
    nextHand({
      order: ['bath', 'bedtime', 'tomorrow'],
      taken: [bath, { routineId: 'bedtime', checked: [] }],
      ages: [...ages],
      ensoku: true,
    }),
    null,
  )
  const bedtime = { routineId: 'bedtime', checked: stepsFor('bedtime', [...ages], true).map((step) => step.id) }
  const after = nextHand({ order: ['bath', 'bedtime', 'tomorrow', 'dinnerClean'], taken: [bath, bedtime], ages: [...ages], ensoku: true })
  assert.equal(after?.id, 'tomorrow')
  assert.equal(after?.taken, false)
  assert.equal(nextHand({ order: ['bath'], taken: [bath], ages: [...ages], ensoku: true }), null)
  assert.equal(nextHand({ order: ['bath', 'bedtime'], taken: [{ routineId: 'bath', checked: [] }], ages: [...ages], ensoku: true }), null)
  assert.equal(/何かある|手伝|ありがとう/.test(next?.label ?? ''), false)
})

test('寝かしつけが止まっても、次の手順だけ返す', () => {
  assert.equal(isBedtimeSlip('寝かしつけが長引いたら？'), true)
  assert.equal(isBedtimeSlip('寝かしつけで起きちゃった'), true)
  assert.equal(isBedtimeSlip('布団に置くと起きる'), true)
  assert.equal(isBedtimeSlip('寝かしつけ 長引'), true)
  assert.equal(isBedtimeSlip('オウチ予報です。18時から20時は寝かしつけ注意報'), false)
  assert.equal(isBedtimeSlip('下の子が湯船を嫌がったら？'), false)
  const text = [BEDTIME_SLIP.lead, BEDTIME_SLIP.note, BEDTIME_SLIP.title, BEDTIME_SLIP.why, ...BEDTIME_SLIP.steps, BEDTIME_SLIP.line, BEDTIME_SLIP.tomorrow].join('\n')
  assert.match(text, /抱っこ/)
  assert.match(text, /暗く/)
  assert.match(text, /置く/)
  assert.equal(/失敗|ダメ出し|下手|ちゃんと|手伝|責めない/.test(text), false)
})

test('今夜の流れの1画面目は12個まで', () => {
  const full = tonightFold({ rows: 4, warning: true, sample: true })
  assert.equal(full.length, 12)
  assert.ok(tonightFold({ rows: 4, warning: false, sample: false }).length <= 12)
  const pointed = tonightFold({ rows: 4, warning: true, sample: true, next: true })
  assert.equal(pointed.length, 12)
  assert.equal(pointed.includes('next'), true)
  assert.equal(pointed.includes('consult'), false)
  const withKit = tonightFold({ rows: 4, warning: true, sample: true, next: true, kit: true })
  assert.equal(withKit.length, 12)
  assert.equal(withKit.includes('kit'), true)
  assert.equal(withKit.includes('small'), false)
})

test('育休かリモートのときだけ、昼の手順を出す', () => {
  assert.equal(shouldShowDayMode({ work: '自分が育休中', home: '19〜20時' }), true)
  assert.equal(shouldShowDayMode({ work: '両方フルタイム', home: '日による・リモート' }), true)
  assert.equal(shouldShowDayMode({ work: '両方フルタイム', home: '19〜20時' }), false)
  const young = dayPacks(['4歳', '1歳'])
  assert.equal(young.length, 3)
  assert.equal(young[0]?.title, '洗濯（干す・取り込むまで）')
  assert.ok(young[0]?.steps.some((step) => step.title.includes('畳んでしまう')))
  assert.equal(young[0]?.steps.at(-1)?.tip, '畳んでしまうまでが完了')
  assert.ok(young.some((pack) => pack.steps.some((step) => step.title === 'おもちゃを一箇所に戻す')))
  assert.ok(young.some((pack) => pack.title.includes('昼寝')))
  assert.equal(dayPacks(['小5〜6']).some((pack) => pack.title.includes('昼寝')), false)
  const text = young.flatMap((pack) => [pack.title, ...pack.steps.map((step) => step.title)]).join('\n')
  assert.equal(text.includes('手伝'), false)
})

test('お知らせの持ち物は、翌朝の一行になる', () => {
  assert.equal(morningKitLine([], '2026-10-27'), null)
  assert.equal(morningKitLine([{ date: '2026-10-28', title: '遠足', items: ['お弁当'], category: '行事' }], '2026-10-27'), null)
  const notice = gymNotice('2026-10-27', 'kid')
  assert.equal(morningKitLine([notice], '2026-10-27'), '持ち物：体操着')
  assert.equal(morningKitLine([notice, { ...notice, items: ['帽子'] }], '2026-10-27'), '持ち物：体操着（ほか1）')
  assert.equal(showMorningKit(false, '帰宅前'), false)
  assert.equal(showMorningKit(true, '朝'), true)
  assert.equal(showMorningKit(null, '帰宅前'), true)
  assert.equal(showMorningKit(null, '朝'), false)
})
