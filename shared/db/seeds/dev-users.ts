import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users } from '../schema';
import { sql } from 'drizzle-orm';

/**
 * 개발용 테스트 유저 3명 시드
 * - admin_seed_001은 admin-user.ts에서 이미 생성
 * - 프로덕션 DB에서는 실행하지 않을 것
 */
export async function seedDevUsers(db: PostgresJsDatabase<Record<string, unknown>>) {
  await db
    .insert(users)
    .values([
      {
        kakaoId: 'dev_member_001',
        email: 'member@dev.studiogo.kr',
        name: '테스트 멤버',
        nickname: '테스트 멤버',
        phone: '01011111111',
        tier: 'BRONZE',
        role: 'MEMBER',
        status: 'APPROVED',
        approvedAt: sql`now()`,
        nicknameNormalized: '테스트멤버',
        phoneNormalized: '01011111111',
      },
      {
        kakaoId: 'dev_operator_001',
        email: 'operator@dev.studiogo.kr',
        name: '테스트 운영자',
        nickname: '테스트 운영자',
        phone: '01022222222',
        tier: 'DIAMOND',
        role: 'OPERATOR',
        status: 'APPROVED',
        approvedAt: sql`now()`,
        nicknameNormalized: '테스트운영자',
        phoneNormalized: '01022222222',
      },
      {
        kakaoId: 'dev_pending_001',
        email: 'pending@dev.studiogo.kr',
        name: '테스트 대기회원',
        nickname: '테스트 대기회원',
        phone: '01033333333',
        tier: 'BRONZE',
        role: 'MEMBER',
        status: 'PENDING',
        nicknameNormalized: '테스트대기회원',
        phoneNormalized: '01033333333',
      },
    ])
    .onConflictDoNothing({ target: users.kakaoId });
}
