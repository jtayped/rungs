import { getIP } from 'better-auth/api'
import { createMiddleware } from 'hono/factory'
import { auth, type SessionUser } from './auth'
import { limiter } from './limit'

export type AppEnv = { Variables: { user: SessionUser | null } }

// Only mounted on routes that care who is asking. Players who haven't signed
// in have an anonymous session, so this is set for them too.
export const withUser = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  c.set('user', session?.user ?? null)
  await next()
})

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')
  if (!user || user.isAnonymous) return c.json({ error: 'sign in first.' }, 401)
  await next()
})

// Per visitor, keyed by the same address better-auth's own limiter reads.
// Requests without one share a bucket.
export const rateLimit = (max: number, windowMs: number) => {
  const allow = limiter(max, windowMs)
  return createMiddleware(async (c, next) => {
    if (!allow(getIP(c.req.raw, auth.options) ?? 'unknown')) {
      return c.json({ error: 'too many tries. give it a minute.' }, 429)
    }
    await next()
  })
}
