import { z } from 'zod'
import type { Ladder } from './rules'

// What a hand-written ladder in `apps/api/ladders/<id>/ladder.ts` exports.
// The explanation sits next to it as `explanation.mdx`.
export type LadderFile = Ladder & {
  // YYYY-MM-DD, UTC. The ladder is the daily from this day until the next one.
  date: string
  hints: readonly string[]
}

const base = { id: z.string().min(1), text: z.string().min(1), hint: z.string().min(1) }

const rule = z.discriminatedUnion('kind', [
  z.object({
    ...base,
    kind: z.literal('meter'),
    statement: z.string().min(1),
    direction: z.enum(['above', 'below']),
    threshold: z.number().gt(0).lt(1),
  }),
  z.object({ ...base, kind: z.literal('forbid'), stems: z.array(z.string().min(1)).min(1) }),
  z.object({ ...base, kind: z.literal('maxWords'), value: z.number().int().positive() }),
])

// Checked by `ladder:push` before anything reaches the database.
export const ladderFile = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  date: z.iso.date(),
  hints: z.array(z.string().min(1)),
  rules: z
    .array(rule)
    .min(1)
    .refine((rs) => new Set(rs.map((r) => r.id)).size === rs.length, 'rule ids must be unique'),
})
