import type { AppType } from '@rungs/api'
import { hc, type InferResponseType } from 'hono/client'

// Same origin: Next rewrites /api/* to the Hono server.
export const api = hc<AppType>('/api')

type Ladders = typeof api.ladders
export type LadderPage = InferResponseType<Ladders[':id']['$get'], 200>
export type LadderInfo = Pick<LadderPage, 'id' | 'title' | 'date' | 'total'>
export type Collection = InferResponseType<Ladders['$get'], 200>
export type Score = InferResponseType<Ladders[':id']['score']['$post'], 200>
export type RuleResult = Score['rules'][number]
export type Solution = InferResponseType<Ladders[':id']['solutions']['$get'], 200>[number]
export type FeedItem = InferResponseType<typeof api.solutions.$get, 200>['items'][number]
export type Progress = InferResponseType<typeof api.me.progress.$get, 200>[number]
