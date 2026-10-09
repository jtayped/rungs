import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { auth } from './auth'
import { withUser, type AppEnv } from './context'
import { env } from './env'
import { ladderRoutes } from './routes/ladders'
import { solutionRoutes } from './routes/solutions'

const app = new Hono<AppEnv>()
  // Bodies are read whole before validation, so cap them first. The largest
  // real one is a 4000-character solution.
  .use(bodyLimit({ maxSize: 32 * 1024 }))
  .get('/health', (c) => c.json({ ok: true, commit: env.RUNGS_COMMIT }))
  // better-auth owns everything under here. The web app forwards
  // /api/auth/* unchanged, so the path matches its basePath.
  .on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  .get('/me', withUser, (c) => {
    const user = c.get('user')
    return c.json(user ? { email: user.email, name: user.name || null } : null)
  })
  .route('/ladders', ladderRoutes)
  .route('/ladders', solutionRoutes)
  .onError((err, c) => {
    if (err instanceof HTTPException) return err.getResponse()
    console.error(err)
    return c.json({ error: 'the judge is unavailable right now.' }, 502)
  })

export type AppType = typeof app
export default app
