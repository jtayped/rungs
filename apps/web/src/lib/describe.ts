import type { RuleView } from './use-ladder'

// Plain words for how a rule is doing. No numbers from the judge ever reach
// the player: they see closeness, not probabilities.
export function describe(rule: RuleView, empty: boolean): string {
  if (rule.state === 'new') return 'new rule'
  if (rule.state === 'holds') return 'holds'
  if (empty) return 'start writing'

  if (rule.hits?.length) return `take out ${rule.hits.map((h) => `“${h}”`).join(', ')}`
  if (rule.words && rule.words.count > rule.words.max) {
    return `cut ${rule.words.count - rule.words.max} ${rule.words.count - rule.words.max === 1 ? 'word' : 'words'}`
  }

  const lead = rule.state === 'broken' ? 'broken' : null
  const near =
    rule.progress >= 0.85 ? 'almost' : rule.progress >= 0.55 ? 'getting there' : 'not yet'
  return lead ? `${lead} · ${near}` : near
}
