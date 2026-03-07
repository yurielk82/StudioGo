import {
  pgTable,
  uuid,
  date,
  integer,
  text,
  jsonb,
  timestamp,
  pgEnum,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { studios } from './studios';
import { reservations } from './reservations';

export const broadcastStatusEnum = pgEnum('broadcast_status', [
  'COMPLETED',
  'NO_SHOW',
  'EARLY_END',
]);

export const broadcastHistory = pgTable(
  'broadcast_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservationId: uuid('reservation_id')
      .notNull()
      .references(() => reservations.id)
      .unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    studioId: uuid('studio_id')
      .notNull()
      .references(() => studios.id),
    date: date('date').notNull(),
    actualStartTime: timestamp('actual_start_time', { withTimezone: true }),
    actualEndTime: timestamp('actual_end_time', { withTimezone: true }),
    durationMinutes: integer('duration_minutes'),
    status: broadcastStatusEnum('status').notNull(),
    rating: integer('rating'),
    operatorNote: text('operator_note'),
    servicesUsed: jsonb('services_used'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('broadcast_history_user_date_idx').on(table.userId, table.date),
    check(
      'rating_range',
      sql`${table.rating} IS NULL OR (${table.rating} >= 1 AND ${table.rating} <= 5)`,
    ),
  ],
);
