import type { Ladder } from '../ladder/rules'
import { scoreLadder, type Judge } from '../ladder/score'

export type Verdict = { ok: true; words: number } | { ok: false; failing: string[] }

// A posted solution is re-judged with every rule live. The client's own score
// and word count are never trusted.
export async function verify(ladder: Ladder, text: string, judge: Judge): Promise<Verdict> {
  const result = await scoreLadder(ladder, text, ladder.rules.length, judge)
  if (result.cleared) return { ok: true, words: result.words }
  return { ok: false, failing: result.rules.filter((r) => !r.satisfied).map((r) => r.id) }
}
