import assert from 'node:assert/strict'
import test from 'node:test'
import { FREED_MIN } from './freed.ts'
import { dadBusy, dropUsedChip, firstUnchecked, freedFor, overlapLine, shareLine, shownMinutes, stepsFor, tonightFold } from './routines.ts'

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
  assert.equal(line.includes('は俺が') && line.indexOf('は') !== line.lastIndexOf('は'), false)
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

test('年齢チップを外すと使った情報から年齢が消える', () => {
  const used = ['子ども：4歳・1歳', '両方フルタイム']
  assert.deepEqual(dropUsedChip(used, '4歳・1歳'), ['両方フルタイム'])
})

test('今夜の流れの1画面目は12個まで', () => {
  const full = tonightFold({ rows: 4, warning: true, sample: true })
  assert.equal(full.length, 12)
  assert.ok(tonightFold({ rows: 4, warning: false, sample: false }).length <= 12)
})
