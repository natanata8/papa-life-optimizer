import assert from 'node:assert/strict'
import test from 'node:test'
import { freedFor, overlapLine, shareLine, stepsFor, tonightFold } from './routines.ts'

test('重なる理由は、時刻と名前を1文にする', () => {
  const line = overlapLine('20〜22時', ['寝かしつけ', 'お弁当の準備'])
  assert.equal(line, '20〜22時は寝かしつけとお弁当の準備が重なる')
  assert.equal(line.includes('／'), false)
})

test('お風呂の手順は年齢で出し分け、7つが上限', () => {
  const both = stepsFor('bath', ['4歳', '1歳'], false)
  assert.equal(both.length, 7)
  assert.equal(both.some((step) => step.id === 'bath-3'), true)
  const older = stepsFor('bath', ['4歳'], false)
  assert.equal(older.some((step) => step.id === 'bath-3'), false)
  assert.ok(older.length < 7)
})

test('余白は表か、一部の手順の合計', () => {
  assert.equal(freedFor('bath', undefined, ['1歳'], false), 30)
  assert.equal(freedFor('tomorrow', undefined, ['4歳'], true), 15)
  assert.equal(freedFor('bath', ['bath-5', 'bath-7'], ['1歳'], false), 10)
})

test('送る文は何を誰がいつやるかを書く', () => {
  const line = shareLine({ titles: ['お風呂（2人とも）', '明日の遠足の持ち物'], pronoun: '俺', back: '19:30' })
  assert.equal(line, '今夜はお風呂（2人とも）と、明日の遠足の持ち物は俺がやるね。19:30に帰ります。')
  assert.equal(line.includes('任せて'), false)
})

test('今夜の流れの1画面目は12個まで', () => {
  const full = tonightFold({ rows: 4, warning: true, sample: true })
  assert.equal(full.length, 12)
  assert.ok(tonightFold({ rows: 4, warning: false, sample: false }).length <= 12)
})
