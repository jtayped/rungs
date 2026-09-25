import { migrate as run } from 'drizzle-orm/postgres-js/migrator'
import { db } from './client'

// Runs on boot, so a deploy needs no separate migration step. Both `pnpm dev`
// and the image start from the api's own folder, where drizzle/ lives.
export const migrate = () => run(db, { migrationsFolder: 'drizzle' })
