import { describe, it, expect } from 'vitest';
import {
  canCancelReservation,
  canCreateReservation,
  shouldAutoApprove,
  isWithinBookingWindow,
  generateReservationNumber,
} from '../policies';

describe('canCancelReservation', () => {
  const baseCtx = {
    reservationStatus: 'APPROVED' as const,
    startTimeMs: Date.now() + 48 * 60 * 60 * 1000, // 48시간 후
    nowMs: Date.now(),
    deadlineHours: 24,
    isOperatorOrAdmin: false,
  };

  it('운영자/관리자는 항상 취소 가능', () => {
    const result = canCancelReservation({ ...baseCtx, isOperatorOrAdmin: true });
    expect(result.allowed).toBe(true);
  });

  it('PENDING 상태는 항상 취소 가능', () => {
    const result = canCancelReservation({
      ...baseCtx,
      reservationStatus: 'PENDING',
    });
    expect(result.allowed).toBe(true);
  });

  it('시작 24시간 이전이면 취소 가능', () => {
    const result = canCancelReservation(baseCtx);
    expect(result.allowed).toBe(true);
  });

  it('시작 24시간 이내면 취소 불가', () => {
    const result = canCancelReservation({
      ...baseCtx,
      startTimeMs: Date.now() + 12 * 60 * 60 * 1000, // 12시간 후
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('24시간');
  });
});

describe('canCreateReservation', () => {
  it('일일 최대 예약 미만이면 생성 가능', () => {
    const result = canCreateReservation({
      activeReservationCount: 1,
      maxSlotsPerDayPerMember: 3,
    });
    expect(result.allowed).toBe(true);
  });

  it('일일 최대 예약 도달 시 생성 불가', () => {
    const result = canCreateReservation({
      activeReservationCount: 3,
      maxSlotsPerDayPerMember: 3,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('3건');
  });
});

describe('shouldAutoApprove', () => {
  it('GOLD 이상 + 자동승인 활성화 시 자동 승인', () => {
    expect(shouldAutoApprove('GOLD', true)).toBe(true);
    expect(shouldAutoApprove('PLATINUM', true)).toBe(true);
    expect(shouldAutoApprove('DIAMOND', true)).toBe(true);
  });

  it('BRONZE/SILVER는 자동 승인 불가', () => {
    expect(shouldAutoApprove('BRONZE', true)).toBe(false);
    expect(shouldAutoApprove('SILVER', true)).toBe(false);
  });

  it('자동승인 비활성화 시 모두 불가', () => {
    expect(shouldAutoApprove('DIAMOND', false)).toBe(false);
  });
});

describe('isWithinBookingWindow', () => {
  const now = Date.now();

  it('유효 범위 내 날짜 허용', () => {
    const result = isWithinBookingWindow({
      targetDateMs: now + 7 * 24 * 60 * 60 * 1000,
      nowMs: now,
      maxAdvanceBookingDays: 30,
    });
    expect(result.allowed).toBe(true);
  });

  it('과거 날짜 거절', () => {
    const result = isWithinBookingWindow({
      targetDateMs: now - 24 * 60 * 60 * 1000,
      nowMs: now,
      maxAdvanceBookingDays: 30,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('과거');
  });

  it('최대 예약일 초과 거절', () => {
    const result = isWithinBookingWindow({
      targetDateMs: now + 60 * 24 * 60 * 60 * 1000,
      nowMs: now,
      maxAdvanceBookingDays: 30,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('30일');
  });
});

describe('generateReservationNumber', () => {
  it('SG-YYYYMMDD-NNN 형식 생성', () => {
    expect(generateReservationNumber('2026-03-07', 1)).toBe('SG-20260307-001');
    expect(generateReservationNumber('2026-03-07', 42)).toBe('SG-20260307-042');
    expect(generateReservationNumber('2026-12-25', 999)).toBe('SG-20261225-999');
  });
});
