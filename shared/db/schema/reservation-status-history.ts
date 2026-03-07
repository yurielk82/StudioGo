import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { reservations, reservationStatusEnum } from './reservations';
import { users } from './users';

export const reservationStatusHistory = pgTable('reservation_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id')
    .notNull()
    .references(() => reservations.id),
  fromStatus: reservationStatusEnum('from_status'),
  toStatus: reservationStatusEnum('to_status').notNull(),
  reason: text('reason'),
  changedByUserId: uuid('changed_by_user_id').references(() => users.id),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  meta: jsonb('meta'),
});
