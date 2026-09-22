import { experimental_evaluate as evaluate } from 'ai'
import type { Judge } from './ladder/score'

// Jev, TypeSafe AI's calibrated classifier. Questions in one call are judged
// independently and in parallel against the same text, so a ladder with eight
// live rules still costs a single round trip (~100ms, fractions of a cent).
export const jev: Judge = async (text, statements) => {
  const { answers } = await evaluate({
    model: 'typesafe-ai/jev',
    state: text,
    questions: Object.fromEntries(
      Object.entries(statements).map(([id, instructions]) => [
        id,
        { type: 'boolean' as const, instructions },
      ]),
    ),
  })
  return Object.fromEntries(
    Object.entries(answers).map(([id, a]) => [id, 'probability' in a ? a.probability : 0]),
  )
}
