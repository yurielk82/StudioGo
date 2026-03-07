import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { reservations } from './reservations';
import { notificationEventTypeEnum } from './notification-settings';

export const notificationJobStatusEnum = pgEnum('notification_job_status', [
  'PENDING',
  'PROCESSING',
  'SENT',
  'FAILED',
  'CANCELLED',
]);

export const notificationJobs = pgTable(
  'notification_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: notificationEventTypeEnum('event_type').notNull(),
    status: notificationJobStatusEnum('status').notNull().default('PENDING'),
    payload: jsonb('payload').notNull(),
    retryCount: integer('retry_count').notNull().default(0),
    maxRetries: integer('max_retries').notNull().default(3),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    relatedReservationId: uuid('related_reservation_id').references(() => reservations.id),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notification_jobs_status_scheduled_idx').on(table.status, table.scheduledAt),
    uniqueIndex('notification_jobs_idempotency_idx').on(table.idempotencyKey),
  ],
);
