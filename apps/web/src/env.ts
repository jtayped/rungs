import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    API_URL: z.url().default('http://localhost:3001'),
    // Public origin, so og:image, robots.txt and the sitemap use absolute URLs.
    // Prerendered pages read it at build time.
    SITE_URL: z.url().default('http://localhost:3000'),
  },
  client: {},
  runtimeEnv: {
    API_URL: process.env.API_URL,
    SITE_URL: process.env.SITE_URL,
  },
  emptyStringAsUndefined: true,
})
