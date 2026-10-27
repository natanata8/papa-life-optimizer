import assert from 'node:assert/strict'
import test from 'node:test'
import { todayFold } from './todayFold.ts'

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
