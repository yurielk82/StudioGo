import { eq, and, sql } from 'drizzle-orm';
import { db } from '@db';
import { authSessions } from '@db/schema';

export const sessionRepository = {
  async create(data: {
    userId: string;
    refreshTokenHash: string;
    deviceName?: string;
    platform?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    const result = await db
      .insert(authSessions)
      .values(data)
      .returning();
    return result[0]!;
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async findByUserId(userId: string) {
    return db
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.userId, userId),
          sql`${authSessions.revokedAt} IS NULL`,
          sql`${authSessions.expiresAt} > now()`,
        ),
      )
      .orderBy(sql`${authSessions.lastSeenAt} DESC`);
  },

  async updateLastSeen(id: string) {
    await db
      .update(authSessions)
      .set({ lastSeenAt: new Date(), updatedAt: new Date() })
      .where(eq(authSessions.id, id));
  },

  async revoke(id: string) {
    await db
      .update(authSessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(authSessions.id, id));
  },

  async revokeAllForUser(userId: string) {
    await db
      .update(authSessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(authSessions.userId, userId),
          sql`${authSessions.revokedAt} IS NULL`,
        ),
      );
  },
};
