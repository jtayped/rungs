import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import type { Rule } from '../ladder/rules'

const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

// A ladder goes live on its `date`. Until then the collection only shows that
// it's coming. Rows come from ladders/index.ts, synced on boot, never from the
// app.
export const ladders = pgTable('ladders', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  rules: jsonb('rules').$type<Rule[]>().notNull(),
  // MDX, rendered by the web app on the about page.
  explanation: text('explanation').notNull().default(''),
  hints: jsonb('hints').$type<string[]>().notNull().default([]),
  date: date('date').notNull(),
  ...timestamps,
})

// One per player per ladder. Posting again replaces it.
export const solutions = pgTable(
  'solutions',
  {
    id: serial('id').primaryKey(),
    ladderId: text('ladder_id')
      .notNull()
      .references(() => ladders.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    // The player's note on their own post. Plain text, one line.
    comment: text('comment'),
    words: integer('words').notNull(),
    ...timestamps,
  },
  (t) => [
    unique().on(t.ladderId, t.userId),
    index().on(t.ladderId, t.words),
    index().on(t.updatedAt, t.id),
  ],
)

// Where each player is on each ladder, anonymous players included. Only the
// score route writes it, so `unlocked` and `best` only ever come from what the
// judge saw.
export const progress = pgTable(
  'progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ladderId: text('ladder_id')
      .notNull()
      .references(() => ladders.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    unlocked: integer('unlocked').notNull(),
    // Fewest words in a clear. Null until the ladder has been cleared.
    best: integer('best'),
    // When the score request that wrote this arrived, not when it finished.
    updatedAt: timestamp('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.ladderId] })],
)

// Below: the tables better-auth expects, written out by hand to match
// @better-auth/core's getAuthTables for v1.7.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Set by better-auth's anonymous plugin for players who haven't signed in.
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  ...timestamps,
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.identifier)],
)
