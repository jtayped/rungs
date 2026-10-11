import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { dailyBudget, limiter } from './limit'

test('allows max calls per key, then refuses until the window ends', () => {
  mock.timers.enable({ apis: ['Date'], now: 0 })
  try {
    const allow = limiter(2, 1000)
    assert.deepEqual([allow('a'), allow('a'), allow('a')], [true, true, false])
    assert.equal(allow('b'), true)
    mock.timers.tick(999)
    assert.equal(allow('a'), false)
    mock.timers.tick(1)
    assert.equal(allow('a'), true)
  } finally {
    mock.timers.reset()
  }
})

test('stays bounded under a flood of distinct keys', () => {
  const allow = limiter(1, 60_000)
  assert.equal(allow('first'), true)
  for (let i = 0; i < 10_000; i++) allow(`flood-${i}`)
  // The oldest key was dropped to make room, so it starts over.
  assert.equal(allow('first'), true)
})

test('the daily budget counts every caller together and starts over at midnight UTC', () => {
  mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-11T23:59:00Z') })
  try {
    const spend = dailyBudget(10)
    assert.deepEqual([spend(6), spend(4), spend(1)], [true, true, false])
    mock.timers.tick(60_000)
    assert.equal(spend(10), true)
  } finally {
    mock.timers.reset()
  }
})
