import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const announcementTypeEnum = pgEnum('announcement_type', ['BANNER', 'NOTICE', 'POPUP']);

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: announcementTypeEnum('type').notNull(),
  targetRoles: jsonb('target_roles').notNull().default(['MEMBER']),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
