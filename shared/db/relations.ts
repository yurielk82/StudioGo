import { relations } from 'drizzle-orm';
import {
  users,
  operatorPermissions,
  studios,
  timeSlots,
  reservations,
  reservationServices,
  additionalServices,
  notificationSettings,
  notificationLogs,
  broadcastHistory,
  tierHistory,
  systemLogs,
  slotHolds,
  reservationStatusHistory,
  studioBlackouts,
  authSessions,
  notificationJobs,
  appNotifications,
  pushTokens,
  reservationWaitlists,
  checkins,
  fulfillmentTasks,
  settlements,
  announcements,
  assets,
} from './schema';

// ── Users Relations ──────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  operatorPermission: one(operatorPermissions, {
    fields: [users.id],
    references: [operatorPermissions.userId],
  }),
  approvedByUser: one(users, {
    fields: [users.approvedBy],
    references: [users.id],
    relationName: 'approvedBy',
  }),
  reservations: many(reservations),
  broadcastHistories: many(broadcastHistory),
  tierHistories: many(tierHistory),
  authSessions: many(authSessions),
  appNotifications: many(appNotifications),
  pushTokens: many(pushTokens),
  waitlists: many(reservationWaitlists),
  settlements: many(settlements),
}));

// ── Studios Relations ──────────────────────────────

export const studiosRelations = relations(studios, ({ many }) => ({
  timeSlots: many(timeSlots),
  reservations: many(reservations),
  blackouts: many(studioBlackouts),
}));

// ── Time Slots Relations ──────────────────────────

export const timeSlotsRelations = relations(timeSlots, ({ one, many }) => ({
  studio: one(studios, {
    fields: [timeSlots.studioId],
    references: [studios.id],
  }),
  reservation: one(reservations, {
    fields: [timeSlots.id],
    references: [reservations.timeSlotId],
  }),
  holds: many(slotHolds),
}));

// ── Reservations Relations ──────────────────────────

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  studio: one(studios, {
    fields: [reservations.studioId],
    references: [studios.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [reservations.timeSlotId],
    references: [timeSlots.id],
  }),
  approver: one(users, {
    fields: [reservations.approvedBy],
    references: [users.id],
    relationName: 'approvedReservations',
  }),
  services: many(reservationServices),
  statusHistory: many(reservationStatusHistory),
  broadcastHistory: one(broadcastHistory, {
    fields: [reservations.id],
    references: [broadcastHistory.reservationId],
  }),
  checkin: one(checkins, {
    fields: [reservations.id],
    references: [checkins.reservationId],
  }),
  fulfillmentTasks: many(fulfillmentTasks),
}));

// ── Reservation Services Relations ──────────────────

export const reservationServicesRelations = relations(reservationServices, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationServices.reservationId],
    references: [reservations.id],
  }),
  service: one(additionalServices, {
    fields: [reservationServices.serviceId],
    references: [additionalServices.id],
  }),
}));

// ── Slot Holds Relations ──────────────────────────

export const slotHoldsRelations = relations(slotHolds, ({ one }) => ({
  timeSlot: one(timeSlots, {
    fields: [slotHolds.timeSlotId],
    references: [timeSlots.id],
  }),
  user: one(users, {
    fields: [slotHolds.userId],
    references: [users.id],
  }),
}));

// ── Reservation Status History Relations ────────────

export const reservationStatusHistoryRelations = relations(reservationStatusHistory, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationStatusHistory.reservationId],
    references: [reservations.id],
  }),
  changedBy: one(users, {
    fields: [reservationStatusHistory.changedByUserId],
    references: [users.id],
  }),
}));

// ── Broadcast History Relations ────────────────────

export const broadcastHistoryRelations = relations(broadcastHistory, ({ one }) => ({
  reservation: one(reservations, {
    fields: [broadcastHistory.reservationId],
    references: [reservations.id],
  }),
  user: one(users, {
    fields: [broadcastHistory.userId],
    references: [users.id],
  }),
  studio: one(studios, {
    fields: [broadcastHistory.studioId],
    references: [studios.id],
  }),
}));

// ── Tier History Relations ──────────────────────────

export const tierHistoryRelations = relations(tierHistory, ({ one }) => ({
  user: one(users, {
    fields: [tierHistory.userId],
    references: [users.id],
  }),
  changedByUser: one(users, {
    fields: [tierHistory.changedBy],
    references: [users.id],
    relationName: 'tierChangedBy',
  }),
}));

// ── Checkins Relations ──────────────────────────────

export const checkinsRelations = relations(checkins, ({ one }) => ({
  reservation: one(reservations, {
    fields: [checkins.reservationId],
    references: [reservations.id],
  }),
  user: one(users, {
    fields: [checkins.userId],
    references: [users.id],
  }),
  operator: one(users, {
    fields: [checkins.operatorId],
    references: [users.id],
    relationName: 'operatorCheckins',
  }),
}));

// ── Fulfillment Tasks Relations ──────────────────────

export const fulfillmentTasksRelations = relations(fulfillmentTasks, ({ one }) => ({
  reservation: one(reservations, {
    fields: [fulfillmentTasks.reservationId],
    references: [reservations.id],
  }),
  operator: one(users, {
    fields: [fulfillmentTasks.operatorId],
    references: [users.id],
  }),
}));

// ── Settlements Relations ──────────────────────────

export const settlementsRelations = relations(settlements, ({ one }) => ({
  user: one(users, {
    fields: [settlements.userId],
    references: [users.id],
  }),
  reservation: one(reservations, {
    fields: [settlements.reservationId],
    references: [reservations.id],
  }),
}));

// ── Studio Blackouts Relations ──────────────────────

export const studioBlackoutsRelations = relations(studioBlackouts, ({ one }) => ({
  studio: one(studios, {
    fields: [studioBlackouts.studioId],
    references: [studios.id],
  }),
  createdByUser: one(users, {
    fields: [studioBlackouts.createdBy],
    references: [users.id],
  }),
}));

// ── Notification Logs Relations ──────────────────────

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  setting: one(notificationSettings, {
    fields: [notificationLogs.notificationSettingId],
    references: [notificationSettings.id],
  }),
  recipient: one(users, {
    fields: [notificationLogs.recipientId],
    references: [users.id],
  }),
  reservation: one(reservations, {
    fields: [notificationLogs.relatedReservationId],
    references: [reservations.id],
  }),
}));

// ── Auth Sessions Relations ──────────────────────────

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.id],
  }),
}));

// ── App Notifications Relations ──────────────────────

export const appNotificationsRelations = relations(appNotifications, ({ one }) => ({
  user: one(users, {
    fields: [appNotifications.userId],
    references: [users.id],
  }),
}));

// ── Push Tokens Relations ──────────────────────────

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, {
    fields: [pushTokens.userId],
    references: [users.id],
  }),
}));

// ── Waitlists Relations ──────────────────────────

export const reservationWaitlistsRelations = relations(reservationWaitlists, ({ one }) => ({
  user: one(users, {
    fields: [reservationWaitlists.userId],
    references: [users.id],
  }),
  studio: one(studios, {
    fields: [reservationWaitlists.studioId],
    references: [studios.id],
  }),
}));

// ── Announcements Relations ──────────────────────────

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdByUser: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

// ── Assets Relations ──────────────────────────────

export const assetsRelations = relations(assets, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [assets.uploadedBy],
    references: [users.id],
  }),
}));
