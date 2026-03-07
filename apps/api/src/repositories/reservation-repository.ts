import { eq, and, sql, inArray, gte, lte, or, like } from 'drizzle-orm';
import { db } from '@db';
import {
  reservations,
  reservationStatusHistory,
  reservationServices,
  dailyCounters,
  users,
  studios,
  additionalServices,
} from '@db/schema';
import type { ReservationStatus } from '@studiogo/shared/contracts';

export const reservationRepository = {
  async findById(id: string) {
    const result = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async findByIdWithDetails(id: string) {
    const result = await db
      .select({
        reservation: reservations,
        userName: users.name,
        userNickname: users.nickname,
        userTier: users.tier,
        studioName: studios.name,
      })
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .innerJoin(studios, eq(reservations.studioId, studios.id))
      .where(eq(reservations.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async countActiveByUserAndDate(
    userId: string,
    date: string,
  ): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.date, date),
          inArray(reservations.status, ['PENDING', 'APPROVED']),
        ),
      );
    return result[0]?.count ?? 0;
  },

  async create(data: {
    reservationNumber: string;
    userId: string;
    studioId: string;
    timeSlotId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: ReservationStatus;
    memo?: string;
  }) {
    const result = await db.insert(reservations).values(data).returning();
    return result[0]!;
  },

  async updateStatus(
    id: string,
    status: ReservationStatus,
    extra?: {
      approvedBy?: string;
      approvedAt?: Date;
      rejectedReason?: string;
      cancelledAt?: Date;
      cancelledReason?: string;
      completedAt?: Date;
    },
  ) {
    await db
      .update(reservations)
      .set({
        status,
        ...extra,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id));
  },

  async addStatusHistory(data: {
    reservationId: string;
    fromStatus: ReservationStatus | null;
    toStatus: ReservationStatus;
    reason?: string;
    changedByUserId?: string;
    meta?: Record<string, unknown>;
  }) {
    await db.insert(reservationStatusHistory).values({
      reservationId: data.reservationId,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      reason: data.reason,
      changedByUserId: data.changedByUserId,
      meta: data.meta,
    });
  },

  async getStatusHistory(reservationId: string) {
    return db
      .select({
        fromStatus: reservationStatusHistory.fromStatus,
        toStatus: reservationStatusHistory.toStatus,
        reason: reservationStatusHistory.reason,
        changedAt: reservationStatusHistory.changedAt,
        changedByName: users.name,
      })
      .from(reservationStatusHistory)
      .leftJoin(users, eq(reservationStatusHistory.changedByUserId, users.id))
      .where(eq(reservationStatusHistory.reservationId, reservationId))
      .orderBy(reservationStatusHistory.changedAt);
  },

  async addServices(
    reservationId: string,
    services: Array<{ serviceId: string; quantity: number; memo?: string }>,
  ) {
    if (services.length === 0) return;

    await db.insert(reservationServices).values(
      services.map((s) => ({
        reservationId,
        serviceId: s.serviceId,
        quantity: s.quantity,
        memo: s.memo,
      })),
    );
  },

  async getServices(reservationId: string) {
    return db
      .select({
        serviceId: reservationServices.serviceId,
        serviceName: additionalServices.name,
        quantity: reservationServices.quantity,
        memo: reservationServices.memo,
      })
      .from(reservationServices)
      .innerJoin(additionalServices, eq(reservationServices.serviceId, additionalServices.id))
      .where(eq(reservationServices.reservationId, reservationId));
  },

  /** daily_counters에서 원자적으로 예약번호 순번 증가 */
  async getNextDailySequence(date: string): Promise<number> {
    const key = `reservation_${date}`;

    const result = await db
      .insert(dailyCounters)
      .values({ key, value: 1 })
      .onConflictDoUpdate({
        target: dailyCounters.key,
        set: {
          value: sql`${dailyCounters.value} + 1`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ value: dailyCounters.value });

    return result[0]!.value;
  },
};
