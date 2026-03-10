import { db } from '../../../../shared/db/index';
import { reservations } from '../../../../shared/db/schema/reservations';
import { users } from '../../../../shared/db/schema/users';
import { timeSlots } from '../../../../shared/db/schema/time-slots';
import { studios } from '../../../../shared/db/schema/studios';
import { sql, eq, and, gte, lte, count, inArray } from 'drizzle-orm';

type Period = 'week' | 'month' | 'quarter';

function getPeriodStartDate(period: Period): string {
  const now = new Date();
  const d = new Date(now);

  switch (period) {
    case 'week':
      d.setDate(d.getDate() - 7);
      break;
    case 'month':
      d.setDate(d.getDate() - 30);
      break;
    case 'quarter':
      d.setDate(d.getDate() - 90);
      break;
  }

  return d.toISOString().substring(0, 10);
}

export const statsService = {
  async getAdminStats(period: Period = 'month') {
    const startDate = getPeriodStartDate(period);
    const today = new Date().toISOString().substring(0, 10);

    // 회원 통계
    const memberRows = await db
      .select({
        totalMembers: count(),
        activeMembers: sql<number>`count(*) filter (where ${users.status} = 'APPROVED')`,
      })
      .from(users)
      .where(eq(users.role, 'MEMBER'));

    const memberStats = memberRows[0] ?? { totalMembers: 0, activeMembers: 0 };

    // 예약 통계
    const reservationRows = await db
      .select({
        totalReservations: count(),
        monthlyReservations: sql<number>`count(*) filter (where ${reservations.date} >= ${startDate})`,
        noShowCount: sql<number>`count(*) filter (where ${reservations.status} = 'NO_SHOW')`,
        cancelledCount: sql<number>`count(*) filter (where ${reservations.status} = 'CANCELLED')`,
      })
      .from(reservations);

    const reservationStats = reservationRows[0] ?? {
      totalReservations: 0,
      monthlyReservations: 0,
      noShowCount: 0,
      cancelledCount: 0,
    };

    const total = Number(reservationStats.totalReservations) || 1;
    const noShowRate = Math.round((Number(reservationStats.noShowCount) / total) * 100 * 10) / 10;
    const cancellationRate =
      Math.round((Number(reservationStats.cancelledCount) / total) * 100 * 10) / 10;

    // 기간 내 일별 예약 수
    const dailyReservations = await db
      .select({
        date: reservations.date,
        count: count(),
      })
      .from(reservations)
      .where(and(gte(reservations.date, startDate), lte(reservations.date, today)))
      .groupBy(reservations.date)
      .orderBy(reservations.date);

    // 스튜디오별 가동률 — 기간 내 (예약 슬롯 / 전체 슬롯)
    const activeStudios = await db
      .select({ id: studios.id, name: studios.name })
      .from(studios)
      .where(eq(studios.isActive, true));

    const studioIds = activeStudios.map((s) => s.id);
    const studioUtilization: { studioName: string; rate: number }[] = [];

    if (studioIds.length > 0) {
      const utilRows = await db
        .select({
          studioId: timeSlots.studioId,
          totalSlots: count(),
          reservedSlots: sql<number>`count(*) filter (where ${timeSlots.status} in ('RESERVED', 'IN_USE', 'COMPLETED'))`,
        })
        .from(timeSlots)
        .where(
          and(
            gte(timeSlots.date, startDate),
            lte(timeSlots.date, today),
            inArray(timeSlots.studioId, studioIds),
          ),
        )
        .groupBy(timeSlots.studioId);

      for (const studio of activeStudios) {
        const row = utilRows.find((r) => r.studioId === studio.id);
        const totalSlots = Number(row?.totalSlots) || 1;
        const reserved = Number(row?.reservedSlots) || 0;
        const rate = Math.round((reserved / totalSlots) * 100);
        studioUtilization.push({ studioName: studio.name, rate });
      }
    }

    const averageOccupancyRate =
      studioUtilization.length > 0
        ? Math.round(
            studioUtilization.reduce((sum, s) => sum + s.rate, 0) / studioUtilization.length,
          )
        : 0;

    // 티어별 회원 수
    const tierDistribution = await db
      .select({
        tier: users.tier,
        count: count(),
      })
      .from(users)
      .where(and(eq(users.role, 'MEMBER'), eq(users.status, 'APPROVED')))
      .groupBy(users.tier);

    return {
      totalMembers: Number(memberStats.totalMembers),
      activeMembers: Number(memberStats.activeMembers),
      totalReservations: Number(reservationStats.totalReservations),
      monthlyReservations: Number(reservationStats.monthlyReservations),
      averageOccupancyRate,
      noShowRate,
      cancellationRate,
      dailyReservations: dailyReservations.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
      studioUtilization,
      tierDistribution: tierDistribution.map((t) => ({
        tier: t.tier,
        count: Number(t.count),
      })),
    };
  },
};
