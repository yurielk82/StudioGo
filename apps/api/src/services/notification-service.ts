import { notificationRepository } from '../repositories/notification-repository';
import { sendSinglePush } from '../lib/expo-push';
import { sendAlimtalk } from '../lib/kakao-bizmessage';
import type { NotificationEventType } from '@studiogo/shared/contracts';

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
   * 리마인더 발송 — 방송 1시간 전 예약건
   */
  async processReminders(): Promise<number> {
    return 0;
  },

  /**
   * 일일 요약 — 운영자에게 오늘의 예약 요약
   */
  async processDailySummary(): Promise<number> {
    return 0;
  },

  /**
   * 주간 리포트 — 관리자에게 주간 통계
   */
  async processWeeklyReport(): Promise<number> {
    return 0;
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
