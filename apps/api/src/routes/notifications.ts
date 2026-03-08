import { Hono } from 'hono';
import { requireAuth, requireOperator, requireAdmin, getAuthUser } from '../middleware/auth';
import { notificationRepository } from '../repositories/notification-repository';
import { success, paginated } from '../lib/response';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../../../shared/db/index';
import { notificationSettings, notificationLogs, users } from '../../../../shared/db/schema';
import {
  UpdateNotificationSettingRequestSchema,
  TestNotificationRequestSchema,
  NotificationLogQuerySchema,
} from '../../../../shared/contracts/schemas/notification';
import { PaginationRequestSchema } from '../../../../shared/contracts/api-response';
import { parseIdParam } from '../lib/request-helpers';
import { sendAlimtalk } from '../lib/kakao-bizmessage';

const notificationsRoute = new Hono();

// GET /notifications — 내 인앱 알림 목록
notificationsRoute.get('/', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const { page, limit } = PaginationRequestSchema.parse(c.req.query());

  const result = await notificationRepository.getAppNotifications(user.userId, page, limit);
  return success(c, {
    items: result.items,
    meta: { total: result.total, page, limit },
  });
});

// POST /notifications/:id/read — 읽음 처리
notificationsRoute.post('/:id/read', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const id = parseIdParam(c);
  await notificationRepository.markAsRead(id, user.userId);
  return success(c, { message: '읽음 처리 완료' });
});

// POST /notifications/read-all — 전체 읽음 처리
notificationsRoute.post('/read-all', requireAuth, async (c) => {
  const user = getAuthUser(c);
  await notificationRepository.markAllAsRead(user.userId);
  return success(c, { message: '전체 읽음 처리 완료' });
});

// GET /notifications/settings — 알림 설정 조회 (ADMIN)
notificationsRoute.get('/settings', requireAuth, requireAdmin, async (c) => {
  const settings = await db
    .select()
    .from(notificationSettings)
    .orderBy(notificationSettings.eventType);
  return success(c, settings);
});

// PATCH /notifications/settings/:eventType — 알림 설정 수정 (ADMIN)
notificationsRoute.patch('/settings/:eventType', requireAuth, requireAdmin, async (c) => {
  const eventType = c.req.param('eventType');
  const body = UpdateNotificationSettingRequestSchema.parse(await c.req.json());

  await db
    .update(notificationSettings)
    .set({ ...body, updatedAt: new Date() })
    .where(
      eq(
        notificationSettings.eventType,
        eventType as (typeof notificationSettings.eventType.enumValues)[number],
      ),
    );

  return success(c, { message: '알림 설정이 수정되었습니다.' });
});

// POST /notifications/test — 테스트 발송 (ADMIN)
notificationsRoute.post('/test', requireAuth, requireAdmin, async (c) => {
  const body = TestNotificationRequestSchema.parse(await c.req.json());

  const result = await sendAlimtalk({
    phoneNumber: body.recipientPhone,
    templateCode: 'TEST',
    variables: { eventType: body.eventType },
  });

  return success(c, { sent: result.success, messageId: result.messageId });
});

// GET /notifications/logs — 발송 이력 (OPERATOR+)
notificationsRoute.get('/logs', requireAuth, requireOperator, async (c) => {
  const query = NotificationLogQuerySchema.parse(c.req.query());
  const { page, limit, eventType, status, startDate, endDate } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (eventType) conditions.push(eq(notificationLogs.eventType, eventType));
  if (status) conditions.push(eq(notificationLogs.status, status));
  if (startDate) conditions.push(sql`${notificationLogs.createdAt} >= ${startDate}::date`);
  if (endDate)
    conditions.push(sql`${notificationLogs.createdAt} < (${endDate}::date + interval '1 day')`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: notificationLogs.id,
        eventType: notificationLogs.eventType,
        recipientName: users.name,
        templateCode: notificationLogs.templateCode,
        status: notificationLogs.status,
        sentAt: notificationLogs.sentAt,
        failedReason: notificationLogs.failedReason,
        createdAt: notificationLogs.createdAt,
      })
      .from(notificationLogs)
      .leftJoin(users, eq(notificationLogs.recipientId, users.id))
      .where(where)
      .orderBy(desc(notificationLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationLogs)
      .where(where),
  ]);

  return paginated(c, items, countResult[0]?.count ?? 0, page, limit);
});

export default notificationsRoute;
