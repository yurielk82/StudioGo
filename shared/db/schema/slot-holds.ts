import { pgTable, uuid, timestamp, text, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { timeSlots } from './time-slots';
import { users } from './users';

export const slotHoldStatusEnum = pgEnum('slot_hold_status', [
  'ACTIVE',
  'EXPIRED',
  'CONSUMED',
  'CANCELLED',
]);

export const slotHolds = pgTable(
  'slot_holds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    timeSlotId: uuid('time_slot_id')
      .notNull()
      .references(() => timeSlots.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    holdToken: uuid('hold_token').notNull().defaultRandom(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    status: slotHoldStatusEnum('status').notNull().default('ACTIVE'),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('slot_holds_token_idx').on(table.holdToken),
    index('slot_holds_slot_status_idx').on(table.timeSlotId, table.status),
  ],
);
