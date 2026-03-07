import { pgTable, uuid, varchar, date, timestamp, pgEnum, text, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { studios } from './studios';

export const timeSlotStatusEnum = pgEnum('time_slot_status', [
  'AVAILABLE',
  'RESERVED',
  'IN_USE',
  'CLEANING',
  'BLOCKED',
  'COMPLETED',
]);

export const timeSlots = pgTable(
  'time_slots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studioId: uuid('studio_id')
      .notNull()
      .references(() => studios.id),
    date: date('date').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    cleaningEndTime: varchar('cleaning_end_time', { length: 5 }),
    status: timeSlotStatusEnum('status').notNull().default('AVAILABLE'),
    blockedReason: text('blocked_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('time_slots_studio_date_start_idx').on(table.studioId, table.date, table.startTime),
    index('time_slots_studio_date_idx').on(table.studioId, table.date),
    index('time_slots_date_status_idx').on(table.date, table.status),
    check('time_valid', sql`${table.startTime} < ${table.endTime}`),
  ],
);
