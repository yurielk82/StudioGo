// ── 예약 정책 ──────────────────────────────────
// 순수 비즈니스 규칙. 외부 의존 없음.

import type { Tier } from '../../contracts/enums';

interface CancellationContext {
  reservationStatus: 'PENDING' | 'APPROVED';
  startTimeMs: number;
  nowMs: number;
  deadlineHours: number;
  isOperatorOrAdmin: boolean;
}

export function canCancelReservation(ctx: CancellationContext): {
  allowed: boolean;
  reason?: string;
} {
  if (ctx.isOperatorOrAdmin) {
    return { allowed: true };
  }

  if (ctx.reservationStatus === 'PENDING') {
    return { allowed: true };
  }

  const hoursUntilStart = (ctx.startTimeMs - ctx.nowMs) / (1000 * 60 * 60);

  if (hoursUntilStart < ctx.deadlineHours) {
    return {
      allowed: false,
      reason: `예약 시작 ${ctx.deadlineHours}시간 전까지만 취소할 수 있습니다.`,
    };
  }

  return { allowed: true };
}

interface MaxReservationsContext {
  activeReservationCount: number;
  maxSlotsPerDayPerMember: number;
}

export function canCreateReservation(ctx: MaxReservationsContext): {
  allowed: boolean;
  reason?: string;
} {
  if (ctx.activeReservationCount >= ctx.maxSlotsPerDayPerMember) {
    return {
      allowed: false,
      reason: `하루 최대 ${ctx.maxSlotsPerDayPerMember}건까지 예약할 수 있습니다.`,
    };
  }

  return { allowed: true };
}

const AUTO_APPROVE_TIERS: readonly Tier[] = ['GOLD', 'PLATINUM', 'DIAMOND'] as const;

export function shouldAutoApprove(tier: Tier, autoApproveEnabled: boolean): boolean {
  if (!autoApproveEnabled) return false;
  return (AUTO_APPROVE_TIERS as readonly string[]).includes(tier);
}

interface AdvanceBookingContext {
  targetDateMs: number;
  nowMs: number;
  maxAdvanceBookingDays: number;
}

export function isWithinBookingWindow(ctx: AdvanceBookingContext): {
  allowed: boolean;
  reason?: string;
} {
  const daysAhead = (ctx.targetDateMs - ctx.nowMs) / (1000 * 60 * 60 * 24);

  if (daysAhead < 0) {
    return { allowed: false, reason: '과거 날짜에는 예약할 수 없습니다.' };
  }

  if (daysAhead > ctx.maxAdvanceBookingDays) {
    return {
      allowed: false,
      reason: `최대 ${ctx.maxAdvanceBookingDays}일 전까지만 예약할 수 있습니다.`,
    };
  }

  return { allowed: true };
}

export function generateReservationNumber(date: string, sequence: number): string {
  const datePart = date.replace(/-/g, '');
  const seqPart = String(sequence).padStart(3, '0');
  return `SG-${datePart}-${seqPart}`;
}
