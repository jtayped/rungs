import { and, eq, lte, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { progress } from '../db/schema'

export async function getProgress(userId: string, ladderId: string) {
  const [row] = await db
    .select({ text: progress.text, unlocked: progress.unlocked, best: progress.best })
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.ladderId, ladderId)))
  return row ?? null
}

// Enough for the collection and the spoiler checks. Drafts stay out of it.
export function listProgress(userId: string) {
  return db
    .select({
      ladder: progress.ladderId,
      unlocked: progress.unlocked,
      best: progress.best,
      started: sql<boolean>`${progress.text} <> ''`,
    })
    .from(progress)
    .where(eq(progress.userId, userId))
}

type Draft = { text: string; unlocked: number; best: number | null }

// `at` is when the score request arrived. Requests can finish out of order, and
// one that arrived before the saved draft was written is stale. `best` only
// ever goes down.
export async function saveProgress(userId: string, ladderId: string, at: Date, draft: Draft) {
  await db
    .insert(progress)
    .values({ userId, ladderId, ...draft, updatedAt: at })
    .onConflictDoUpdate({
      target: [progress.userId, progress.ladderId],
      set: {
        text: draft.text,
        unlocked: draft.unlocked,
        best: sql`least(${progress.best}, excluded.best)`,
        updatedAt: at,
      },
      setWhere: lte(progress.updatedAt, at),
    })
}

// Folds an anonymous player's progress into the account they signed in to.
// Where both played the same ladder, the newer draft wins and the lower best
// stays.
export async function mergeProgress(from: string, to: string) {
  await db.execute(sql`
    insert into progress (user_id, ladder_id, text, unlocked, best, updated_at)
    select ${to}, ladder_id, text, unlocked, best, updated_at from progress where user_id = ${from}
    on conflict (user_id, ladder_id) do update set
      text = case when excluded.updated_at > progress.updated_at then excluded.text else progress.text end,
      unlocked = case when excluded.updated_at > progress.updated_at then excluded.unlocked else progress.unlocked end,
      best = least(progress.best, excluded.best),
      updated_at = greatest(progress.updated_at, excluded.updated_at)
  `)
}
