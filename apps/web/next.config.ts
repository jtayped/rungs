import { join } from 'node:path'
import type { NextConfig } from 'next'
import { env } from './src/env'
import { ANALYTICS_PATH } from './src/lib/track'

// The browser only ever talks to /api on its own origin; Next forwards it to
// the Hono server. No CORS, and the API's address stays a deploy-time detail.
const config: NextConfig = {
  reactStrictMode: true,
  // A self-contained server for the Docker image. Tracing starts at the repo
  // root so the workspace packages land in the bundle too.
  output: 'standalone',
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // No framing, so the sign-in and post buttons can't be clickjacked.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      // better-auth sits under /api/auth on the API too, so its own paths and
      // cookies line up with what the browser sees.
      { source: '/api/auth/:path*', destination: `${env.API_URL}/api/auth/:path*` },
      { source: '/api/:path*', destination: `${env.API_URL}/:path*` },
      // The visitor's address reaches Umami as Cloudflare's cf-connecting-ip,
      // which the rewrite passes on and Umami reads before anything else.
      ...(env.NEXT_PUBLIC_UMAMI_HOST
        ? [
            {
              source: `${ANALYTICS_PATH}/script.js`,
              destination: `${env.NEXT_PUBLIC_UMAMI_HOST}/script.js`,
            },
            {
              source: `${ANALYTICS_PATH}/api/send`,
              destination: `${env.NEXT_PUBLIC_UMAMI_HOST}/api/send`,
            },
          ]
        : []),
    ]
  },
}

export default config
