import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// `pnpm dev` runs under secret-run, which exports the key under its own name.
// The AI SDK looks for AI_GATEWAY_API_KEY.
process.env.AI_GATEWAY_API_KEY ||= process.env.VERCEL_AI_GATEWAY_API_KEY

export const env = createEnv({
  server: {
    AI_GATEWAY_API_KEY: z.string().min(1),
    PORT: z.coerce.number().int().positive().default(3001),
    // Baked into the image at build time. The deploy waits for /health to
    // report the commit it just built.
    RUNGS_COMMIT: z.string().default('dev'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
