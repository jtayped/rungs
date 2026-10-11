import { serve } from '@hono/node-server'

try {
  process.loadEnvFile('.env.local')
} catch {
  // No local env file; the environment has everything.
}

const { env } = await import('./env')
const { migrate } = await import('./db/migrate')
const { syncLadders } = await import('./ladder/sync')
const { pruneAnonymous } = await import('./auth')
await migrate()
await syncLadders()
const { default: app } = await import('./app')

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`api → http://localhost:${info.port}`)
})

// Not awaited, so a slow prune doesn't hold back the server.
const prune = () => pruneAnonymous().catch((err: unknown) => console.error('prune:', err))
void prune()
setInterval(() => void prune(), 24 * 60 * 60_000)
