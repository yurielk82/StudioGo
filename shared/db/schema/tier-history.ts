import { pgTable, uuid, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { tierEnum } from './users';

export const tierChangeReasonEnum = pgEnum('tier_change_reason', ['SYSTEM', 'ADMIN']);

export const tierHistory = pgTable('tier_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  previousTier: tierEnum('previous_tier').notNull(),
  newTier: tierEnum('new_tier').notNull(),
  reason: tierChangeReasonEnum('reason').notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  broadcastCount: integer('broadcast_count'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
