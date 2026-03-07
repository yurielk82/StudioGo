import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const operatorPermissions = pgTable('operator_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  canApproveReservation: boolean('can_approve_reservation').notNull().default(false),
  canRejectReservation: boolean('can_reject_reservation').notNull().default(false),
  canManageMembers: boolean('can_manage_members').notNull().default(false),
  canApproveMember: boolean('can_approve_member').notNull().default(false),
  canManageStudios: boolean('can_manage_studios').notNull().default(false),
  canViewStatistics: boolean('can_view_statistics').notNull().default(false),
  canSendNotification: boolean('can_send_notification').notNull().default(false),
  canManageServices: boolean('can_manage_services').notNull().default(false),
  grantedBy: uuid('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
