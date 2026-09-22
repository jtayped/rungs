import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { env } from './env'
import { jev } from './jev'
import { LADDER } from './ladder'
import { scoreLadder } from './ladder/score'

const scoreBody = z.object({
  text: z.string().max(4000),
  unlocked: z.number().int().min(1),
})

// Upcoming rules never leave the server: the player only ever sees what they
// have unlocked.
const app = new Hono()
  .get('/health', (c) => c.json({ ok: true, commit: env.RUNGS_COMMIT }))
  .get('/ladder', (c) => c.json({ id: LADDER.id, title: LADDER.title, total: LADDER.rules.length }))
  .post('/ladder/score', zValidator('json', scoreBody), async (c) => {
    const { text, unlocked } = c.req.valid('json')
    return c.json(await scoreLadder(LADDER, text, unlocked, jev))
  })
  .onError((err, c) => {
    console.error(err)
    return c.json({ error: 'the judge is unavailable right now.' }, 502)
  })

export type AppType = typeof app
export default app
