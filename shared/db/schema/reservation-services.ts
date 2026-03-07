import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { reservations } from './reservations';
import { additionalServices } from './additional-services';

export const reservationServices = pgTable('reservation_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id')
    .notNull()
    .references(() => reservations.id),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => additionalServices.id),
  quantity: integer('quantity').notNull().default(1),
  memo: text('memo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
