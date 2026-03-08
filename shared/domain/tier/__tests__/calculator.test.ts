import { describe, it, expect } from 'vitest';
import {
  calculateTier,
  broadcastsUntilNextTier,
  hasTierChanged,
  getTierDirection,
} from '../calculator';

const THRESHOLDS = { SILVER: 5, GOLD: 15, PLATINUM: 30, DIAMOND: 60 };

describe('calculateTier', () => {
  it('0회 방송 → BRONZE', () => {
    expect(calculateTier(0, THRESHOLDS)).toBe('BRONZE');
  });

  it('정확히 5회 → SILVER', () => {
    expect(calculateTier(5, THRESHOLDS)).toBe('SILVER');
  });

  it('정확히 15회 → GOLD', () => {
    expect(calculateTier(15, THRESHOLDS)).toBe('GOLD');
  });

  it('정확히 30회 → PLATINUM', () => {
    expect(calculateTier(30, THRESHOLDS)).toBe('PLATINUM');
  });

  it('정확히 60회 → DIAMOND', () => {
    expect(calculateTier(60, THRESHOLDS)).toBe('DIAMOND');
  });

  it('4회 (SILVER 경계 직전) → BRONZE', () => {
    expect(calculateTier(4, THRESHOLDS)).toBe('BRONZE');
  });

  it('100회 → DIAMOND (최고 티어 유지)', () => {
    expect(calculateTier(100, THRESHOLDS)).toBe('DIAMOND');
  });
});

describe('broadcastsUntilNextTier', () => {
  it('BRONZE 3회 → SILVER까지 2회 남음', () => {
    expect(broadcastsUntilNextTier(3, 'BRONZE', THRESHOLDS)).toBe(2);
  });

  it('BRONZE 0회 → SILVER까지 5회 남음', () => {
    expect(broadcastsUntilNextTier(0, 'BRONZE', THRESHOLDS)).toBe(5);
  });

  it('SILVER 10회 → GOLD까지 5회 남음', () => {
    expect(broadcastsUntilNextTier(10, 'SILVER', THRESHOLDS)).toBe(5);
  });

  it('이미 다음 티어 기준 초과 시 0 반환', () => {
    expect(broadcastsUntilNextTier(20, 'SILVER', THRESHOLDS)).toBe(0);
  });

  it('DIAMOND → null (최고 티어)', () => {
    expect(broadcastsUntilNextTier(60, 'DIAMOND', THRESHOLDS)).toBeNull();
  });
});

describe('hasTierChanged', () => {
  it('BRONZE → SILVER 변경 시 true', () => {
    expect(hasTierChanged('BRONZE', 'SILVER')).toBe(true);
  });

  it('GOLD → GOLD 동일 시 false', () => {
    expect(hasTierChanged('GOLD', 'GOLD')).toBe(false);
  });

  it('DIAMOND → BRONZE 변경 시 true', () => {
    expect(hasTierChanged('DIAMOND', 'BRONZE')).toBe(true);
  });
});

describe('getTierDirection', () => {
  it('BRONZE → GOLD: UPGRADE', () => {
    expect(getTierDirection('BRONZE', 'GOLD')).toBe('UPGRADE');
  });

  it('GOLD → BRONZE: DOWNGRADE', () => {
    expect(getTierDirection('GOLD', 'BRONZE')).toBe('DOWNGRADE');
  });

  it('GOLD → GOLD: SAME', () => {
    expect(getTierDirection('GOLD', 'GOLD')).toBe('SAME');
  });

  it('SILVER → DIAMOND: UPGRADE', () => {
    expect(getTierDirection('SILVER', 'DIAMOND')).toBe('UPGRADE');
  });

  it('PLATINUM → SILVER: DOWNGRADE', () => {
    expect(getTierDirection('PLATINUM', 'SILVER')).toBe('DOWNGRADE');
  });
});
