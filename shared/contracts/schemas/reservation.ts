import { z } from 'zod';
import { ReservationStatus, Tier } from '../enums';

// ── 예약 생성 ──────────────────────────────────

export const CreateReservationRequestSchema = z.object({
  studioId: z.string().uuid(),
  timeSlotId: z.string().uuid(),
  date: z.string().date(),
  holdToken: z.string().uuid().optional(),
  services: z
    .array(
      z.object({
        serviceId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
        memo: z.string().max(200).optional(),
      }),
    )
    .default([]),
  memo: z.string().max(500).optional(),
});
export type CreateReservationRequest = z.infer<typeof CreateReservationRequestSchema>;

// ── 예약 취소 ──────────────────────────────────

export const CancelReservationRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});
export type CancelReservationRequest = z.infer<typeof CancelReservationRequestSchema>;

// ── 예약 거절 ──────────────────────────────────

export const RejectReservationRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});
export type RejectReservationRequest = z.infer<typeof RejectReservationRequestSchema>;

// ── 예약 완료 ──────────────────────────────────

export const CompleteReservationRequestSchema = z.object({
  actualStartTime: z.string().datetime(),
  actualEndTime: z.string().datetime(),
  rating: z.number().int().min(1).max(5).optional(),
  operatorNote: z.string().max(500).optional(),
  servicesUsed: z
    .array(
      z.object({
        serviceId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .optional(),
});
export type CompleteReservationRequest = z.infer<typeof CompleteReservationRequestSchema>;

// ── 일괄 승인 ──────────────────────────────────

export const BatchApproveRequestSchema = z.object({
  reservationIds: z.array(z.string().uuid()).min(1).max(50),
});
export type BatchApproveRequest = z.infer<typeof BatchApproveRequestSchema>;

// ── 예약 목록 필터 ──────────────────────────────

export const ReservationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: ReservationStatus.optional(),
  studioId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  search: z.string().max(100).optional(),
});
export type ReservationListQuery = z.infer<typeof ReservationListQuerySchema>;

// ── 예약 응답 ──────────────────────────────────

export const ReservationServiceItemSchema = z.object({
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  quantity: z.number().int(),
  memo: z.string().nullable(),
});

export const ReservationSummarySchema = z.object({
  id: z.string().uuid(),
  reservationNumber: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  userNickname: z.string(),
  userTier: Tier,
  studioId: z.string().uuid(),
  studioName: z.string(),
  date: z.string().date(),
  startTime: z.string(),
  endTime: z.string(),
  status: ReservationStatus,
  createdAt: z.string().datetime(),
});
export type ReservationSummary = z.infer<typeof ReservationSummarySchema>;

export const ReservationDetailSchema = ReservationSummarySchema.extend({
  timeSlotId: z.string().uuid(),
  services: z.array(ReservationServiceItemSchema),
  memo: z.string().nullable(),
  operatorMemo: z.string().nullable(),
  approvedBy: z.string().uuid().nullable(),
  approvedAt: z.string().datetime().nullable(),
  rejectedReason: z.string().nullable(),
  cancelledAt: z.string().datetime().nullable(),
  cancelledReason: z.string().nullable(),
  completedAt: z.string().datetime().nullable(),
  canCancel: z.boolean(),
  statusHistory: z.array(
    z.object({
      fromStatus: ReservationStatus.nullable(),
      toStatus: ReservationStatus,
      reason: z.string().nullable(),
      changedAt: z.string().datetime(),
      changedBy: z.string().nullable(),
    }),
  ),
});
export type ReservationDetail = z.infer<typeof ReservationDetailSchema>;

// ── 내 통계 ──────────────────────────────────

export const MemberStatsSchema = z.object({
  totalBroadcasts: z.number().int(),
  monthlyBroadcasts: z.number().int(),
  averageDurationMinutes: z.number(),
  noShowRate: z.number(),
  cancellationRate: z.number(),
  tier: Tier,
  broadcastsUntilNextTier: z.number().int().nullable(),
});
export type MemberStats = z.infer<typeof MemberStatsSchema>;
