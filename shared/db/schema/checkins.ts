import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { reservations } from './reservations';
import { users } from './users';

export const checkinMethodEnum = pgEnum('checkin_method', ['QR', 'PIN', 'MANUAL']);

export const checkins = pgTable('checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id')
    .notNull()
    .references(() => reservations.id)
    .unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  operatorId: uuid('operator_id').references(() => users.id),
  method: checkinMethodEnum('method').notNull(),
  pinCode: varchar('pin_code', { length: 10 }),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }).notNull().defaultNow(),
  checkedOutAt: timestamp('checked_out_at', { withTimezone: true }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
