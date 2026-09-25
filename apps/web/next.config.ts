import { join } from 'node:path'
import type { NextConfig } from 'next'
import { env } from './src/env'

// The browser only ever talks to /api on its own origin; Next forwards it to
// the Hono server. No CORS, and the API's address stays a deploy-time detail.
const config: NextConfig = {
  reactStrictMode: true,
  // A self-contained server for the Docker image. Tracing starts at the repo
  // root so the workspace packages land in the bundle too.
  output: 'standalone',
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  async rewrites() {
    return [
      // better-auth sits under /api/auth on the API too, so its own paths and
      // cookies line up with what the browser sees.
      { source: '/api/auth/:path*', destination: `${env.API_URL}/api/auth/:path*` },
      { source: '/api/:path*', destination: `${env.API_URL}/:path*` },
    ]
  },
}

export default config
