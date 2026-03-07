import { reservationRepository } from '../repositories/reservation-repository';
import { slotRepository } from '../repositories/slot-repository';
import { settingsRepository } from '../repositories/settings-repository';
import { userRepository } from '../repositories/user-repository';
import { notificationRepository } from '../repositories/notification-repository';
import { ApiError } from '../lib/api-error';
import {
  reservationStateMachine,
  canCreateReservation,
  shouldAutoApprove,
  isWithinBookingWindow,
  canCancelReservation,
  generateReservationNumber,
} from '@domain/reservation';
import { timeSlotStateMachine } from '@domain/slot';
import { kstToUTC, todayKST } from '@domain/date-time';
import type { CreateReservationRequest, ReservationStatus } from '@studiogo/shared/contracts';

export const reservationService = {
  /** 예약 생성 */
  async create(userId: string, data: CreateReservationRequest) {
    // 1. 설정 조회
    const [maxSlots, maxDays, autoApprove] = await Promise.all([
      settingsRepository.get('max_slots_per_day_per_member'),
      settingsRepository.get('max_advance_booking_days'),
      settingsRepository.get('auto_approve_gold_above'),
    ]);

    // 2. 예약 가능일 범위 확인
    const today = todayKST();
    const targetDateMs = new Date(`${data.date}T00:00:00+09:00`).getTime();
    const nowMs = new Date(`${today}T00:00:00+09:00`).getTime();

    const bookingCheck = isWithinBookingWindow({
      targetDateMs,
      nowMs,
      maxAdvanceBookingDays: maxDays,
    });
    if (!bookingCheck.allowed) {
      throw ApiError.badRequest('RESERVATION_SLOT_UNAVAILABLE', bookingCheck.reason!);
    }

    // 3. 하루 최대 예약 수 확인
    const activeCount = await reservationRepository.countActiveByUserAndDate(userId, data.date);
    const maxCheck = canCreateReservation({
      activeReservationCount: activeCount,
      maxSlotsPerDayPerMember: maxSlots,
    });
    if (!maxCheck.allowed) {
      throw ApiError.badRequest('RESERVATION_MAX_PER_DAY', maxCheck.reason!);
    }

    // 4. 슬롯 확인
    const slot = await slotRepository.findById(data.timeSlotId);
    if (!slot || slot.status !== 'AVAILABLE') {
      throw ApiError.conflict('RESERVATION_SLOT_UNAVAILABLE', '선택한 시간은 이미 예약되었습니다.');
    }

    // 5. Hold 처리
    if (data.holdToken) {
      const hold = await slotRepository.findHoldByToken(data.holdToken);
      if (!hold || hold.status !== 'ACTIVE' || hold.userId !== userId) {
        throw ApiError.badRequest('RESERVATION_HOLD_EXPIRED', 'Hold가 만료되었거나 유효하지 않습니다.');
      }
      await slotRepository.consumeHold(data.holdToken);
    }

    // 6. 예약번호 생성
    const sequence = await reservationRepository.getNextDailySequence(data.date);
    const reservationNumber = generateReservationNumber(data.date, sequence);

    // 7. Auto approve 여부 확인
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('MEMBER_NOT_FOUND', '사용자를 찾을 수 없습니다.');

    const isAutoApproved = shouldAutoApprove(user.tier, autoApprove);
    const initialStatus: ReservationStatus = isAutoApproved ? 'APPROVED' : 'PENDING';

    // 8. 예약 생성
    const reservation = await reservationRepository.create({
      reservationNumber,
      userId,
      studioId: data.studioId,
      timeSlotId: data.timeSlotId,
      date: data.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: initialStatus,
      memo: data.memo,
    });

    // 9. 슬롯 상태 변경 (승인 시)
    if (isAutoApproved) {
      timeSlotStateMachine.transition(slot.status as 'AVAILABLE', 'RESERVED');
      await slotRepository.updateStatus(slot.id, 'RESERVED');
    }

    // 10. 부가서비스 추가
    if (data.services.length > 0) {
      await reservationRepository.addServices(reservation.id, data.services);
    }

    // 11. 상태 이력 기록
    await reservationRepository.addStatusHistory({
      reservationId: reservation.id,
      fromStatus: null,
      toStatus: initialStatus,
      changedByUserId: userId,
      meta: isAutoApproved ? { autoApproved: true, tier: user.tier } : undefined,
    });

    // 12. 알림 이벤트
    await notificationRepository.createJob({
      eventType: 'RESERVATION_REQUESTED',
      payload: {
        reservationId: reservation.id,
        reservationNumber,
        userId,
        userName: user.name,
        userNickname: user.nickname,
        date: data.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        studioId: data.studioId,
      },
      idempotencyKey: `reservation_requested_${reservation.id}`,
      relatedReservationId: reservation.id,
    });

    if (isAutoApproved) {
      await notificationRepository.createJob({
        eventType: 'RESERVATION_APPROVED',
        payload: {
          reservationId: reservation.id,
          reservationNumber,
          userId,
          userName: user.name,
          date: data.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        idempotencyKey: `reservation_approved_${reservation.id}`,
        relatedReservationId: reservation.id,
      });
    }

    return reservation;
  },

  /** 예약 승인 */
  async approve(reservationId: string, operatorId: string) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) throw ApiError.notFound('RESERVATION_NOT_FOUND', '예약을 찾을 수 없습니다.');

    reservationStateMachine.transition(reservation.status as 'PENDING', 'APPROVED');

    await reservationRepository.updateStatus(reservationId, 'APPROVED', {
      approvedBy: operatorId,
      approvedAt: new Date(),
    });

    // 슬롯 상태 변경
    await slotRepository.updateStatus(reservation.timeSlotId, 'RESERVED');

    // 이력 기록
    await reservationRepository.addStatusHistory({
      reservationId,
      fromStatus: reservation.status,
      toStatus: 'APPROVED',
      changedByUserId: operatorId,
    });

    // 알림
    const user = await userRepository.findById(reservation.userId);
    await notificationRepository.createJob({
      eventType: 'RESERVATION_APPROVED',
      payload: {
        reservationId,
        reservationNumber: reservation.reservationNumber,
        userId: reservation.userId,
        userName: user?.name,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      },
      idempotencyKey: `reservation_approved_${reservationId}`,
      relatedReservationId: reservationId,
    });
  },

  /** 예약 거절 */
  async reject(reservationId: string, operatorId: string, reason: string) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) throw ApiError.notFound('RESERVATION_NOT_FOUND', '예약을 찾을 수 없습니다.');

    reservationStateMachine.transition(reservation.status as 'PENDING', 'REJECTED');

    await reservationRepository.updateStatus(reservationId, 'REJECTED', {
      rejectedReason: reason,
    });

    await reservationRepository.addStatusHistory({
      reservationId,
      fromStatus: reservation.status,
      toStatus: 'REJECTED',
      reason,
      changedByUserId: operatorId,
    });

    const user = await userRepository.findById(reservation.userId);
    await notificationRepository.createJob({
      eventType: 'RESERVATION_REJECTED',
      payload: {
        reservationId,
        reservationNumber: reservation.reservationNumber,
        userId: reservation.userId,
        userName: user?.name,
        reason,
      },
      idempotencyKey: `reservation_rejected_${reservationId}`,
      relatedReservationId: reservationId,
    });
  },

  /** 예약 취소 */
  async cancel(
    reservationId: string,
    cancelledBy: string,
    reason: string,
    isOperatorOrAdmin: boolean,
  ) {
    const reservation = await reservationRepository.findById(reservationId);
    if (!reservation) throw ApiError.notFound('RESERVATION_NOT_FOUND', '예약을 찾을 수 없습니다.');

    // 취소 가능 여부 확인
    if (reservation.status === 'PENDING' || reservation.status === 'APPROVED') {
      const deadlineHours = await settingsRepository.get('cancellation_deadline_hours');
      const startTimeMs = kstToUTC(reservation.date, reservation.startTime).getTime();

      const cancelCheck = canCancelReservation({
        reservationStatus: reservation.status,
        startTimeMs,
        nowMs: Date.now(),
        deadlineHours,
        isOperatorOrAdmin,
      });

      if (!cancelCheck.allowed) {
        throw ApiError.badRequest('RESERVATION_CANCEL_DEADLINE', cancelCheck.reason!);
      }
    }

    reservationStateMachine.transition(
      reservation.status as 'PENDING' | 'APPROVED',
      'CANCELLED',
    );

    await reservationRepository.updateStatus(reservationId, 'CANCELLED', {
      cancelledAt: new Date(),
      cancelledReason: reason,
    });

    // 슬롯 해제 (RESERVED → AVAILABLE)
    if (reservation.status === 'APPROVED') {
      await slotRepository.updateStatus(reservation.timeSlotId, 'AVAILABLE');
    }

    await reservationRepository.addStatusHistory({
      reservationId,
      fromStatus: reservation.status,
      toStatus: 'CANCELLED',
      reason,
      changedByUserId: cancelledBy,
    });

    const eventType = isOperatorOrAdmin
      ? 'RESERVATION_CANCELLED_BY_OPERATOR'
      : 'RESERVATION_CANCELLED_BY_MEMBER';

    await notificationRepository.createJob({
      eventType,
      payload: {
        reservationId,
        reservationNumber: reservation.reservationNumber,
        userId: reservation.userId,
        reason,
      },
      idempotencyKey: `reservation_cancelled_${reservationId}`,
      relatedReservationId: reservationId,
    });
  },
};
