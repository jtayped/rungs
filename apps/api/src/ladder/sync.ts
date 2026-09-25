import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { count, eq } from 'drizzle-orm'
import { LADDERS } from '../../ladders'
import { db } from '../db/client'
import { ladders, solutions } from '../db/schema'
import { ladderFile } from './file'

// Explanations are read from disk rather than bundled, so the image ships the
// ladders/ folder next to dist/. Both dev and the image run from the api folder.
const explanation = (id: string) =>
  readFile(join('ladders', id, 'explanation.mdx'), 'utf8').catch(() => '')

// Upserts every ladder in ladders/index.ts. Rules on a ladder that already has
// posted solutions are left alone: changing them would quietly invalidate
// every one of those posts.
export async function syncLadders() {
  for (const file of LADDERS) {
    const ladder = ladderFile.parse(file)
    const values = { ...ladder, explanation: await explanation(ladder.id) }

    const [existing] = await db.select().from(ladders).where(eq(ladders.id, ladder.id))
    if (!existing) {
      await db.insert(ladders).values(values)
      continue
    }

    const [posted] = await db
      .select({ n: count() })
      .from(solutions)
      .where(eq(solutions.ladderId, ladder.id))
    const n = posted?.n ?? 0
    const locked = n > 0 && JSON.stringify(existing.rules) !== JSON.stringify(ladder.rules)
    if (locked) console.warn(`ladder ${ladder.id}: ${n} posted solutions, keeping its old rules.`)

    await db
      .update(ladders)
      .set(locked ? { ...values, rules: existing.rules } : values)
      .where(eq(ladders.id, ladder.id))
  }
}
