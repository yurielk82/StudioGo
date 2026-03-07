import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const studios = pgTable(
  'studios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    capacity: integer('capacity').notNull(),
    equipment: jsonb('equipment').notNull().default([]),
    images: jsonb('images').notNull().default([]),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('capacity_positive', sql`${table.capacity} > 0`),
  ],
);
