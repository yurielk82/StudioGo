// ── Typed Settings Reader ──────────────────────────
// operation_settings 테이블의 값을 타입 안전하게 읽는 서비스

interface OperatingHours {
  start: string;
  end: string;
}

interface TierThresholds {
  SILVER: number;
  GOLD: number;
  PLATINUM: number;
  DIAMOND: number;
}

// 설정 키 → 타입 매핑
export interface SettingsMap {
  operating_hours: OperatingHours;
  slot_duration_minutes: number;
  cleaning_duration_minutes: number;
  max_advance_booking_days: number;
  max_slots_per_day_per_member: number;
  cancellation_deadline_hours: number;
  auto_approve_gold_above: boolean;
  tier_thresholds: TierThresholds;
  hold_duration_seconds: number;
  reminder_before_minutes: number;
}

export type SettingsKey = keyof SettingsMap;

// 기본값 — DB 조회 실패 시 fallback
export const SETTINGS_DEFAULTS: SettingsMap = {
  operating_hours: { start: '09:00', end: '22:00' },
  slot_duration_minutes: 60,
  cleaning_duration_minutes: 30,
  max_advance_booking_days: 14,
  max_slots_per_day_per_member: 2,
  cancellation_deadline_hours: 24,
  auto_approve_gold_above: true,
  tier_thresholds: { SILVER: 5, GOLD: 15, PLATINUM: 30, DIAMOND: 60 },
  hold_duration_seconds: 120,
  reminder_before_minutes: 30,
};

/** raw DB 레코드에서 타입 안전한 값 추출 */
export function parseSettingValue<K extends SettingsKey>(
  key: K,
  rawValue: unknown,
): SettingsMap[K] {
  if (rawValue === null || rawValue === undefined) {
    return SETTINGS_DEFAULTS[key];
  }
  return rawValue as SettingsMap[K];
}
