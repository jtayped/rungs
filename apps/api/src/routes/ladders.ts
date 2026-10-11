import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { rateLimit, withUser, type AppEnv } from '../context'
import { jev } from '../jev'
import { getProgress, saveProgress } from '../ladder/progress'
import { isOut, today } from '../ladder/schedule'
import { scoreLadder, type ScoreResult } from '../ladder/score'
import { asLadder, getLadder, listLadders } from '../ladder/store'

const scoreBody = z.object({
  text: z.string().max(4000),
  unlocked: z.number().int().min(1),
})

// What the web app may know about a ladder before playing it. Rule text never
// leaves the server: the player only ever sees what they have unlocked. Rule 1
// is the exception, since it's on screen the moment a ladder opens.
const info = (row: {
  id: string
  title: string
  date: string
  rules: readonly { text: string }[]
}) => ({
  id: row.id,
  title: row.title,
  date: row.date,
  total: row.rules.length,
  first: row.rules[0]!.text,
})

export const ladderRoutes = new Hono<AppEnv>()
  .get('/', async (c) => {
    const day = today()
    const rows = await listLadders()
    return c.json(
      {
        ladders: rows
          .filter((r) => isOut(r, day))
          .map((r) => ({ ...info(r), solutions: r.solutions })),
        // Only the date and size of a ladder that isn't out yet, so its title
        // and rules can still change before anyone sees them.
        upcoming: rows
          .filter((r) => !isOut(r, day))
          .reverse()
          .map((r) => ({ date: r.date, total: r.rules.length })),
      },
      200,
    )
  })
  .get('/:id', async (c) => {
    const row = await getLadder(c.req.param('id'))
    if (!row) return c.json({ error: 'no such ladder.' }, 404)
    return c.json({ ...info(row), explanation: row.explanation, hints: row.hints }, 200)
  })
  // Scoring calls Jev, which is paid per call. The client scores after every
  // 450 ms pause in typing, about 130 a minute at most, so the minute cap sits
  // above that and the daily cap bounds what one visitor can spend.
  .post(
    '/:id/score',
    rateLimit(150, 60_000),
    rateLimit(10_000, 24 * 60 * 60_000),
    withUser,
    zValidator('json', scoreBody),
    async (c) => {
      const at = new Date()
      const row = await getLadder(c.req.param('id'))
      if (!row) return c.json({ error: 'no such ladder.' }, 404)
      const { text, unlocked: asked } = c.req.valid('json')
      const me = c.get('user')
      // Judging a draft needs a session, anonymous or not, because that is
      // where the unlock count lives. The client opens one and retries.
      if (text.trim() && !me) return c.json({ error: 'no session.' }, 401)

      // The client may step back (starting over) but never past what the judge
      // has revealed, or it could ask for every rule's text up front.
      const saved = me ? await getProgress(me.id, row.id) : null
      const unlocked = Math.min(asked, saved?.unlocked ?? 1)

      let result: ScoreResult | undefined
      try {
        result = await scoreLadder(asLadder(row), text, unlocked, jev)
      } finally {
        // Saved even when the judge fails, so an outage doesn't lose the draft.
        if (me) {
          await saveProgress(me.id, row.id, at, {
            text,
            unlocked: result?.unlocked ?? unlocked,
            best: result?.cleared ? result.words : null,
          })
        }
      }
      return c.json(result, 200)
    },
  )
