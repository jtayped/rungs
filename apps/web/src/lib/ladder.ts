import type { AppType } from '@rungs/api'
import { hc } from 'hono/client'
import { cache } from 'react'
import { env } from '~/env'

// Server-side read of whatever ladder the API is serving right now.
export const getLadder = cache(async () => {
  const res = await hc<AppType>(env.API_URL).ladder.$get()
  if (!res.ok) throw new Error(`ladder: ${res.status}`)
  return res.json()
})
