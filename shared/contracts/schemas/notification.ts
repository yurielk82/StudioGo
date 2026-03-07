import { z } from 'zod';
import { NotificationEventType, NotificationLogStatus } from '../enums';

// ── 알림 설정 수정 ──────────────────────────────

export const UpdateNotificationSettingRequestSchema = z.object({
  isEnabled: z.boolean().optional(),
  sendToMember: z.boolean().optional(),
  sendToOperator: z.boolean().optional(),
  templateCode: z.string().max(50).optional(),
  templateContent: z.string().max(2000).optional(),
  timing: z
    .object({
      beforeMinutes: z.number().int().nonnegative().optional(),
    })
    .optional(),
});
export type UpdateNotificationSettingRequest = z.infer<
  typeof UpdateNotificationSettingRequestSchema
>;

// ── 테스트 발송 ──────────────────────────────

export const TestNotificationRequestSchema = z.object({
  eventType: NotificationEventType,
  recipientPhone: z.string().regex(/^01[016789]\d{7,8}$/),
});
export type TestNotificationRequest = z.infer<typeof TestNotificationRequestSchema>;

// ── 알림 로그 필터 ──────────────────────────────

export const NotificationLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  eventType: NotificationEventType.optional(),
  status: NotificationLogStatus.optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});
export type NotificationLogQuery = z.infer<typeof NotificationLogQuerySchema>;

// ── 알림 설정 응답 ──────────────────────────────

export const NotificationSettingSchema = z.object({
  id: z.string().uuid(),
  eventType: NotificationEventType,
  isEnabled: z.boolean(),
  sendToMember: z.boolean(),
  sendToOperator: z.boolean(),
  templateCode: z.string().nullable(),
  templateContent: z.string().nullable(),
  timing: z
    .object({
      beforeMinutes: z.number().int().nonnegative().optional(),
    })
    .nullable(),
});
export type NotificationSetting = z.infer<typeof NotificationSettingSchema>;

// ── 인앱 알림 응답 ──────────────────────────────

export const AppNotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  type: z.string(),
  data: z.record(z.unknown()).nullable(),
  isRead: z.boolean(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type AppNotification = z.infer<typeof AppNotificationSchema>;

// ── 알림 로그 응답 ──────────────────────────────

export const NotificationLogSchema = z.object({
  id: z.string().uuid(),
  eventType: NotificationEventType,
  recipientName: z.string(),
  templateCode: z.string().nullable(),
  status: NotificationLogStatus,
  sentAt: z.string().datetime().nullable(),
  failedReason: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type NotificationLog = z.infer<typeof NotificationLogSchema>;
