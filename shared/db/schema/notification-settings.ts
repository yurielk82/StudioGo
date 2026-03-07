import { pgTable, uuid, boolean, varchar, text, jsonb, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

export const notificationEventTypeEnum = pgEnum('notification_event_type', [
  'MEMBER_REGISTERED',
  'MEMBER_APPROVED',
  'MEMBER_REJECTED',
  'RESERVATION_REQUESTED',
  'RESERVATION_APPROVED',
  'RESERVATION_REJECTED',
  'RESERVATION_CANCELLED_BY_MEMBER',
  'RESERVATION_CANCELLED_BY_OPERATOR',
  'BROADCAST_REMINDER',
  'BROADCAST_START',
  'BROADCAST_END',
  'CLEANING_COMPLETE',
  'TIER_UPGRADED',
  'TIER_DOWNGRADED',
  'NO_SHOW',
  'SCHEDULE_CHANGED',
  'STUDIO_BLOCKED',
  'DAILY_SUMMARY',
  'WEEKLY_REPORT',
]);

export const notificationSettings = pgTable(
  'notification_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: notificationEventTypeEnum('event_type').notNull(),
    isEnabled: boolean('is_enabled').notNull().default(true),
    sendToMember: boolean('send_to_member').notNull().default(true),
    sendToOperator: boolean('send_to_operator').notNull().default(false),
    templateCode: varchar('template_code', { length: 50 }),
    templateContent: text('template_content'),
    timing: jsonb('timing'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('notification_settings_event_type_idx').on(table.eventType),
  ],
);
