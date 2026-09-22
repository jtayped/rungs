import type { AppType } from '@rungs/api'
import { hc, type InferResponseType } from 'hono/client'

// Same origin: Next rewrites /api/* to the Hono server.
export const api = hc<AppType>('/api')

export type LadderInfo = InferResponseType<typeof api.ladder.$get, 200>
export type Score = InferResponseType<typeof api.ladder.score.$post, 200>
export type RuleResult = Score['rules'][number]
