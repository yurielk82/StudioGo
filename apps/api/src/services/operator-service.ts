import { checkinRepository } from '../repositories/checkin-repository';
import { fulfillmentRepository } from '../repositories/fulfillment-repository';
import { reservationRepository } from '../repositories/reservation-repository';
import { systemLogRepository } from '../repositories/system-log-repository';
import { ApiError } from '../lib/api-error';
import { getCheckinState, canCheckIn, canCheckOut } from '../../../../shared/domain/checkin';
import { fulfillmentStateMachine } from '../../../../shared/domain/fulfillment';
import type {
  CheckinRequest,
  FulfillmentListQuery,
  UpdateFulfillmentRequest,
} from '../../../../shared/contracts';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import {
  reservations,
  users,
  timeSlots,
  checkins,
  fulfillmentTasks,
  appNotifications,
} from '../../../../shared/db/schema';

export const operatorService = {
  /** 대시보드 데이터 */
  async getDashboard() {
    const today = new Date().toISOString().substring(0, 10);

    // 이번 주 월~일 계산
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(monday.getDate() + mondayOffset);
    const mondayStr = monday.toISOString().substring(0, 10);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const sundayStr = sunday.toISOString().substring(0, 10);

    const [
      todayStats,
      pendingApprovals,
      pendingMembers,
      inProgressCount,
      pendingFulfillmentCount,
      weeklySlotStats,
      recentNotifs,
    ] = await Promise.all([
      // 오늘 예약 현황
      db
        .select({
          status: reservations.status,
          count: sql<number>`count(*)::int`,
        })
        .from(reservations)
        .where(eq(reservations.date, today))
        .groupBy(reservations.status),

      // 대기 중 승인 건수
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(reservations)
        .where(eq(reservations.status, 'PENDING')),

      // 대기 중 회원 가입
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.status, 'PENDING')),

      // 오늘 체크인 중 (체크아웃 미완) 건수
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(checkins)
        .innerJoin(reservations, eq(checkins.reservationId, reservations.id))
        .where(and(eq(reservations.date, today), sql`${checkins.checkedOutAt} IS NULL`)),

      // 포장 대기 건수
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(fulfillmentTasks)
        .where(eq(fulfillmentTasks.status, 'PENDING')),

      // 이번 주 슬롯 이용률
      db
        .select({
          reserved: sql<number>`count(*) FILTER (WHERE ${timeSlots.status} IN ('RESERVED', 'IN_USE', 'COMPLETED'))::int`,
          total: sql<number>`count(*)::int`,
        })
        .from(timeSlots)
        .where(and(sql`${timeSlots.date} >= ${mondayStr}`, sql`${timeSlots.date} <= ${sundayStr}`)),

      // 최근 앱 알림 5건 (운영자/관리자 대상)
      db
        .select({
          id: appNotifications.id,
          title: appNotifications.title,
          body: appNotifications.body,
          type: appNotifications.type,
          isRead: appNotifications.isRead,
          createdAt: appNotifications.createdAt,
        })
        .from(appNotifications)
        .where(
          sql`${appNotifications.userId} IN (SELECT id FROM users WHERE role IN ('OPERATOR', 'ADMIN'))`,
        )
        .orderBy(sql`${appNotifications.createdAt} DESC`)
        .limit(5),
    ]);

    const statusMap = new Map(todayStats.map((s) => [s.status, s.count]));
    const slotStats = weeklySlotStats[0];
    const weeklyRate =
      slotStats && slotStats.total > 0
        ? Math.round((slotStats.reserved / slotStats.total) * 100)
        : 0;

    return {
      todayReservations: {
        total: [...statusMap.values()].reduce((a, b) => a + b, 0),
        pending: statusMap.get('PENDING') ?? 0,
        approved: statusMap.get('APPROVED') ?? 0,
        inProgress: inProgressCount[0]?.count ?? 0,
        completed: statusMap.get('COMPLETED') ?? 0,
      },
      pendingApprovals: pendingApprovals[0]?.count ?? 0,
      pendingMembers: pendingMembers[0]?.count ?? 0,
      pendingFulfillment: pendingFulfillmentCount[0]?.count ?? 0,
      weeklyReservationRate: weeklyRate,
      recentNotifications: recentNotifs,
    };
  },

  /** 체크인 처리 */
  async checkin(data: CheckinRequest, operatorId: string) {
    const reservation = await reservationRepository.findById(data.reservationId);
    if (!reservation) {
      throw ApiError.notFound('RESERVATION_NOT_FOUND', '예약을 찾을 수 없습니다.');
    }
    if (reservation.status !== 'APPROVED') {
      throw ApiError.badRequest(
        'RESERVATION_INVALID_TRANSITION',
        '승인된 예약만 체크인할 수 있습니다.',
      );
    }

    // 이미 체크인 여부 확인
    const existingCheckin = await checkinRepository.findByReservationId(data.reservationId);
    if (existingCheckin) {
      const state = getCheckinState(existingCheckin.checkedInAt, existingCheckin.checkedOutAt);
      if (!canCheckIn(state)) {
        throw ApiError.conflict('GENERAL_CONFLICT', '이미 체크인된 예약입니다.');
      }
    }

    const checkin = await checkinRepository.create({
      ...data,
      userId: reservation.userId,
      operatorId,
    });

    // 슬롯 상태 → IN_USE
    await db
      .update(timeSlots)
      .set({ status: 'IN_USE', updatedAt: new Date() })
      .where(eq(timeSlots.id, reservation.timeSlotId));

    // 체크인 응답 빌드
    const details = await checkinRepository.findByReservationIdWithDetails(data.reservationId);

    await systemLogRepository.create({
      userId: operatorId,
      action: 'CHECKIN',
      target: 'checkins',
      targetId: checkin.id,
      details: { reservationId: data.reservationId, method: data.method },
    });

    return {
      id: checkin.id,
      reservationId: data.reservationId,
      reservationNumber: details?.reservationNumber ?? '',
      userName: details?.userName ?? '',
      userNickname: details?.userNickname ?? '',
      studioName: details?.studioName ?? '',
      method: checkin.method,
      checkedInAt: checkin.checkedInAt.toISOString(),
    };
  },

  /** 체크아웃 */
  async checkout(reservationId: string, operatorId: string) {
    const existingCheckin = await checkinRepository.findByReservationId(reservationId);
    if (!existingCheckin) {
      throw ApiError.notFound('GENERAL_NOT_FOUND', '체크인 기록을 찾을 수 없습니다.');
    }

    const state = getCheckinState(existingCheckin.checkedInAt, existingCheckin.checkedOutAt);
    if (!canCheckOut(state)) {
      throw ApiError.badRequest('GENERAL_INVALID_OPERATION', '체크아웃할 수 없는 상태입니다.');
    }

    await checkinRepository.checkout(reservationId);

    // 슬롯 상태 → CLEANING
    const reservation = await reservationRepository.findById(reservationId);
    if (reservation) {
      await db
        .update(timeSlots)
        .set({ status: 'CLEANING', updatedAt: new Date() })
        .where(eq(timeSlots.id, reservation.timeSlotId));
    }

    await systemLogRepository.create({
      userId: operatorId,
      action: 'CHECKOUT',
      target: 'checkins',
      targetId: existingCheckin.id,
      details: { reservationId },
    });
  },

  /** 포장 작업 목록 */
  async getFulfillments(query: FulfillmentListQuery) {
    return fulfillmentRepository.findAll(query);
  },

  /** 포장 상태 변경 */
  async updateFulfillment(id: string, data: UpdateFulfillmentRequest, operatorId: string) {
    const existing = await fulfillmentRepository.findById(id);
    if (!existing)
      throw ApiError.notFound('FULFILLMENT_NOT_FOUND', '포장 작업을 찾을 수 없습니다.');

    // 상태 전이 유효성 검증
    if (data.status) {
      fulfillmentStateMachine.transition(
        existing.status as Parameters<typeof fulfillmentStateMachine.transition>[0],
        data.status as Parameters<typeof fulfillmentStateMachine.transition>[1],
      );
    }

    const updated = await fulfillmentRepository.update(id, data, operatorId);

    await systemLogRepository.create({
      userId: operatorId,
      action: 'FULFILLMENT_UPDATE',
      target: 'fulfillment_tasks',
      targetId: id,
      details: data,
    });

    return updated;
  },

  /** 운영 통계 */
  async getStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [totalReservations, weekReservations, totalMembers, approvedMembers] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(reservations),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(reservations)
        .where(sql`${reservations.date} >= ${weekAgo}`),
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.status, 'APPROVED')),
    ]);

    return {
      totalReservations: totalReservations[0]?.count ?? 0,
      weeklyReservations: weekReservations[0]?.count ?? 0,
      totalMembers: totalMembers[0]?.count ?? 0,
      approvedMembers: approvedMembers[0]?.count ?? 0,
    };
  },
};
