import { notificationRepository } from '../repositories/notification-repository';
import { sendSinglePush } from '../lib/expo-push';
import { sendAlimtalk } from '../lib/kakao-bizmessage';
import type { NotificationEventType } from '../../../../shared/contracts';

const MAX_RETRY_COUNT = 3;
const BATCH_SIZE = 50;

/**
 * 알림 프로세서 — notification_jobs를 처리하여 멀티채널 알림 발송
 * 채널: 인앱 알림 + Expo Push + 카카오 알림톡
 */
export const notificationService = {
  /**
   * PENDING 상태 job을 처리 — cron에서 호출
   */
  async processPendingJobs(): Promise<{ processed: number; failed: number }> {
    const jobs = await notificationRepository.findPendingJobs(BATCH_SIZE);
    let processed = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        await notificationRepository.updateJobStatus(job.id, 'PROCESSING');

        const { title, body, recipientId } = buildNotificationContent(
          job.eventType as NotificationEventType,
          job.payload as Record<string, unknown>,
        );

        if (recipientId) {
          // 1. 인앱 알림 생성
          await notificationRepository.createAppNotification({
            userId: recipientId,
            title,
            body,
            type: job.eventType,
            data: job.payload as Record<string, unknown>,
          });

          // 2. Expo Push 발송 (push token이 있는 경우)
          await sendPushToUser(recipientId, title, body, {
            eventType: job.eventType,
          });

          // 3. 카카오 알림톡 발송 (템플릿이 설정된 경우)
          await sendAlimtalkIfConfigured(
            job.eventType as NotificationEventType,
            job.payload as Record<string, unknown>,
          );
        }

        await notificationRepository.createLog({
          recipientId: recipientId ?? undefined,
          eventType: job.eventType as NotificationEventType,
          content: `${title}: ${body}`,
          status: 'SENT',
          relatedReservationId:
            (job as { relatedReservationId?: string }).relatedReservationId ?? undefined,
        });

        await notificationRepository.updateJobStatus(job.id, 'SENT', {
          processedAt: new Date(),
        });
        processed++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const retryCount = (job as { retryCount?: number }).retryCount ?? 0;

        if (retryCount + 1 >= MAX_RETRY_COUNT) {
          await notificationRepository.updateJobStatus(job.id, 'FAILED', {
            errorMessage,
          });
        } else {
          await notificationRepository.updateJobStatus(job.id, 'FAILED', {
            errorMessage,
          });
        }
        failed++;
      }
    }

    return { processed, failed };
  },

  /**
   * 리마인더 발송 — 방송 시작 전 예약건
   */
  async processReminders(): Promise<number> {
    const { eq, and } = await import('drizzle-orm');
    const { db } = await import('../../../../shared/db/index');
    const { reservations, users, studios } = await import('../../../../shared/db/schema');
    const { settingsRepository } = await import('../repositories/settings-repository');

    const reminderMinutes = await settingsRepository.get('reminder_before_minutes');
    const now = new Date();
    const today = now.toISOString().substring(0, 10);

    // 오늘 승인된 예약 중 방송 시작이 임박한 건 조회
    const upcomingReservations = await db
      .select({
        id: reservations.id,
        reservationNumber: reservations.reservationNumber,
        userId: reservations.userId,
        userName: users.name,
        studioName: studios.name,
        date: reservations.date,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
      })
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .innerJoin(studios, eq(reservations.studioId, studios.id))
      .where(and(eq(reservations.date, today), eq(reservations.status, 'APPROVED')));

    let sent = 0;
    for (const reservation of upcomingReservations) {
      // 시작 시간을 KST Date로 변환
      const [hours, minutes] = reservation.startTime.split(':').map(Number);
      const startDate = new Date(`${today}T00:00:00+09:00`);
      startDate.setHours(hours ?? 0, minutes ?? 0);

      const timeDiff = startDate.getTime() - now.getTime();
      const diffMinutes = timeDiff / (60 * 1000);

      // reminderMinutes 이내이고 아직 시작 전인 경우
      if (diffMinutes > 0 && diffMinutes <= reminderMinutes) {
        await notificationRepository.createJob({
          eventType: 'BROADCAST_REMINDER',
          payload: {
            reservationId: reservation.id,
            reservationNumber: reservation.reservationNumber,
            userId: reservation.userId,
            userName: reservation.userName,
            studioName: reservation.studioName,
            date: reservation.date,
            startTime: reservation.startTime,
          },
          idempotencyKey: `reminder_${reservation.id}_${today}`,
          relatedReservationId: reservation.id,
        });
        sent++;
      }
    }

    return sent;
  },

  /**
   * 일일 요약 — 운영자에게 오늘의 예약 요약
   */
  async processDailySummary(): Promise<number> {
    const { eq, sql } = await import('drizzle-orm');
    const { db } = await import('../../../../shared/db/index');
    const { reservations, users } = await import('../../../../shared/db/schema');

    const today = new Date().toISOString().substring(0, 10);

    // 오늘 예약 통계
    const stats = await db
      .select({
        status: reservations.status,
        count: sql<number>`count(*)::int`,
      })
      .from(reservations)
      .where(eq(reservations.date, today))
      .groupBy(reservations.status);

    // 운영자 목록
    const operators = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(sql`${users.role} IN ('OPERATOR', 'ADMIN')`);

    let sent = 0;
    for (const operator of operators) {
      await notificationRepository.createJob({
        eventType: 'DAILY_SUMMARY',
        payload: {
          userId: operator.id,
          userName: operator.name,
          date: today,
          stats: Object.fromEntries(stats.map((s) => [s.status, s.count])),
        },
        idempotencyKey: `daily_summary_${operator.id}_${today}`,
      });
      sent++;
    }

    return sent;
  },

  /**
   * 주간 리포트 — 관리자에게 주간 통계
   */
  async processWeeklyReport(): Promise<number> {
    const { eq, and, sql } = await import('drizzle-orm');
    const { db } = await import('../../../../shared/db/index');
    const { reservations, users } = await import('../../../../shared/db/schema');

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = weekAgo.toISOString().substring(0, 10);
    const endDate = today.toISOString().substring(0, 10);

    // 주간 예약 통계
    const weekStats = await db
      .select({
        status: reservations.status,
        count: sql<number>`count(*)::int`,
      })
      .from(reservations)
      .where(
        and(sql`${reservations.date} >= ${startDate}`, sql`${reservations.date} <= ${endDate}`),
      )
      .groupBy(reservations.status);

    // 관리자 목록
    const admins = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.role, 'ADMIN'));

    let sent = 0;
    for (const admin of admins) {
      await notificationRepository.createJob({
        eventType: 'WEEKLY_REPORT',
        payload: {
          userId: admin.id,
          userName: admin.name,
          startDate,
          endDate,
          stats: Object.fromEntries(weekStats.map((s) => [s.status, s.count])),
        },
        idempotencyKey: `weekly_report_${admin.id}_${endDate}`,
      });
      sent++;
    }

    return sent;
  },
};

/**
 * 사용자의 push token으로 Expo Push 발송
 */
async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const tokens = await notificationRepository.getActivePushTokens(userId);
    if (tokens.length === 0) return;

    for (const tokenRecord of tokens) {
      await sendSinglePush(tokenRecord.token, title, body, data);
    }
  } catch (err) {
    console.error('[Push] 발송 실패:', userId, err);
  }
}

/**
 * 알림톡 설정이 있는 이벤트에 한해 카카오 알림톡 발송
 */
async function sendAlimtalkIfConfigured(
  eventType: NotificationEventType,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const settings = await notificationRepository.getNotificationSettings(eventType);
    if (!settings?.templateCode) return;

    const phoneNumber = payload.phoneNumber as string | undefined;
    if (!phoneNumber) return;

    await sendAlimtalk({
      phoneNumber,
      templateCode: settings.templateCode,
      variables: Object.fromEntries(
        Object.entries(payload)
          .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
          .map(([k, v]) => [k, String(v)]),
      ),
    });
  } catch (err) {
    console.error('[알림톡] 발송 실패:', eventType, err);
  }
}

/**
 * 이벤트 타입별 알림 내용 생성
 */
function buildNotificationContent(
  eventType: NotificationEventType,
  payload: Record<string, unknown>,
): { title: string; body: string; recipientId: string | null } {
  const templates: Record<
    string,
    (p: Record<string, unknown>) => { title: string; body: string; recipientId: string | null }
  > = {
    MEMBER_REGISTERED: (p) => ({
      title: '새 회원 가입',
      body: `${p.userNickname ?? '새 회원'}님이 가입했습니다.`,
      recipientId: null,
    }),
    MEMBER_APPROVED: (p) => ({
      title: '회원 승인 완료',
      body: '회원가입이 승인되었습니다. StudioGo를 이용해보세요!',
      recipientId: (p.userId as string) ?? null,
    }),
    RESERVATION_REQUESTED: (p) => ({
      title: '새 예약 요청',
      body: `${p.userName ?? '회원'}님이 예약을 신청했습니다.`,
      recipientId: null,
    }),
    RESERVATION_APPROVED: (p) => ({
      title: '예약 승인',
      body: `${p.date ?? ''} 예약이 승인되었습니다.`,
      recipientId: (p.userId as string) ?? null,
    }),
    RESERVATION_REJECTED: (p) => ({
      title: '예약 거절',
      body: `예약이 거절되었습니다: ${p.reason ?? ''}`,
      recipientId: (p.userId as string) ?? null,
    }),
    RESERVATION_CANCELLED_BY_MEMBER: (p) => ({
      title: '예약 취소',
      body: `${p.userName ?? '회원'}님이 예약을 취소했습니다.`,
      recipientId: null,
    }),
    RESERVATION_CANCELLED_BY_OPERATOR: (p) => ({
      title: '예약 취소',
      body: `운영자에 의해 예약이 취소되었습니다.`,
      recipientId: (p.userId as string) ?? null,
    }),
    BROADCAST_REMINDER: (p) => ({
      title: '방송 리마인더',
      body: `${p.studioName ?? '스튜디오'} 방송이 1시간 후 시작됩니다.`,
      recipientId: (p.userId as string) ?? null,
    }),
    TIER_UPGRADED: (p) => ({
      title: '등급 승급',
      body: `축하합니다! ${p.newTier ?? ''} 등급으로 승급되었습니다.`,
      recipientId: (p.userId as string) ?? null,
    }),
    TIER_DOWNGRADED: (p) => ({
      title: '등급 변경',
      body: `등급이 ${p.newTier ?? ''}(으)로 변경되었습니다.`,
      recipientId: (p.userId as string) ?? null,
    }),
    NO_SHOW: (p) => ({
      title: '노쇼 알림',
      body: '예약에 출석하지 않아 노쇼 처리되었습니다.',
      recipientId: (p.userId as string) ?? null,
    }),
  };

  const builder = templates[eventType];
  if (builder) {
    return builder(payload);
  }

  return {
    title: '알림',
    body: `[${eventType}] 새로운 알림이 있습니다.`,
    recipientId: (payload.userId as string) ?? null,
  };
}
