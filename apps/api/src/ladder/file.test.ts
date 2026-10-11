import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LADDERS } from '../../ladders'
import { ladderFile } from './file'

// The boot sync parses every ladder and exits on the first bad one, so a typo
// that typechecks would otherwise only show up as an API that won't start.
test('every listed ladder parses, under its own id', () => {
  for (const file of LADDERS) assert.doesNotThrow(() => ladderFile.parse(file), file.id)
  const ids = LADDERS.map((l) => l.id)
  assert.equal(new Set(ids).size, ids.length, 'ladder ids must be unique')
})
