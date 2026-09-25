import assert from 'node:assert/strict'
import { test } from 'node:test'
import EULOGY from '../../ladders/a-few-words/ladder'
import { isOut, today } from '../ladder/schedule'
import type { Judge } from '../ladder/score'
import { verify } from './verify'

const judge =
  (probabilities: Record<string, number>): Judge =>
  async (_text, statements) =>
    Object.fromEntries(Object.keys(statements).map((id) => [id, probabilities[id] ?? 0]))

const PASSING = { form: 0.9, grief: 0.8, dislike: 0.1, 'no-sympathy': 0.1, self: 0.9, gift: 0.9 }
const TEXT = 'We are here to bury a difficult woman who never once forgave anyone at all.'

test('a solution is judged against every rule, not just the unlocked ones', async () => {
  const seen: string[] = []
  await verify(EULOGY, TEXT, async (text, statements) => {
    seen.push(...Object.keys(statements))
    return judge(PASSING)(text, statements)
  })
  assert.deepEqual(seen, ['form', 'grief', 'dislike', 'no-sympathy', 'self', 'gift'])
})

test('a solution that clears is accepted with the server’s word count', async () => {
  assert.deepEqual(await verify(EULOGY, TEXT, judge(PASSING)), { ok: true, words: 15 })
})

test('a solution that breaks a rule is rejected and names it', async () => {
  const r = await verify(EULOGY, `${TEXT} she was good.`, judge({ ...PASSING, self: 0.2 }))
  assert.deepEqual(r, { ok: false, failing: ['banned', 'self'] })
})

test('ladders dated after today are not out yet', () => {
  const day = today(new Date('2026-09-25T23:59:00Z'))
  assert.equal(day, '2026-09-25')
  assert.equal(isOut({ date: '2026-09-25' }, day), true)
  assert.equal(isOut({ date: '2026-09-26' }, day), false)
})
