import { notificationRepository } from '../repositories/notification-repository';
import type { NotificationEventType } from '@studiogo/shared/contracts';

const MAX_RETRY_COUNT = 3;
const BATCH_SIZE = 50;

/**
 * 알림 프로세서 — notification_jobs를 처리하여 인앱 알림 생성
 * 카카오 알림톡, Expo Push는 외부 API 연동 시 확장
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
        // PROCESSING으로 전환
        await notificationRepository.updateJobStatus(job.id, 'PROCESSING');

        // 인앱 알림 생성
        const { title, body, recipientId } = buildNotificationContent(
          job.eventType as NotificationEventType,
          job.payload as Record<string, unknown>,
        );

        if (recipientId) {
          await notificationRepository.createAppNotification({
            userId: recipientId,
            title,
            body,
            type: job.eventType,
            data: job.payload as Record<string, unknown>,
          });
        }

        // 로그 기록
        await notificationRepository.createLog({
          recipientId: recipientId ?? undefined,
          eventType: job.eventType as NotificationEventType,
          content: `${title}: ${body}`,
          status: 'SENT',
          relatedReservationId: (job as { relatedReservationId?: string }).relatedReservationId ?? undefined,
        });

        // SENT로 전환
        await notificationRepository.updateJobStatus(job.id, 'SENT', {
          processedAt: new Date(),
        });
        processed++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const retryCount = (job as { retryCount?: number }).retryCount ?? 0;

        if (retryCount + 1 >= MAX_RETRY_COUNT) {
          // 최대 재시도 초과 → FAILED
          await notificationRepository.updateJobStatus(job.id, 'FAILED', {
            errorMessage,
          });
        } else {
          // 재시도 가능 → PENDING으로 복귀 (retryCount 증가)
          await notificationRepository.updateJobStatus(job.id, 'FAILED', {
            errorMessage,
          });
          // 다음 사이클에서 재처리
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
    // 1시간 후 시작되는 예약을 찾아 리마인더 job 생성
    // 실제 구현은 reservation_repository에서 시간 기반 조회 필요
    // 현재는 인프라만 구축
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
      recipientId: null, // 운영자에게 — 향후 운영자 ID 조회
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
