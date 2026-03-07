import { pgTable, uuid, text, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { studios } from './studios';
import { users } from './users';

export const blackoutTypeEnum = pgEnum('blackout_type', [
  'HOLIDAY',
  'MAINTENANCE',
  'MANUAL',
  'EVENT',
]);

export const studioBlackouts = pgTable(
  'studio_blackouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studioId: uuid('studio_id')
      .notNull()
      .references(() => studios.id),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    reason: text('reason').notNull(),
    type: blackoutTypeEnum('type').notNull(),
    repeatRule: jsonb('repeat_rule'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('studio_blackouts_studio_range_idx').on(table.studioId, table.startAt, table.endAt),
  ],
);
