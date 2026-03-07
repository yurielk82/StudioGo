import { pgTable, uuid, varchar, integer, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { reservations } from './reservations';
import { users } from './users';

export const fulfillmentStatusEnum = pgEnum('fulfillment_status', [
  'PENDING',
  'PACKING',
  'READY',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
]);

export const fulfillmentTasks = pgTable(
  'fulfillment_tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservationId: uuid('reservation_id')
      .notNull()
      .references(() => reservations.id),
    status: fulfillmentStatusEnum('status').notNull().default('PENDING'),
    courier: varchar('courier', { length: 50 }),
    trackingNumber: varchar('tracking_number', { length: 50 }),
    parcelCount: integer('parcel_count'),
    operatorId: uuid('operator_id').references(() => users.id),
    memo: text('memo'),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('fulfillment_tasks_status_created_idx').on(table.status, table.createdAt),
  ],
);
