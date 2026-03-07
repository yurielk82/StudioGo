import { pgTable, uuid, date, integer, jsonb, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { studios } from './studios';

export const waitlistStatusEnum = pgEnum('waitlist_status', [
  'ACTIVE',
  'NOTIFIED',
  'FULFILLED',
  'EXPIRED',
  'CANCELLED',
]);

export const reservationWaitlists = pgTable(
  'reservation_waitlists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    studioId: uuid('studio_id').references(() => studios.id),
    date: date('date').notNull(),
    preferredTimeRange: jsonb('preferred_time_range'),
    status: waitlistStatusEnum('status').notNull().default('ACTIVE'),
    priority: integer('priority').notNull().default(0),
    notifiedAt: timestamp('notified_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reservation_waitlists_date_status_idx').on(table.date, table.status),
  ],
);
