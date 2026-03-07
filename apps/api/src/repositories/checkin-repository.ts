import { eq, and } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { checkins, reservations, users, studios } from '../../../../shared/db/schema';
import type { CheckinRequest } from '../../../../shared/contracts';

export const checkinRepository = {
  async findByReservationId(reservationId: string) {
    const result = await db
      .select()
      .from(checkins)
      .where(eq(checkins.reservationId, reservationId))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: CheckinRequest & { userId: string; operatorId: string }) {
    const result = await db
      .insert(checkins)
      .values({
        reservationId: data.reservationId,
        userId: data.userId,
        operatorId: data.operatorId,
        method: data.method,
        pinCode: data.pinCode,
        note: data.note,
      })
      .returning();
    return result[0]!;
  },

  async checkout(reservationId: string) {
    const result = await db
      .update(checkins)
      .set({ checkedOutAt: new Date(), updatedAt: new Date() })
      .where(and(eq(checkins.reservationId, reservationId)))
      .returning();
    return result[0] ?? null;
  },

  async findByReservationIdWithDetails(reservationId: string) {
    const result = await db
      .select({
        checkin: checkins,
        reservationNumber: reservations.reservationNumber,
        userName: users.name,
        userNickname: users.nickname,
        studioName: studios.name,
      })
      .from(checkins)
      .innerJoin(reservations, eq(checkins.reservationId, reservations.id))
      .innerJoin(users, eq(checkins.userId, users.id))
      .innerJoin(studios, eq(reservations.studioId, studios.id))
      .where(eq(checkins.reservationId, reservationId))
      .limit(1);
    return result[0] ?? null;
  },
};
