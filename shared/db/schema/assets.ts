import { pgTable, uuid, varchar, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  path: text('path').notNull(),
  provider: varchar('provider', { length: 20 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  size: integer('size'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
