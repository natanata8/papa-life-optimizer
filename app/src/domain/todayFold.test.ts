import assert from 'node:assert/strict'
import test from 'node:test'
import { moreSection, todayFold } from './todayFold.ts'

test('今日の1画面目は10個まで', () => {
  const decide = todayFold({ phase: 'decide', morningReview: false })
  assert.ok(decide.length <= 10)
  assert.equal(decide.includes('why'), true)
  assert.equal(decide.includes('accept'), true)
  for (const phase of ['decide', 'telling', 'done', 'passed', 'quiet'] as const) {
    assert.ok(todayFold({ phase, morningReview: false }).length <= 10, phase)
    assert.ok(todayFold({ phase, morningReview: true }).length <= 10, `${phase} morning`)
  }
})

test('ほかにできることは、中身があるときだけ出す', () => {
  assert.equal(moreSection([]), null)
  assert.equal(moreSection(['', '  ']), null)
  const block = moreSection(['帰宅前にできる一手', ' '])
  assert.deepEqual(block, { summary: 'ほかにできること', entries: ['帰宅前にできる一手'] })
  const hidden = todayFold({ phase: 'decide', morningReview: false, more: false })
  assert.equal(hidden.includes('more'), false)
  assert.ok(hidden.length <= 10)
  const shown = todayFold({ phase: 'decide', morningReview: false, more: true })
  assert.equal(shown.at(-1), 'more')
  assert.ok(shown.length <= 10)
})
