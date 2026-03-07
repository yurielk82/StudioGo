import { Hono } from 'hono';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { notificationRepository } from '../repositories/notification-repository';
import { success } from '../lib/response';

const notificationsRoute = new Hono();

// GET /notifications — 내 인앱 알림 목록
notificationsRoute.get('/', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const page = Number(c.req.query('page') ?? '1');
  const limit = Number(c.req.query('limit') ?? '20');

  const result = await notificationRepository.getAppNotifications(user.userId, page, limit);
  return success(c, {
    items: result.items,
    meta: { total: result.total, page, limit },
  });
});

// POST /notifications/:id/read — 읽음 처리
notificationsRoute.post('/:id/read', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const id = c.req.param('id') ?? '';
  await notificationRepository.markAsRead(id, user.userId);
  return success(c, { message: '읽음 처리 완료' });
});

// POST /notifications/read-all — 전체 읽음 처리
notificationsRoute.post('/read-all', requireAuth, async (c) => {
  const user = getAuthUser(c);
  await notificationRepository.markAllAsRead(user.userId);
  return success(c, { message: '전체 읽음 처리 완료' });
});

export default notificationsRoute;
