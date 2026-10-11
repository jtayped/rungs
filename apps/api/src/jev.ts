import { openrouter } from '@openrouter/ai-sdk-provider'
import { experimental_evaluate as evaluate } from 'ai'
import { HTTPException } from 'hono/http-exception'
import type { Judge } from './ladder/score'
import { dailyBudget } from './limit'

// Jev, TypeSafe AI's calibrated classifier, through OpenRouter's Decisions
// API. Questions in one call are judged independently and in parallel against
// the same text, so a ladder with eight live rules still costs a single round
// trip (~100ms, fractions of a cent).
const model = openrouter.evaluationModel('~typesafe/jev-latest')

// One cap on every visitor together, since per-address limits don't stop a
// caller with many addresses. Size it to a day's share of the key's spending
// limit, so a flood stops judging until midnight UTC rather than until the
// limit resets.
const spend = dailyBudget(150_000)

export const jev: Judge = async (text, statements) => {
  if (!spend(Object.keys(statements).length)) {
    throw new HTTPException(503, {
      res: Response.json({ error: 'the judge is out of checks for today.' }, { status: 503 }),
    })
  }

  const { answers } = await evaluate({
    model,
    // A stalled provider would otherwise hold each request open for minutes,
    // long after the browser has given up and sent a newer draft.
    abortSignal: AbortSignal.timeout(10_000),
    maxRetries: 1,
    state: text,
    questions: Object.fromEntries(
      Object.entries(statements).map(([id, instructions]) => [
        id,
        { type: 'boolean' as const, instructions },
      ]),
    ),
  })
  return Object.fromEntries(Object.entries(answers).map(([id, a]) => [id, a.probability]))
}
