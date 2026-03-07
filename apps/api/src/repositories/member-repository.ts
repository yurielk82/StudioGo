import { eq, and, sql, ilike, or } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { users, broadcastHistory, reservations } from '../../../../shared/db/schema';
import type { MemberListQuery } from '../../../../shared/contracts';

export const memberRepository = {
  async findAll(query: MemberListQuery) {
    const { page, limit, status, tier, role, search } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(users.status, status));
    if (tier) conditions.push(eq(users.tier, tier));
    if (role) conditions.push(eq(users.role, role));
    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.nickname, `%${search}%`),
          ilike(users.phone, `%${search}%`),
        ),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          nickname: users.nickname,
          profileImage: users.profileImage,
          tier: users.tier,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(where)
        .orderBy(sql`${users.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(where),
    ]);

    // 각 회원의 방송 횟수를 일괄 조회
    const userIds = items.map((u) => u.id);
    const broadcastCounts =
      userIds.length > 0
        ? await db
            .select({
              userId: broadcastHistory.userId,
              count: sql<number>`count(*)::int`,
            })
            .from(broadcastHistory)
            .where(
              and(
                sql`${broadcastHistory.userId} = ANY(${userIds})`,
                eq(broadcastHistory.status, 'COMPLETED'),
              ),
            )
            .groupBy(broadcastHistory.userId)
        : [];

    const countMap = new Map(broadcastCounts.map((bc) => [bc.userId, bc.count]));

    const membersWithCount = items.map((u) => ({
      ...u,
      totalBroadcasts: countMap.get(u.id) ?? 0,
    }));

    return { items: membersWithCount, total: countResult[0]?.count ?? 0 };
  },

  async findDetailById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const user = result[0] ?? null;
    if (!user) return null;

    const broadcastCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(broadcastHistory)
      .where(and(eq(broadcastHistory.userId, id), eq(broadcastHistory.status, 'COMPLETED')));

    return {
      ...user,
      totalBroadcasts: broadcastCount[0]?.count ?? 0,
    };
  },

  async update(id: string, data: Record<string, unknown>) {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  },

  async getReservationHistory(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(reservations)
        .where(eq(reservations.userId, userId))
        .orderBy(sql`${reservations.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(reservations)
        .where(eq(reservations.userId, userId)),
    ]);

    return { items, total: countResult[0]?.count ?? 0 };
  },
};
