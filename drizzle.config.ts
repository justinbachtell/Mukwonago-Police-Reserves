import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  dialect: 'postgresql',
  out: './migrations',
  schema: './src/models/Schema.ts',
  strict: true,
  verbose: true,
});
