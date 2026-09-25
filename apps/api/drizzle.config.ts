import { defineConfig } from 'drizzle-kit'

// Only `generate` is used, which needs no connection. Migrations are applied
// by the api itself on boot.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
})
