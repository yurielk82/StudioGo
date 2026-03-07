import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { reservationWaitlists, studios } from '../../../../shared/db/schema';
import type { CreateWaitlistRequest } from '../../../../shared/contracts';

export const waitlistRepository = {
  async create(userId: string, data: CreateWaitlistRequest) {
    const result = await db
      .insert(reservationWaitlists)
      .values({
        userId,
        studioId: data.studioId ?? null,
        date: data.date,
        preferredTimeRange: data.preferredTimeRange,
        status: 'ACTIVE',
      })
      .returning();
    return result[0]!;
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(reservationWaitlists)
      .where(eq(reservationWaitlists.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async cancel(id: string) {
    await db
      .update(reservationWaitlists)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(and(eq(reservationWaitlists.id, id), eq(reservationWaitlists.status, 'ACTIVE')));
  },

  async findMyWaitlist(userId: string) {
    return db
      .select({
        id: reservationWaitlists.id,
        userId: reservationWaitlists.userId,
        studioId: reservationWaitlists.studioId,
        studioName: studios.name,
        date: reservationWaitlists.date,
        preferredTimeRange: reservationWaitlists.preferredTimeRange,
        status: reservationWaitlists.status,
        priority: reservationWaitlists.priority,
        notifiedAt: reservationWaitlists.notifiedAt,
        expiresAt: reservationWaitlists.expiresAt,
        createdAt: reservationWaitlists.createdAt,
      })
      .from(reservationWaitlists)
      .leftJoin(studios, eq(reservationWaitlists.studioId, studios.id))
      .where(
        and(eq(reservationWaitlists.userId, userId), eq(reservationWaitlists.status, 'ACTIVE')),
      )
      .orderBy(sql`${reservationWaitlists.createdAt} DESC`);
  },
};
