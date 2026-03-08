import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { users, broadcastHistory } from '../../../../shared/db/schema';
import { firstRow } from '../lib/db-utils';

export const userRepository = {
  async findByKakaoId(kakaoId: string) {
    const result = await db.select().from(users).where(eq(users.kakaoId, kakaoId)).limit(1);
    return result[0] ?? null;
  },

  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] ?? null;
  },

  async create(data: {
    kakaoId: string;
    email?: string | null;
    name?: string | null;
    nickname?: string | null;
    profileImage?: string | null;
  }) {
    const result = await db
      .insert(users)
      .values({
        kakaoId: data.kakaoId,
        email: data.email,
        profileImage: data.profileImage,
      })
      .returning();
    return firstRow(result);
  },

  async updateSignup(
    userId: string,
    data: {
      name: string;
      nickname: string;
      phone: string;
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    },
  ) {
    const nicknameNormalized = data.nickname.replace(/\s/g, '').toLowerCase();
    const phoneNormalized = data.phone.replace(/-/g, '');

    const result = await db
      .update(users)
      .set({
        ...data,
        nicknameNormalized,
        phoneNormalized,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return firstRow(result);
  },

  async isNicknameTaken(nickname: string, excludeUserId?: string) {
    const normalized = nickname.replace(/\s/g, '').toLowerCase();
    const conditions = [eq(users.nicknameNormalized, normalized)];

    if (excludeUserId) {
      conditions.push(sql`${users.id} != ${excludeUserId}`);
    }

    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  },

  async updateLastLogin(userId: string) {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  async updateStatus(
    userId: string,
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'WITHDRAWN',
    approvedBy?: string,
  ) {
    await db
      .update(users)
      .set({
        status,
        ...(status === 'APPROVED' ? { approvedAt: new Date(), approvedBy } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  },

  async updateTier(userId: string, tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND') {
    await db.update(users).set({ tier, updatedAt: new Date() }).where(eq(users.id, userId));
  },

  async getBroadcastCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(broadcastHistory)
      .where(and(eq(broadcastHistory.userId, userId), eq(broadcastHistory.status, 'COMPLETED')));
    return result[0]?.count ?? 0;
  },
};
