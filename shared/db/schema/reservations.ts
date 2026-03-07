import { pgTable, uuid, varchar, date, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { studios } from './studios';
import { timeSlots } from './time-slots';

export const reservationStatusEnum = pgEnum('reservation_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
]);

export const reservations = pgTable(
  'reservations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservationNumber: varchar('reservation_number', { length: 20 }).notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    studioId: uuid('studio_id')
      .notNull()
      .references(() => studios.id),
    timeSlotId: uuid('time_slot_id')
      .notNull()
      .references(() => timeSlots.id),
    date: date('date').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    status: reservationStatusEnum('status').notNull().default('PENDING'),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    rejectedReason: text('rejected_reason'),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledReason: text('cancelled_reason'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    memo: text('memo'),
    operatorMemo: text('operator_memo'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reservations_date_studio_idx').on(table.date, table.studioId),
    index('reservations_user_date_idx').on(table.userId, table.date),
    index('reservations_status_idx').on(table.status),
  ],
);
