import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    API_URL: z.url().default('http://localhost:3001'),
    // Public origin, so og:image and friends are absolute. Next falls back to
    // localhost when it's unset, which is right for dev.
    SITE_URL: z.url().optional(),
  },
  client: {},
  runtimeEnv: {
    API_URL: process.env.API_URL,
    SITE_URL: process.env.SITE_URL,
  },
  emptyStringAsUndefined: true,
})
