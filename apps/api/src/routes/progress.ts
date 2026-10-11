import { Hono } from 'hono'
import { withUser, type AppEnv } from '../context'
import { getProgress, listProgress } from '../ladder/progress'

// The current player's progress, anonymous or signed in. Nobody else's.
export const progressRoutes = new Hono<AppEnv>()
  .use(withUser)
  .get('/', async (c) => {
    const me = c.get('user')
    return c.json(me ? await listProgress(me.id) : [], 200)
  })
  .get('/:id', async (c) => {
    const me = c.get('user')
    return c.json(me ? await getProgress(me.id, c.req.param('id')) : null, 200)
  })
