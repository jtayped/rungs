import { asc, count, desc, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { ladders, solutions } from '../db/schema'
import type { Ladder } from './rules'
import { isOut, today } from './schedule'

type Row = typeof ladders.$inferSelect

// Scoring runs after every pause in typing, so ladders are held in memory
// briefly instead of read per request. A push shows up within a minute.
const TTL = 60_000
const cache = new Map<string, { row: Row; at: number }>()

async function byId(id: string) {
  const hit = cache.get(id)
  if (hit && Date.now() - hit.at < TTL) return hit.row
  const [row] = await db.select().from(ladders).where(eq(ladders.id, id))
  // Misses aren't kept: ids come from the URL, so caching them would let
  // anyone fill memory with made-up ones.
  if (row) cache.set(id, { row, at: Date.now() })
  return row ?? null
}

export const asLadder = (row: Row): Ladder => ({ id: row.id, title: row.title, rules: row.rules })

// Null for unknown ids and for ladders whose day hasn't come yet.
export async function getLadder(id: string, day = today()) {
  const row = await byId(id)
  return row && isOut(row, day) ? row : null
}

// Every ladder, scheduled ones included, newest first. Ladders sharing a date
// keep the order they were first synced in, which is their order in
// ladders/index.ts.
export async function listLadders() {
  return db
    .select({
      id: ladders.id,
      title: ladders.title,
      date: ladders.date,
      rules: ladders.rules,
      solutions: count(solutions.id),
    })
    .from(ladders)
    .leftJoin(solutions, eq(solutions.ladderId, ladders.id))
    .groupBy(ladders.id)
    .orderBy(desc(ladders.date), asc(ladders.createdAt))
}
