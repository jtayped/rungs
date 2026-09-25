import { createMiddleware } from 'hono/factory'
import { auth, type SessionUser } from './auth'

export type AppEnv = { Variables: { user: SessionUser | null } }

// Only mounted on routes that care who is asking. Scoring stays anonymous and
// never touches the session table.
export const withUser = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  c.set('user', session?.user ?? null)
  await next()
})

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get('user')) return c.json({ error: 'sign in first.' }, 401)
  await next()
})
