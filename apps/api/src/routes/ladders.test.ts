import assert from 'node:assert/strict'
import { after, test } from 'node:test'

// Against a real Postgres, so it also proves the migrations and the ladder
// sync run on an empty database. CI provides one; locally, point DATABASE_URL
// at compose.dev.yaml's to run it.
const db = process.env.DATABASE_URL ? false : 'needs DATABASE_URL'
// An empty draft never reaches the judge, so the key is never used.
process.env.OPENROUTER_API_KEY ||= 'unused'

test('a draft can never unlock more rules than the judge has revealed', { skip: db }, async () => {
  const { migrate } = await import('../db/migrate')
  const { syncLadders } = await import('../ladder/sync')
  const { sql } = await import('../db/client')
  const { default: app } = await import('../app')
  after(() => sql.end())
  await migrate()
  await syncLadders()

  const session = await app.request('/api/auth/sign-in/anonymous', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000' },
  })
  assert.equal(session.status, 200)
  const cookie = session.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ')

  const res = await app.request('/ladders/a-few-words/score', {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ text: '', unlocked: 8 }),
  })
  assert.equal(res.status, 200)
  const body = (await res.json()) as { unlocked: number; rules: unknown[]; revealed: unknown }
  assert.equal(body.unlocked, 1)
  assert.equal(body.rules.length, 1)
  assert.equal(body.revealed, null)
})
