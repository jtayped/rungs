import type { AppType } from '@rungs/api'
import { hc } from 'hono/client'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { env } from '~/env'

// Server-side reads straight from the API. Only public data goes through here,
// so no cookies are forwarded.
const server = hc<AppType>(env.API_URL)

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
