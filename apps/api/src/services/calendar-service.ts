import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import {
  timeSlots,
  studios,
  reservations,
  studioBlackouts,
  users,
} from '../../../../shared/db/schema';
import { addDays, dateRange } from '../../../../shared/domain/date-time';
import type {
  MonthlyCalendarQuery,
  WeeklyCalendarQuery,
  DailyCalendarQuery,
} from '../../../../shared/contracts';

export const calendarService = {
  /** 월간 캘린더 데이터 */
  async getMonthly(query: MonthlyCalendarQuery, userId: string) {
    const { year, month, studioId } = query;

    // 월의 첫째/마지막 날 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const dates = dateRange(startDate, endDate);

    // 날짜별 슬롯 집계
    const slotConditions = [
      sql`${timeSlots.date} >= ${startDate}`,
      sql`${timeSlots.date} <= ${endDate}`,
    ];
    if (studioId) slotConditions.push(eq(timeSlots.studioId, studioId));

    const [slotStats, blackouts, myReservations] = await Promise.all([
      db
        .select({
          date: timeSlots.date,
          status: timeSlots.status,
          count: sql<number>`count(*)::int`,
        })
        .from(timeSlots)
        .where(and(...slotConditions))
        .groupBy(timeSlots.date, timeSlots.status),

      db
        .select({
          studioId: studioBlackouts.studioId,
          startAt: studioBlackouts.startAt,
          endAt: studioBlackouts.endAt,
        })
        .from(studioBlackouts)
        .where(
          and(
            sql`${studioBlackouts.startAt}::date <= ${endDate}`,
            sql`${studioBlackouts.endAt}::date >= ${startDate}`,
          ),
        ),

      db
        .select({ date: reservations.date })
        .from(reservations)
        .where(
          and(
            eq(reservations.userId, userId),
            sql`${reservations.date} >= ${startDate}`,
            sql`${reservations.date} <= ${endDate}`,
            sql`${reservations.status} IN ('PENDING', 'APPROVED')`,
          ),
        ),
    ]);

    // 날짜별 집계
    const slotMap = new Map<
      string,
      { total: number; available: number; reserved: number; blocked: number }
    >();
    for (const row of slotStats) {
      const dateStr =
        typeof row.date === 'string'
          ? row.date
          : new Date(row.date as unknown as string).toISOString().split('T')[0]!;
      if (!slotMap.has(dateStr)) {
        slotMap.set(dateStr, { total: 0, available: 0, reserved: 0, blocked: 0 });
      }
      const entry = slotMap.get(dateStr)!;
      entry.total += row.count;
      if (row.status === 'AVAILABLE') entry.available += row.count;
      else if (row.status === 'RESERVED' || row.status === 'IN_USE') entry.reserved += row.count;
      else if (row.status === 'BLOCKED') entry.blocked += row.count;
    }

    const myReservationDates = new Set(
      myReservations.map((r) =>
        typeof r.date === 'string'
          ? r.date
          : new Date(r.date as unknown as string).toISOString().split('T')[0],
      ),
    );

    const blackoutDates = new Set<string>();
    for (const bo of blackouts) {
      const start = new Date(bo.startAt).toISOString().split('T')[0]!;
      const end = new Date(bo.endAt).toISOString().split('T')[0]!;
      const range = dateRange(start > startDate ? start : startDate, end < endDate ? end : endDate);
      range.forEach((d) => blackoutDates.add(d));
    }

    return dates.map((date) => {
      const stats = slotMap.get(date) ?? { total: 0, available: 0, reserved: 0, blocked: 0 };
      return {
        date,
        totalSlots: stats.total,
        availableSlots: stats.available,
        reservedSlots: stats.reserved,
        blockedSlots: stats.blocked,
        isBlackout: blackoutDates.has(date),
        hasMyReservation: myReservationDates.has(date),
      };
    });
  },

  /** 주간 캘린더 데이터 */
  async getWeekly(query: WeeklyCalendarQuery) {
    const { date, studioId } = query;

    // 해당 날짜의 월요일 ~ 일요일 계산
    const targetDate = new Date(`${date}T00:00:00+09:00`);
    const dayOfWeek = targetDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startDate = addDays(date, mondayOffset);
    const endDate = addDays(startDate, 6);

    const conditions = [
      sql`${timeSlots.date} >= ${startDate}`,
      sql`${timeSlots.date} <= ${endDate}`,
    ];
    if (studioId) conditions.push(eq(timeSlots.studioId, studioId));

    const slots = await db
      .select({
        id: timeSlots.id,
        studioId: timeSlots.studioId,
        studioName: studios.name,
        date: timeSlots.date,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
        cleaningEndTime: timeSlots.cleaningEndTime,
        status: timeSlots.status,
        reservationId: reservations.id,
        reservationNumber: reservations.reservationNumber,
        userName: users.name,
        userNickname: users.nickname,
        reservationStatus: reservations.status,
      })
      .from(timeSlots)
      .innerJoin(studios, eq(timeSlots.studioId, studios.id))
      .leftJoin(
        reservations,
        and(
          eq(timeSlots.id, reservations.timeSlotId),
          sql`${reservations.status} IN ('PENDING', 'APPROVED', 'COMPLETED')`,
        ),
      )
      .leftJoin(users, eq(reservations.userId, users.id))
      .where(and(...conditions))
      .orderBy(timeSlots.date, timeSlots.startTime);

    return slots.map((s) => ({
      id: s.id,
      studioId: s.studioId,
      studioName: s.studioName,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      cleaningEndTime: s.cleaningEndTime,
      status: s.status,
      reservation: s.reservationId
        ? {
            id: s.reservationId,
            reservationNumber: s.reservationNumber!,
            userName: s.userName!,
            userNickname: s.userNickname!,
            status: s.reservationStatus!,
          }
        : null,
    }));
  },

  /** 일간 캘린더 데이터 */
  async getDaily(query: DailyCalendarQuery) {
    const { date, studioId } = query;

    const conditions = [eq(timeSlots.date, date)];
    if (studioId) conditions.push(eq(timeSlots.studioId, studioId));

    const slots = await db
      .select({
        id: timeSlots.id,
        studioId: timeSlots.studioId,
        studioName: studios.name,
        date: timeSlots.date,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
        cleaningEndTime: timeSlots.cleaningEndTime,
        status: timeSlots.status,
        reservationId: reservations.id,
        reservationNumber: reservations.reservationNumber,
        userName: users.name,
        userNickname: users.nickname,
        reservationStatus: reservations.status,
      })
      .from(timeSlots)
      .innerJoin(studios, eq(timeSlots.studioId, studios.id))
      .leftJoin(
        reservations,
        and(
          eq(timeSlots.id, reservations.timeSlotId),
          sql`${reservations.status} IN ('PENDING', 'APPROVED', 'COMPLETED')`,
        ),
      )
      .leftJoin(users, eq(reservations.userId, users.id))
      .where(and(...conditions))
      .orderBy(timeSlots.startTime);

    // 스튜디오별 그룹핑
    const studioMap = new Map<
      string,
      { studioId: string; studioName: string; slots: typeof slots }
    >();
    for (const slot of slots) {
      if (!studioMap.has(slot.studioId)) {
        studioMap.set(slot.studioId, {
          studioId: slot.studioId,
          studioName: slot.studioName,
          slots: [],
        });
      }
      studioMap.get(slot.studioId)!.slots.push(slot);
    }

    return [...studioMap.values()].map((studio) => ({
      studioId: studio.studioId,
      studioName: studio.studioName,
      slots: studio.slots.map((s) => ({
        id: s.id,
        studioId: s.studioId,
        studioName: s.studioName,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        cleaningEndTime: s.cleaningEndTime,
        status: s.status,
        reservation: s.reservationId
          ? {
              id: s.reservationId,
              reservationNumber: s.reservationNumber!,
              userName: s.userName!,
              userNickname: s.userNickname!,
              status: s.reservationStatus!,
            }
          : null,
      })),
    }));
  },
};
