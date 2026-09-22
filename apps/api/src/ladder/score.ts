import { bannedHits, countWords, isDegenerate, meterProgress, type Ladder } from './rules'

// Takes { id: statement } and returns { id: probability }. Injected so tests
// can score without a network call.
export type Judge = (
  text: string,
  statements: Record<string, string>,
) => Promise<Record<string, number>>

export type RuleResult = {
  id: string
  text: string
  hint: string
  satisfied: boolean
  progress: number
  // Local rules explain themselves: which banned words, how many words.
  hits?: string[]
  words?: { count: number; max: number }
}

export type ScoreResult = {
  words: number
  degenerate: boolean
  rules: RuleResult[]
  unlocked: number
  total: number
  // The rule that just arrived, if this attempt satisfied every live rule.
  revealed: { id: string; text: string; hint: string } | null
  cleared: boolean
}

export async function scoreLadder(
  ladder: Ladder,
  text: string,
  requested: number,
  judge: Judge,
): Promise<ScoreResult> {
  const unlocked = Math.max(1, Math.min(Math.trunc(requested) || 1, ladder.rules.length))
  const live = ladder.rules.slice(0, unlocked)
  const words = countWords(text)
  const degenerate = isDegenerate(text)
  const judged = words > 0 && !degenerate

  // Every live meter goes into one call, so rule 8 costs the same round trip
  // as rule 1.
  const meters = live.filter((r) => r.kind === 'meter')
  const probabilities =
    judged && meters.length
      ? await judge(text, Object.fromEntries(meters.map((m) => [m.id, m.statement])))
      : {}

  const rules = live.map((rule): RuleResult => {
    const base = { id: rule.id, text: rule.text, hint: rule.hint }
    switch (rule.kind) {
      case 'meter': {
        const progress = judged ? meterProgress(rule, probabilities[rule.id] ?? 0) : 0
        return { ...base, satisfied: judged && progress >= 1, progress }
      }
      case 'forbid': {
        const hits = bannedHits(text, rule.stems)
        return { ...base, satisfied: judged && !hits.length, progress: hits.length ? 0 : 1, hits }
      }
      case 'maxWords': {
        const ok = words <= rule.value
        return {
          ...base,
          satisfied: judged && ok,
          progress: ok ? 1 : rule.value / words,
          words: { count: words, max: rule.value },
        }
      }
    }
  })

  const allHold = rules.every((r) => r.satisfied)
  const atEnd = unlocked === ladder.rules.length
  const next = allHold && !atEnd ? ladder.rules[unlocked] : undefined

  return {
    words,
    degenerate,
    rules,
    unlocked: next ? unlocked + 1 : unlocked,
    total: ladder.rules.length,
    revealed: next ? { id: next.id, text: next.text, hint: next.hint } : null,
    cleared: allHold && atEnd,
  }
}
