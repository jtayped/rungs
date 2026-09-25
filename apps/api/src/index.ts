import { serve } from '@hono/node-server'

try {
  process.loadEnvFile('.env.local')
} catch {
  // No local env file; secrets come from secret-run or the host.
}

const { env } = await import('./env')
const { migrate } = await import('./db/migrate')
const { syncLadders } = await import('./ladder/sync')
await migrate()
await syncLadders()
const { default: app } = await import('./app')

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`api → http://localhost:${info.port}`)
})
