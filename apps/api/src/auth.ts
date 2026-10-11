import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { anonymous, emailOTP } from 'better-auth/plugins'
import { and, eq, gt, lt, notExists } from 'drizzle-orm'
import { z } from 'zod'
import { db } from './db/client'
import * as schema from './db/schema'
import { sendCode } from './email'
import { env } from './env'
import { mergeProgress } from './ladder/progress'
import { limiter } from './limit'

// Shown next to every posted solution. Control and bidi-override characters
// are refused, since they can make one name pass for another or flip the text
// printed after it.
export const displayName = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[^\p{Cc}\u202A-\u202E\u2066-\u2069]*$/u)

// better-auth stores whatever name and image the OTP sign-in and update-user
// bodies carry, so the checked, trimmed name replaces the one sent. The app
// never shows an image, so none is accepted.
const checkUser = async (data: { name?: unknown; image?: unknown }) => {
  const name = data.name ? displayName.safeParse(data.name) : undefined
  if (data.image != null || name?.success === false) {
    throw new APIError('BAD_REQUEST', { message: 'pick a name of up to 40 characters.' })
  }
  if (name?.success) return { data: { name: name.data } }
}

// The per-IP limit doesn't stop many IPs mailing one inbox, so each address
// also gets only a few codes an hour. +tags are dropped from the key because
// they all reach the same inbox.
const codesPerEmail = limiter(5, 60 * 60_000)
// Codes to addresses that don't exist bounce, and Resend pauses a sender that
// bounces too often, so sign-in stops for everyone either way. A cap on all
// codes keeps a script to an hour of that rather than a paused account.
const codesInAll = limiter(50, 60 * 60_000)
const inbox = (email: string) => email.toLowerCase().replace(/\+[^@]*@/, '@')

// Email-only accounts, plus an anonymous one for every player who hasn't signed
// in, so progress is saved before they do. A code rather than a link, because
// a link opened from a mail app often lands in a different browser than the
// one playing.
export const auth = betterAuth({
  baseURL: env.SITE_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.SITE_URL],
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  // There are no passwords, but the email-OTP plugin still serves its reset
  // routes, and they mail a code to any registered address.
  disabledPaths: [
    '/email-otp/request-password-reset',
    '/forget-password/email-otp',
    '/email-otp/reset-password',
  ],
  session: { expiresIn: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 },
  advanced: {
    // Cloudflare puts the visitor's address here. By the time a request
    // arrives, x-forwarded-for holds the proxies' hops, which better-auth
    // refuses, leaving every visitor in one shared bucket.
    ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
  },
  rateLimit: {
    // Every code is a real email, so one address can't spray many inboxes.
    customRules: {
      '/email-otp/send-verification-otp': { window: 60 * 60, max: 10 },
      // Every new player opens one, and a phone network can put many players
      // behind one address, so this only stops a script filling the user table.
      '/sign-in/anonymous': { window: 60 * 60, max: 100 },
    },
  },
  databaseHooks: {
    user: { create: { before: checkUser }, update: { before: checkUser } },
    // Nothing reads a session's IP or browser, and every player has a session,
    // so neither is kept.
    session: {
      create: { before: async (s) => ({ data: { ...s, ipAddress: null, userAgent: null } }) },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/email-otp/send-verification-otp') return
      // This runs before better-auth validates the body. No real address is
      // longer than 254, and a key cut from a longer string would keep the whole
      // string alive in the limiter.
      const email = String(ctx.body?.email)
      if (email.length > 254) {
        throw new APIError('BAD_REQUEST', { message: 'that isn’t an email address.' })
      }
      if (!codesPerEmail(inbox(email))) {
        throw new APIError('TOO_MANY_REQUESTS', { message: 'too many codes for that address.' })
      }
      if (!codesInAll('all')) {
        throw new APIError('TOO_MANY_REQUESTS', {
          message: 'lots of people are signing in. try again in a few minutes.',
        })
      }
    }),
  },
  plugins: [
    emailOTP({
      expiresIn: 600,
      storeOTP: 'hashed',
      // Not awaited, so response time doesn't reveal whether the email exists.
      sendVerificationOTP: async ({ email, otp }) => void sendCode(email, otp),
    }),
    // Signing in from an anonymous session hands its progress to the account,
    // then the plugin deletes the anonymous user.
    anonymous({
      onLinkAccount: ({ anonymousUser, newUser }) =>
        mergeProgress(anonymousUser.user.id, newUser.user.id),
    }),
  ],
})

const DAY = 24 * 60 * 60_000

// Anonymous players with no live session left, which takes 90 days without a
// visit. They can't post, so this only ever deletes drafts. A user is created
// a moment before its session, so the newest are left alone.
export const pruneAnonymous = () =>
  db.delete(schema.user).where(
    and(
      eq(schema.user.isAnonymous, true),
      lt(schema.user.createdAt, new Date(Date.now() - DAY)),
      notExists(
        db
          .select({ id: schema.session.id })
          .from(schema.session)
          .where(
            and(
              eq(schema.session.userId, schema.user.id),
              gt(schema.session.expiresAt, new Date()),
            ),
          ),
      ),
    ),
  )

export type SessionUser = typeof auth.$Infer.Session.user
