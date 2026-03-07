import { pgTable, uuid, varchar, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const operationSettings = pgTable(
  'operation_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull(),
    value: jsonb('value').notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('operation_settings_key_idx').on(table.key),
  ],
);
