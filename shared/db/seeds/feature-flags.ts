import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { featureFlags } from '../schema';
import { sql } from 'drizzle-orm';

const FLAGS = [
  { key: 'waitlist', enabled: true, description: '대기 목록 기능' },
  { key: 'quick_rebooking', enabled: true, description: '빠른 재예약 기능' },
  { key: 'fulfillment', enabled: true, description: '포장/출고 관리 기능' },
  { key: 'settlements', enabled: false, description: '정산 기능' },
  { key: 'push_notifications', enabled: false, description: '푸시 알림' },
  { key: 'kakao_alimtalk', enabled: false, description: '카카오 알림톡 발송' },
  { key: 'tier_downgrade', enabled: false, description: '티어 다운그레이드' },
  { key: 'weekly_report', enabled: true, description: '주간 리포트' },
];

export async function seedFeatureFlags(db: PostgresJsDatabase<Record<string, unknown>>) {
  for (const flag of FLAGS) {
    await db
      .insert(featureFlags)
      .values(flag)
      .onConflictDoUpdate({
        target: featureFlags.key,
        set: {
          description: sql`excluded.description`,
          updatedAt: sql`now()`,
        },
      });
  }
}
