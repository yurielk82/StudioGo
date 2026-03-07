import { Hono } from 'hono';
import { reservationService } from '../services/reservation-service';
import { requireAuth, requireApproved, requireOperator, getAuthUser } from '../middleware/auth';
import { success, created, paginated } from '../lib/response';
import {
  CreateReservationRequestSchema,
  CancelReservationRequestSchema,
  RejectReservationRequestSchema,
  BatchApproveRequestSchema,
  ReservationListQuerySchema,
  CompleteReservationRequestSchema,
} from '../../../../shared/contracts/schemas/reservation';
import { IdParamSchema, PaginationRequestSchema } from '../../../../shared/contracts/api-response';

const reservationsRoute = new Hono();

// POST /reservations — 예약 생성
reservationsRoute.post('/', requireAuth, requireApproved, async (c) => {
  const user = getAuthUser(c);
  const body = CreateReservationRequestSchema.parse(await c.req.json());
  const reservation = await reservationService.create(user.userId, body);
  return created(c, reservation);
});

// POST /reservations/:id/cancel — 예약 취소
reservationsRoute.post('/:id/cancel', requireAuth, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const user = getAuthUser(c);
  const body = CancelReservationRequestSchema.parse(await c.req.json());
  const isOp = user.role === 'OPERATOR' || user.role === 'ADMIN';

  await reservationService.cancel(id, user.userId, body.reason, isOp);
  return success(c, { message: '예약이 취소되었습니다.' });
});

// POST /reservations/:id/approve — 예약 승인
reservationsRoute.post('/:id/approve', requireAuth, requireOperator, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const user = getAuthUser(c);

  await reservationService.approve(id, user.userId);
  return success(c, { message: '예약이 승인되었습니다.' });
});

// POST /reservations/:id/reject — 예약 거절
reservationsRoute.post('/:id/reject', requireAuth, requireOperator, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const user = getAuthUser(c);
  const body = RejectReservationRequestSchema.parse(await c.req.json());

  await reservationService.reject(id, user.userId, body.reason);
  return success(c, { message: '예약이 거절되었습니다.' });
});

// POST /reservations/batch-approve — 일괄 승인
reservationsRoute.post('/batch-approve', requireAuth, requireOperator, async (c) => {
  const user = getAuthUser(c);
  const body = BatchApproveRequestSchema.parse(await c.req.json());

  const results = await Promise.allSettled(
    body.reservationIds.map((id) => reservationService.approve(id, user.userId)),
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return success(c, { succeeded, failed, total: body.reservationIds.length });
});

// GET /reservations — 예약 목록 (필터)
reservationsRoute.get('/', requireAuth, async (c) => {
  const query = ReservationListQuerySchema.parse(c.req.query());
  const { items, total } = await reservationService.list(query);
  return paginated(c, items, total, query.page, query.limit);
});

// GET /reservations/my — 내 예약 목록
reservationsRoute.get('/my', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const { page, limit } = PaginationRequestSchema.parse(c.req.query());
  const { items, total } = await reservationService.getMyReservations(user.userId, page, limit);
  return paginated(c, items, total, page, limit);
});

// GET /reservations/my/stats — 내 통계
reservationsRoute.get('/my/stats', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const stats = await reservationService.getMyStats(user.userId);
  return success(c, stats);
});

// GET /reservations/:id — 예약 상세
reservationsRoute.get('/:id', requireAuth, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const reservation = await reservationService.getById(id);
  return success(c, reservation);
});

// POST /reservations/:id/complete — 방송 완료
reservationsRoute.post('/:id/complete', requireAuth, requireOperator, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const user = getAuthUser(c);
  const body = CompleteReservationRequestSchema.parse(await c.req.json());

  await reservationService.complete(id, user.userId, body);
  return success(c, { message: '방송 완료 처리되었습니다.' });
});

// POST /reservations/:id/no-show — 노쇼 처리
reservationsRoute.post('/:id/no-show', requireAuth, requireOperator, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const user = getAuthUser(c);

  await reservationService.noShow(id, user.userId);
  return success(c, { message: '노쇼 처리되었습니다.' });
});

export default reservationsRoute;
