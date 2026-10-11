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

export type Ladder = { id: string; title: string; rules: readonly Rule[] }

// A word is a run of letters, marks and numbers, joined by an apostrophe,
// hyphen, period or comma at most ("don't", "well-known", "50,000"). Splitting
// on whitespace would let a blank that isn't whitespace, like U+2800, glue a
// whole post into one word. The editor counts the same way.
export function countWords(text: string) {
  return (text.match(/[\p{L}\p{M}\p{N}]+(?:['’.,-][\p{L}\p{M}\p{N}]+)*/gu) ?? []).length
}

// Whole word, any suffix: 'love' matches 'loved' and 'lovely', not 'glove'.
// Invisible characters (zero-width spaces, soft hyphens) are dropped first, so
// one can't hide a banned word by sitting inside it.
export function bannedHits(text: string, stems: readonly string[]) {
  const visible = text.replace(/\p{Cf}/gu, '')
  const hits = new Set<string>()
  for (const stem of stems) {
    const word = new RegExp(`(?<![\\p{L}\\p{N}])${stem}[\\p{L}\\p{N}]*`, 'giu')
    for (const found of visible.match(word) ?? []) hits.add(found.toLowerCase())
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
