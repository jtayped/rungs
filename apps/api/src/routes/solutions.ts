import { zValidator } from '@hono/zod-validator'
import { and, asc, desc, eq, lte, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { displayName } from '../auth'
import { rateLimit, requireUser, withUser, type AppEnv } from '../context'
import { db } from '../db/client'
import { ladders, solutions, user } from '../db/schema'
import { jev } from '../jev'
import { today } from '../ladder/schedule'
import { asLadder, getLadder } from '../ladder/store'
import { comment } from '../solutions/comment'
import { verify } from '../solutions/verify'

const postBody = z.object({
  text: z.string().trim().min(1).max(4000),
  comment: comment.optional(),
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
        comment: solutions.comment,
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
      .select({ text: solutions.text, comment: solutions.comment, words: solutions.words })
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
      const note = c.req.valid('json').comment || null

      if (name && name !== me.name) {
        await db.update(user).set({ name }).where(eq(user.id, me.id))
      } else if (!me.name) {
        return c.json({ error: 'pick a name first.' }, 400)
      }

      const verdict = await verify(asLadder(row), text, jev)
      if (!verdict.ok) {
        return c.json({ error: 'not every rule holds.', failing: verdict.failing }, 422)
      }

      // Replacing a post keeps its id, so a link to it keeps working.
      const [saved] = await db
        .insert(solutions)
        .values({ ladderId: row.id, userId: me.id, text, comment: note, words: verdict.words })
        .onConflictDoUpdate({
          target: [solutions.ladderId, solutions.userId],
          set: { text, comment: note, words: verdict.words, updatedAt: new Date() },
        })
        .returning({ id: solutions.id })
      return c.json({ id: saved!.id, words: verdict.words }, 201)
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

const PAGE = 20

// The cursor is the last post's time, then its id.
const feedQuery = z.object({
  before: z
    .string()
    .regex(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(\.\d{1,6})?_\d+$/)
    .optional(),
})

// A post as the feed and its own page show it, on ladders that are out. The
// time is as Postgres prints it, which keeps the microseconds a JS Date would
// drop, so the feed can use it as a cursor.
const posts = () =>
  db
    .select({
      id: solutions.id,
      ladder: ladders.id,
      title: ladders.title,
      name: user.name,
      text: solutions.text,
      comment: solutions.comment,
      words: solutions.words,
      at: sql<string>`${solutions.updatedAt}::text`,
    })
    .from(solutions)
    .innerJoin(user, eq(user.id, solutions.userId))
    .innerJoin(ladders, eq(ladders.id, solutions.ladderId))

export const feedRoutes = new Hono()
  // Newest first, a page at a time. A replaced post counts as new.
  .get('/', zValidator('query', feedQuery), async (c) => {
    const { before } = c.req.valid('query')
    const [at, id] = before?.split('_') ?? []
    const rows = await posts()
      .where(
        and(
          lte(ladders.date, today()),
          at
            ? sql`(${solutions.updatedAt}, ${solutions.id}) < (${at}::timestamp, ${Number(id)})`
            : undefined,
        ),
      )
      .orderBy(desc(solutions.updatedAt), desc(solutions.id))
      .limit(PAGE + 1)

    const items = rows.slice(0, PAGE)
    const last = items.at(-1)
    return c.json({ items, next: rows.length > PAGE && last ? `${last.at}_${last.id}` : null }, 200)
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id')
    // Ids are int4, so nine digits can't overflow the cast.
    if (!/^\d{1,9}$/.test(id)) return c.json({ error: 'no such solution.' }, 404)
    const [row] = await posts().where(and(eq(solutions.id, Number(id)), lte(ladders.date, today())))
    return row ? c.json(row, 200) : c.json({ error: 'no such solution.' }, 404)
  })
