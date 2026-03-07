import { pgTable, uuid, integer, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { reservations } from './reservations';

export const settlementStatusEnum = pgEnum('settlement_status', [
  'PENDING',
  'CONFIRMED',
  'SETTLED',
  'CANCELLED',
]);

export const settlements = pgTable(
  'settlements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    reservationId: uuid('reservation_id').references(() => reservations.id),
    amount: integer('amount').notNull().default(0),
    serviceAmount: integer('service_amount').notNull().default(0),
    penaltyAmount: integer('penalty_amount').notNull().default(0),
    totalAmount: integer('total_amount').notNull().default(0),
    status: settlementStatusEnum('status').notNull().default('PENDING'),
    settledAt: timestamp('settled_at', { withTimezone: true }),
    memo: text('memo'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('settlements_status_created_idx').on(table.status, table.createdAt),
  ],
);
