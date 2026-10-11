import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// The key is also accepted under the project prefix. The OpenRouter provider
// itself only reads OPENROUTER_API_KEY.
process.env.OPENROUTER_API_KEY ||= process.env.RUNGS_OPENROUTER_API_KEY

// Local dev talks to compose.dev.yaml's Postgres with a throwaway auth secret,
// on localhost. In production the database, the secret and the site's origin
// must all be set.
const dev = process.env.NODE_ENV !== 'production'

export const env = createEnv({
  server: {
    OPENROUTER_API_KEY: z.string().min(1),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: dev ? z.url().default('postgres://rungs:rungs@localhost:5434/rungs') : z.url(),
    // Signs session cookies. Any long random string.
    BETTER_AUTH_SECRET: dev
      ? z.string().min(32).default('dev-only-secret-dev-only-secret-dev-only')
      : z.string().min(32),
    // The public origin the browser sees. Auth routes live under it at
    // /api/auth, forwarded by the web app.
    SITE_URL: dev ? z.url().default('http://localhost:3000') : z.url(),
    // Without a key, sign-in codes are printed to the console instead.
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default('rungs <rungs@joeltaylor.business>'),
    // Baked into the image at build time. The deploy waits for /health to
    // report the commit it just built.
    RUNGS_COMMIT: z.string().default('dev'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
