import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { operationSettings } from '../schema';
import { sql } from 'drizzle-orm';

const SETTINGS = [
  {
    key: 'operating_hours',
    value: { start: '09:00', end: '22:00' },
    description: '스튜디오 운영 시간',
    category: 'schedule',
  },
  {
    key: 'slot_duration_minutes',
    value: 60,
    description: '슬롯 단위 시간 (분)',
    category: 'schedule',
  },
  {
    key: 'cleaning_duration_minutes',
    value: 30,
    description: '청소 시간 (분)',
    category: 'schedule',
  },
  {
    key: 'max_advance_booking_days',
    value: 14,
    description: '최대 사전 예약 가능일',
    category: 'reservation',
  },
  {
    key: 'max_slots_per_day_per_member',
    value: 2,
    description: '회원 당 하루 최대 예약 수',
    category: 'reservation',
  },
  {
    key: 'cancellation_deadline_hours',
    value: 24,
    description: '취소 마감 시간 (예약 시작 전 시간)',
    category: 'reservation',
  },
  {
    key: 'auto_approve_gold_above',
    value: true,
    description: 'GOLD 이상 티어 자동 승인 여부',
    category: 'reservation',
  },
  {
    key: 'tier_thresholds',
    value: { SILVER: 5, GOLD: 15, PLATINUM: 30, DIAMOND: 60 },
    description: '티어 승급 기준 (방송 완료 횟수)',
    category: 'tier',
  },
  {
    key: 'hold_duration_seconds',
    value: 120,
    description: '슬롯 hold 유지 시간 (초)',
    category: 'reservation',
  },
  {
    key: 'reminder_before_minutes',
    value: 30,
    description: '방송 리마인더 사전 알림 (분)',
    category: 'notification',
  },
];

export async function seedOperationSettings(db: PostgresJsDatabase<Record<string, unknown>>) {
  for (const setting of SETTINGS) {
    await db
      .insert(operationSettings)
      .values({
        key: setting.key,
        value: setting.value,
        description: setting.description,
        category: setting.category,
      })
      .onConflictDoUpdate({
        target: operationSettings.key,
        set: {
          value: sql`excluded.value`,
          description: sql`excluded.description`,
          category: sql`excluded.category`,
          updatedAt: sql`now()`,
        },
      });
  }
}
