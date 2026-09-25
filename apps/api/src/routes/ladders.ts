import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { jev } from '../jev'
import { scoreLadder } from '../ladder/score'
import { asLadder, getDaily, getLadder, listPast } from '../ladder/store'

const scoreBody = z.object({
  text: z.string().max(4000),
  unlocked: z.number().int().min(1),
})

// What the web app may know about a ladder before playing it. Rule text never
// leaves the server: the player only ever sees what they have unlocked.
const info = (row: { id: string; title: string; date: string; rules: readonly unknown[] }) => ({
  id: row.id,
  title: row.title,
  date: row.date,
  total: row.rules.length,
})

export const ladderRoutes = new Hono()
  .get('/today', async (c) => {
    const row = await getDaily()
    return row ? c.json(info(row), 200) : c.json({ error: 'no ladder yet.' }, 404)
  })
  .get('/', async (c) => {
    const rows = await listPast()
    return c.json(rows.map((r) => ({ ...info(r), solutions: r.solutions })))
  })
  .get('/:id', async (c) => {
    const row = await getLadder(c.req.param('id'))
    if (!row) return c.json({ error: 'no such ladder.' }, 404)
    return c.json({ ...info(row), explanation: row.explanation, hints: row.hints }, 200)
  })
  .post('/:id/score', zValidator('json', scoreBody), async (c) => {
    const row = await getLadder(c.req.param('id'))
    if (!row) return c.json({ error: 'no such ladder.' }, 404)
    const { text, unlocked } = c.req.valid('json')
    return c.json(await scoreLadder(asLadder(row), text, unlocked, jev), 200)
  })
