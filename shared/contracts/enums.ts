import { z } from 'zod';

// ── 사용자 ──────────────────────────────────────

export const UserRole = z.enum(['MEMBER', 'OPERATOR', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['PENDING', 'APPROVED', 'SUSPENDED', 'WITHDRAWN']);
export type UserStatus = z.infer<typeof UserStatus>;

export const Tier = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);
export type Tier = z.infer<typeof Tier>;

// ── 예약 ──────────────────────────────────────

export const ReservationStatus = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
]);
export type ReservationStatus = z.infer<typeof ReservationStatus>;

export const TERMINAL_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  'REJECTED',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;

export const ACTIVE_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  'PENDING',
  'APPROVED',
] as const;

// ── 타임슬롯 ──────────────────────────────────

export const TimeSlotStatus = z.enum([
  'AVAILABLE',
  'RESERVED',
  'IN_USE',
  'CLEANING',
  'BLOCKED',
  'COMPLETED',
]);
export type TimeSlotStatus = z.infer<typeof TimeSlotStatus>;

// ── 알림 ──────────────────────────────────────

export const NotificationEventType = z.enum([
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
export type NotificationEventType = z.infer<typeof NotificationEventType>;

export const NotificationJobStatus = z.enum([
  'PENDING',
  'PROCESSING',
  'SENT',
  'FAILED',
  'CANCELLED',
]);
export type NotificationJobStatus = z.infer<typeof NotificationJobStatus>;

export const NotificationLogStatus = z.enum(['PENDING', 'SENT', 'FAILED', 'CANCELLED']);
export type NotificationLogStatus = z.infer<typeof NotificationLogStatus>;

// ── Hold ──────────────────────────────────────

export const SlotHoldStatus = z.enum(['ACTIVE', 'EXPIRED', 'CONSUMED', 'CANCELLED']);
export type SlotHoldStatus = z.infer<typeof SlotHoldStatus>;

// ── 방송 ──────────────────────────────────────

export const BroadcastStatus = z.enum(['COMPLETED', 'NO_SHOW', 'EARLY_END']);
export type BroadcastStatus = z.infer<typeof BroadcastStatus>;

// ── 티어 변경 ──────────────────────────────────

export const TierChangeReason = z.enum(['SYSTEM', 'ADMIN']);
export type TierChangeReason = z.infer<typeof TierChangeReason>;

// ── 체크인 ──────────────────────────────────────

export const CheckinMethod = z.enum(['QR', 'PIN', 'MANUAL']);
export type CheckinMethod = z.infer<typeof CheckinMethod>;

// ── 포장/출고 ──────────────────────────────────

export const FulfillmentStatus = z.enum([
  'PENDING',
  'PACKING',
  'READY',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
]);
export type FulfillmentStatus = z.infer<typeof FulfillmentStatus>;

// ── 정산 ──────────────────────────────────────

export const SettlementStatus = z.enum(['PENDING', 'CONFIRMED', 'SETTLED', 'CANCELLED']);
export type SettlementStatus = z.infer<typeof SettlementStatus>;

// ── Blackout ──────────────────────────────────

export const BlackoutType = z.enum(['HOLIDAY', 'MAINTENANCE', 'MANUAL', 'EVENT']);
export type BlackoutType = z.infer<typeof BlackoutType>;

// ── 공지 ──────────────────────────────────────

export const AnnouncementType = z.enum(['BANNER', 'NOTICE', 'POPUP']);
export type AnnouncementType = z.infer<typeof AnnouncementType>;

// ── 대기 ──────────────────────────────────────

export const WaitlistStatus = z.enum([
  'ACTIVE',
  'NOTIFIED',
  'FULFILLED',
  'EXPIRED',
  'CANCELLED',
]);
export type WaitlistStatus = z.infer<typeof WaitlistStatus>;

// ── 플랫폼 ──────────────────────────────────────

export const Platform = z.enum(['IOS', 'ANDROID', 'WEB']);
export type Platform = z.infer<typeof Platform>;
