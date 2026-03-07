import { pgTable, uuid, varchar, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { notificationSettings, notificationEventTypeEnum } from './notification-settings';
import { reservations } from './reservations';

export const notificationLogStatusEnum = pgEnum('notification_log_status', [
  'PENDING',
  'SENT',
  'FAILED',
  'CANCELLED',
]);

export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    notificationSettingId: uuid('notification_setting_id').references(
      () => notificationSettings.id,
    ),
    recipientId: uuid('recipient_id').references(() => users.id),
    recipientPhone: varchar('recipient_phone', { length: 20 }),
    eventType: notificationEventTypeEnum('event_type').notNull(),
    templateCode: varchar('template_code', { length: 50 }),
    content: text('content'),
    status: notificationLogStatusEnum('status').notNull().default('PENDING'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    failedReason: text('failed_reason'),
    relatedReservationId: uuid('related_reservation_id').references(() => reservations.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notification_logs_recipient_created_idx').on(table.recipientId, table.createdAt),
  ],
);
