import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: '../../shared/db/schema/index.ts',
  out: '../../shared/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
