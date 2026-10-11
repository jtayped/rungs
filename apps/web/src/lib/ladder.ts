import type { AppType } from '@rungs/api'
import { hc } from 'hono/client'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { env } from '~/env'

// Server-side reads straight from the API. Everything here is public. The
// solution list can take the viewer's cookie, but only so it can mark their
// own post. A read that hangs fails after 5 s instead of holding the page.
const server = hc<AppType>(env.API_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, signal: AbortSignal.timeout(5000) }),
})

export const getLadder = cache(async (id: string) => {
  const res = await server.ladders[':id'].$get({ param: { id } })
  if (res.ok) return res.json()
  if (res.status === 404) notFound()
  throw new Error(`ladder ${id}: api unavailable`)
})

export const listLadders = cache(async () => {
  const res = await server.ladders.$get()
  if (!res.ok) throw new Error(`ladders: ${res.status}`)
  return res.json()
})

export async function listSolutions(ladder: string, cookie = '') {
  const res = await server.ladders[':id'].solutions.$get(
    { param: { id: ladder } },
    { headers: { cookie } },
  )
  if (!res.ok) throw new Error(`solutions ${ladder}: ${res.status}`)
  return res.json()
}

export const getSolution = cache(async (id: string) => {
  const res = await server.solutions[':id'].$get({ param: { id } })
  if (res.ok) return res.json()
  if (res.status === 404) notFound()
  throw new Error(`solution ${id}: api unavailable`)
})

// The newest page of the feed. The browser loads the rest.
export async function firstFeedPage() {
  const res = await server.solutions.$get({ query: {} })
  if (!res.ok) throw new Error(`feed: ${res.status}`)
  return res.json()
}
