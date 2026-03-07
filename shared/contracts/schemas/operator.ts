import { z } from 'zod';
import { CheckinMethod, FulfillmentStatus } from '../enums';

// ── 체크인 ──────────────────────────────────────

export const CheckinRequestSchema = z.object({
  reservationId: z.string().uuid(),
  method: CheckinMethod,
  pinCode: z.string().max(10).optional(),
  note: z.string().max(500).optional(),
});
export type CheckinRequest = z.infer<typeof CheckinRequestSchema>;

export const CheckinResponseSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid(),
  reservationNumber: z.string(),
  userName: z.string(),
  userNickname: z.string(),
  studioName: z.string(),
  method: CheckinMethod,
  checkedInAt: z.string().datetime(),
});
export type CheckinResponse = z.infer<typeof CheckinResponseSchema>;

// ── 포장/출고 ──────────────────────────────────

export const UpdateFulfillmentRequestSchema = z.object({
  status: FulfillmentStatus.optional(),
  courier: z.string().max(50).optional(),
  trackingNumber: z.string().max(50).optional(),
  parcelCount: z.number().int().positive().optional(),
  memo: z.string().max(500).optional(),
});
export type UpdateFulfillmentRequest = z.infer<typeof UpdateFulfillmentRequestSchema>;

export const FulfillmentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: FulfillmentStatus.optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});
export type FulfillmentListQuery = z.infer<typeof FulfillmentListQuerySchema>;

export const FulfillmentTaskSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid(),
  reservationNumber: z.string(),
  userName: z.string(),
  status: FulfillmentStatus,
  courier: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  parcelCount: z.number().int().nullable(),
  operatorName: z.string().nullable(),
  memo: z.string().nullable(),
  shippedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type FulfillmentTask = z.infer<typeof FulfillmentTaskSchema>;

// ── 대시보드 ──────────────────────────────────

export const OperatorDashboardSchema = z.object({
  todayReservations: z.object({
    total: z.number().int(),
    pending: z.number().int(),
    approved: z.number().int(),
    inProgress: z.number().int(),
    completed: z.number().int(),
  }),
  pendingApprovals: z.number().int(),
  pendingMembers: z.number().int(),
  pendingFulfillment: z.number().int(),
  weeklyReservationRate: z.number(),
  recentNotifications: z.array(
    z.object({
      id: z.string().uuid(),
      eventType: z.string(),
      recipientName: z.string(),
      status: z.string(),
      createdAt: z.string().datetime(),
    }),
  ),
});
export type OperatorDashboard = z.infer<typeof OperatorDashboardSchema>;
