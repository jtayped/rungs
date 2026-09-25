import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { db } from './db/client'
import * as schema from './db/schema'
import { sendCode } from './email'
import { env } from './env'

// Email-only accounts. A code rather than a link, because a link opened from a
// mail app often lands in a different browser than the one playing.
export const auth = betterAuth({
  baseURL: env.SITE_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.SITE_URL],
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  session: { expiresIn: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 },
  plugins: [
    emailOTP({
      expiresIn: 600,
      storeOTP: 'hashed',
      // Not awaited, so response time doesn't reveal whether the email exists.
      sendVerificationOTP: async ({ email, otp }) => void sendCode(email, otp),
    }),
  ],
})

export type SessionUser = typeof auth.$Infer.Session.user
