import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users } from '../schema';
import { sql } from 'drizzle-orm';

export async function seedAdminUser(db: PostgresJsDatabase<Record<string, unknown>>) {
  await db
    .insert(users)
    .values({
      kakaoId: 'admin_seed_001',
      email: 'admin@studiogo.kr',
      name: '관리자',
      nickname: '스튜디오고 관리자',
      phone: '01000000000',
      tier: 'DIAMOND',
      role: 'ADMIN',
      status: 'APPROVED',
      approvedAt: sql`now()`,
      nicknameNormalized: '스튜디오고관리자',
      phoneNormalized: '01000000000',
    })
    .onConflictDoNothing({ target: users.kakaoId });
}
