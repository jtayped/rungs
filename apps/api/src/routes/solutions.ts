import { zValidator } from '@hono/zod-validator'
import { and, asc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { displayName } from '../auth'
import { rateLimit, requireUser, withUser, type AppEnv } from '../context'
import { db } from '../db/client'
import { solutions, user } from '../db/schema'
import { jev } from '../jev'
import { asLadder, getLadder } from '../ladder/store'
import { verify } from '../solutions/verify'

const postBody = z.object({
  text: z.string().trim().min(1).max(4000),
  // Asked for the first time someone posts, since sign-in only takes an email.
  name: displayName.optional(),
})

export const solutionRoutes = new Hono<AppEnv>()
  .use(withUser)
  .get('/:id/solutions', async (c) => {
    const id = c.req.param('id')
    if (!(await getLadder(id))) return c.json({ error: 'no such ladder.' }, 404)
    const me = c.get('user')?.id
    const rows = await db
      .select({
        id: solutions.id,
        userId: solutions.userId,
        name: user.name,
        text: solutions.text,
        words: solutions.words,
        at: solutions.updatedAt,
      })
      .from(solutions)
      .innerJoin(user, eq(user.id, solutions.userId))
      .where(eq(solutions.ladderId, id))
      .orderBy(asc(solutions.words), asc(solutions.updatedAt))
      .limit(200)
    return c.json(
      rows.map(({ userId, at, ...r }) => ({ ...r, at: at.toISOString(), mine: userId === me })),
      200,
    )
  })
  .get('/:id/solutions/mine', async (c) => {
    const me = c.get('user')
    if (!me) return c.json(null, 200)
    const [row] = await db
      .select({ text: solutions.text, words: solutions.words })
      .from(solutions)
      .where(and(eq(solutions.ladderId, c.req.param('id')), eq(solutions.userId, me.id)))
    return c.json(row ?? null, 200)
  })
  // Posting re-judges the text with Jev, a paid call.
  .post(
    '/:id/solutions',
    requireUser,
    rateLimit(20, 60 * 60_000),
    zValidator('json', postBody),
    async (c) => {
      const row = await getLadder(c.req.param('id'))
      if (!row) return c.json({ error: 'no such ladder.' }, 404)
      const me = c.get('user')!
      const { text, name } = c.req.valid('json')

      if (name && name !== me.name) {
        await db.update(user).set({ name }).where(eq(user.id, me.id))
      } else if (!me.name) {
        return c.json({ error: 'pick a name first.' }, 400)
      }

      const verdict = await verify(asLadder(row), text, jev)
      if (!verdict.ok) {
        return c.json({ error: 'not every rule holds.', failing: verdict.failing }, 422)
      }

      await db
        .insert(solutions)
        .values({ ladderId: row.id, userId: me.id, text, words: verdict.words })
        .onConflictDoUpdate({
          target: [solutions.ladderId, solutions.userId],
          set: { text, words: verdict.words, updatedAt: new Date() },
        })
      return c.json({ words: verdict.words }, 201)
    },
  )
  .delete('/:id/solutions/mine', requireUser, async (c) => {
    await db
      .delete(solutions)
      .where(
        and(eq(solutions.ladderId, c.req.param('id')), eq(solutions.userId, c.get('user')!.id)),
      )
    return c.body(null, 204)
  })
