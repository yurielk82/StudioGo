import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { notificationSettings, notificationEventTypeEnum } from '../schema';
import { sql } from 'drizzle-orm';

type NotificationEventType = (typeof notificationEventTypeEnum.enumValues)[number];

type EventSeed = {
  eventType: NotificationEventType;
  sendToMember: boolean;
  sendToOperator: boolean;
  templateContent: string;
};

const EVENTS: EventSeed[] = [
  {
    eventType: 'MEMBER_REGISTERED',
    sendToMember: false,
    sendToOperator: true,
    templateContent: '새 회원 {{회원이름}}님이 가입했습니다.',
  },
  {
    eventType: 'MEMBER_APPROVED',
    sendToMember: true,
    sendToOperator: false,
    templateContent:
      '{{회원이름}}님, 회원 승인이 완료되었습니다. 스튜디오고에 오신 것을 환영합니다!',
  },
  {
    eventType: 'MEMBER_REJECTED',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, 회원 가입 심사 결과를 안내드립니다.',
  },
  {
    eventType: 'RESERVATION_REQUESTED',
    sendToMember: true,
    sendToOperator: true,
    templateContent:
      '{{닉네임}}님이 {{날짜}} {{시간}} {{스튜디오명}} 예약을 신청했습니다. ({{예약번호}})',
  },
  {
    eventType: 'RESERVATION_APPROVED',
    sendToMember: true,
    sendToOperator: false,
    templateContent:
      '{{회원이름}}님, {{날짜}} {{시간}} {{스튜디오명}} 예약이 승인되었습니다. ({{예약번호}})',
  },
  {
    eventType: 'RESERVATION_REJECTED',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, {{예약번호}} 예약이 거절되었습니다. 사유: {{거절사유}}',
  },
  {
    eventType: 'RESERVATION_CANCELLED_BY_MEMBER',
    sendToMember: true,
    sendToOperator: true,
    templateContent: '{{닉네임}}님이 {{예약번호}} 예약을 취소했습니다. 사유: {{취소사유}}',
  },
  {
    eventType: 'RESERVATION_CANCELLED_BY_OPERATOR',
    sendToMember: true,
    sendToOperator: false,
    templateContent:
      '{{회원이름}}님, {{예약번호}} 예약이 운영자에 의해 취소되었습니다. 사유: {{취소사유}}',
  },
  {
    eventType: 'BROADCAST_REMINDER',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, {{시간}}에 {{스튜디오명}} 방송이 예정되어 있습니다.',
  },
  {
    eventType: 'BROADCAST_START',
    sendToMember: false,
    sendToOperator: true,
    templateContent: '{{닉네임}}님이 {{스튜디오명}}에서 방송을 시작했습니다.',
  },
  {
    eventType: 'BROADCAST_END',
    sendToMember: true,
    sendToOperator: true,
    templateContent: '{{닉네임}}님의 {{스튜디오명}} 방송이 종료되었습니다.',
  },
  {
    eventType: 'CLEANING_COMPLETE',
    sendToMember: false,
    sendToOperator: true,
    templateContent: '{{스튜디오명}} 청소가 완료되었습니다.',
  },
  {
    eventType: 'TIER_UPGRADED',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, {{티어명}} 등급으로 승급되었습니다! (총 {{방송횟수}}회 방송)',
  },
  {
    eventType: 'TIER_DOWNGRADED',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, {{티어명}} 등급으로 변경되었습니다.',
  },
  {
    eventType: 'NO_SHOW',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, {{예약번호}} 예약이 노쇼 처리되었습니다.',
  },
  {
    eventType: 'SCHEDULE_CHANGED',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{회원이름}}님, {{예약번호}} 예약 일정이 변경되었습니다.',
  },
  {
    eventType: 'STUDIO_BLOCKED',
    sendToMember: true,
    sendToOperator: false,
    templateContent: '{{스튜디오명}} 스튜디오가 {{날짜}} {{시간}}~{{종료시간}} 차단되었습니다.',
  },
  {
    eventType: 'DAILY_SUMMARY',
    sendToMember: false,
    sendToOperator: true,
    templateContent: '오늘의 예약 현황 요약입니다.',
  },
  {
    eventType: 'WEEKLY_REPORT',
    sendToMember: false,
    sendToOperator: true,
    templateContent: '이번 주 운영 리포트입니다.',
  },
];

export async function seedNotificationSettings(db: PostgresJsDatabase<Record<string, unknown>>) {
  for (const event of EVENTS) {
    await db
      .insert(notificationSettings)
      .values({
        eventType: event.eventType,
        isEnabled: true,
        sendToMember: event.sendToMember,
        sendToOperator: event.sendToOperator,
        templateContent: event.templateContent,
      })
      .onConflictDoUpdate({
        target: notificationSettings.eventType,
        set: {
          templateContent: sql`excluded.template_content`,
          sendToMember: sql`excluded.send_to_member`,
          sendToOperator: sql`excluded.send_to_operator`,
          updatedAt: sql`now()`,
        },
      });
  }
}
