// A rule is either a Jev `meter` (a calibrated boolean, and every active meter
// goes into one call however many there are) or a check done locally in code.

// `text` is the rule as the player reads it; `hint` is one plain sentence
// explaining it, for anyone who doesn't know the word or the idea.
type RuleBase = { id: string; text: string; hint: string }

export type MeterRule = RuleBase & {
  kind: 'meter'
  statement: string
  direction: 'above' | 'below'
  threshold: number
}

export type ForbidRule = RuleBase & { kind: 'forbid'; stems: readonly string[] }
export type MaxWordsRule = RuleBase & { kind: 'maxWords'; value: number }

export type Rule = MeterRule | ForbidRule | MaxWordsRule

// A ladder is just an ordered list of rules with a name. Nothing outside this
// folder knows what any particular ladder is about.
export type Ladder = { id: string; title: string; rules: readonly Rule[] }

export function countWords(text: string) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

// Whole word, any suffix: 'love' matches 'loved' and 'lovely', not 'glove'.
export function bannedHits(text: string, stems: readonly string[]) {
  const hits = new Set<string>()
  for (const stem of stems) {
    for (const found of text.match(new RegExp(`\\b${stem}\\w*\\b`, 'gi')) ?? []) {
      hits.add(found.toLowerCase())
    }
  }
  return [...hits]
}

// Degenerate spam ("sad sad sad sad sad") dies here without a round trip, so
// the meters never get the chance to reward it.

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'it',
  'is',
  'was',
  'i',
  'you',
  'we',
  'my',
  'me',
  'that',
  'this',
  'for',
  'on',
  'at',
  'be',
  'not',
  'have',
  'has',
  'had',
  'but',
  'with',
  'as',
  'are',
  'so',
  'they',
  'your',
])

const MIN_DIVERSITY = 0.6 // distinct words / total words
const MAX_REPEATS = 3 // of any one non-stopword

export function isDegenerate(text: string) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []
  if (words.length < 5) return false
  if (new Set(words).size / words.length < MIN_DIVERSITY) return true

  const counts = new Map<string, number>()
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1)
  return [...counts].some(([w, c]) => c > MAX_REPEATS && !STOPWORDS.has(w))
}

// How close a meter is to holding, 0..1, with 1 meaning it holds. The UI draws
// this instead of the raw probability, which means nothing to a player.
export function meterProgress(rule: MeterRule, probability: number) {
  if (rule.direction === 'above') {
    return probability >= rule.threshold ? 1 : probability / rule.threshold
  }
  return probability <= rule.threshold ? 1 : (1 - probability) / (1 - rule.threshold)
}
