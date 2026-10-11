import assert from 'node:assert/strict'
import { test } from 'node:test'
import { comment } from './comment'

test('a plain comment passes, trimmed', () => {
  assert.equal(comment.parse('  rule 6 took me an hour. '), 'rule 6 took me an hour.')
})

test('links are refused however they are written', () => {
  for (const s of ['see https://x.example', 'www.spam.example', 'go to spam.com now', 'BIT.LY/x']) {
    assert.equal(comment.safeParse(s).success, false, s)
  }
})

test('sentences with full stops are not links', () => {
  assert.equal(comment.safeParse('it works. mostly. e.g. the ending.').success, true)
})

test('newlines and bidi overrides are refused', () => {
  assert.equal(comment.safeParse('two\nlines').success, false)
  assert.equal(comment.safeParse('abc‮def').success, false)
})

test('over 280 characters is refused', () => {
  assert.equal(comment.safeParse('a'.repeat(281)).success, false)
})
