// ── 티어 계산기 ──────────────────────────────────
// 방송 완료 횟수 기반으로 티어를 결정한다.
// 순수 계산 — DB/프레임워크 의존 없음.

import type { Tier } from '../../contracts/enums';

interface TierThresholds {
  SILVER: number;
  GOLD: number;
  PLATINUM: number;
  DIAMOND: number;
}

const TIER_ORDER: readonly Tier[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
] as const;

export function calculateTier(
  broadcastCount: number,
  thresholds: TierThresholds,
): Tier {
  if (broadcastCount >= thresholds.DIAMOND) return 'DIAMOND';
  if (broadcastCount >= thresholds.PLATINUM) return 'PLATINUM';
  if (broadcastCount >= thresholds.GOLD) return 'GOLD';
  if (broadcastCount >= thresholds.SILVER) return 'SILVER';
  return 'BRONZE';
}

export function broadcastsUntilNextTier(
  broadcastCount: number,
  currentTier: Tier,
  thresholds: TierThresholds,
): number | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const nextTier = TIER_ORDER[currentIndex + 1];

  if (!nextTier) return null; // DIAMOND는 최고 티어

  const nextThreshold = thresholds[nextTier as keyof TierThresholds];
  if (nextThreshold === undefined) return null;

  return Math.max(0, nextThreshold - broadcastCount);
}

export function hasTierChanged(previousTier: Tier, newTier: Tier): boolean {
  return previousTier !== newTier;
}

export function getTierDirection(
  previousTier: Tier,
  newTier: Tier,
): 'UPGRADE' | 'DOWNGRADE' | 'SAME' {
  const prevIndex = TIER_ORDER.indexOf(previousTier);
  const newIndex = TIER_ORDER.indexOf(newTier);

  if (newIndex > prevIndex) return 'UPGRADE';
  if (newIndex < prevIndex) return 'DOWNGRADE';
  return 'SAME';
}
