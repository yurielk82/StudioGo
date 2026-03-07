import { pgTable, uuid, varchar, boolean, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull(),
    enabled: boolean('enabled').notNull().default(false),
    description: text('description'),
    scope: jsonb('scope'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('feature_flags_key_idx').on(table.key),
  ],
);
