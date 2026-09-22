import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EULOGY } from './eulogy'
import { bannedHits, isDegenerate } from './rules'
import { scoreLadder, type Judge } from './score'

// A judge that says whatever each test needs, keyed by rule id.
const judge =
  (probabilities: Record<string, number>): Judge =>
  async (_text, statements) =>
    Object.fromEntries(Object.keys(statements).map((id) => [id, probabilities[id] ?? 0]))

const PASSING = { form: 0.9, grief: 0.8, dislike: 0.1, 'no-sympathy': 0.1, self: 0.9, gift: 0.9 }
const TEXT = 'We are here to bury a difficult woman who never once forgave anyone at all.'

test('an empty draft never calls the judge and reveals nothing', async () => {
  let called = false
  const r = await scoreLadder(EULOGY, '', 1, async () => ((called = true), {}))
  assert.equal(called, false)
  assert.equal(r.revealed, null)
  assert.equal(r.rules.length, 1)
})

test('satisfying every live rule reveals exactly the next one', async () => {
  const r = await scoreLadder(EULOGY, TEXT, 2, judge(PASSING))
  assert.equal(r.unlocked, 3)
  assert.equal(r.revealed?.id, 'dislike')
  assert.equal(r.cleared, false)
})

test('a failing rule holds the ladder where it is', async () => {
  const r = await scoreLadder(EULOGY, TEXT, 3, judge({ ...PASSING, dislike: 0.8 }))
  assert.equal(r.unlocked, 3)
  assert.equal(r.revealed, null)
})

test('banned words are reported by name', async () => {
  const r = await scoreLadder(EULOGY, `${TEXT} She was loved.`, 5, judge(PASSING))
  assert.deepEqual(r.rules.at(-1)?.hits, ['loved'])
  assert.equal(r.revealed, null)
})

test('clearing the last rule clears the ladder', async () => {
  const r = await scoreLadder(EULOGY, TEXT, 8, judge(PASSING))
  assert.equal(r.cleared, true)
  assert.equal(r.unlocked, 8)
})

test('degenerate spam is never judged', async () => {
  assert.equal(isDegenerate('sad sad sad sad sad sad'), true)
  const r = await scoreLadder(EULOGY, 'sad sad sad sad sad sad', 1, judge(PASSING))
  assert.equal(r.rules[0]?.satisfied, false)
})

test('stems match suffixes but not substrings', () => {
  assert.deepEqual(bannedHits('Lovely gloves', ['love']), ['lovely'])
})
