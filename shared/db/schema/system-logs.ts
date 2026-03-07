import { pgTable, uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const systemLogs = pgTable(
  'system_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(),
    target: varchar('target', { length: 100 }).notNull(),
    targetId: varchar('target_id', { length: 100 }),
    details: jsonb('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('system_logs_user_idx').on(table.userId),
    index('system_logs_action_idx').on(table.action),
    index('system_logs_created_idx').on(table.createdAt),
  ],
);
