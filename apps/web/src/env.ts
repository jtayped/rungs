import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    API_URL: z.url().default('http://localhost:3001'),
    // Public origin, so og:image, robots.txt and the sitemap use absolute URLs.
    // Prerendered pages read it at build time.
    SITE_URL: z.url().default('http://localhost:3000'),
  },
  // Umami. Without both, the site loads no analytics. Public so they're baked
  // in at build time, where the rewrites to the host are made too.
  client: {
    NEXT_PUBLIC_UMAMI_HOST: z.url().optional(),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.uuid().optional(),
  },
  runtimeEnv: {
    API_URL: process.env.API_URL,
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_UMAMI_HOST: process.env.NEXT_PUBLIC_UMAMI_HOST,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  },
  emptyStringAsUndefined: true,
})
