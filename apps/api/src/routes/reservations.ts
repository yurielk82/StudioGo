import { Hono } from 'hono';
import { reservationService } from '../services/reservation-service';
import { requireAuth, requireApproved, requireOperator, getAuthUser } from '../middleware/auth';
import { success, created } from '../lib/response';
import {
  CreateReservationRequestSchema,
  CancelReservationRequestSchema,
  RejectReservationRequestSchema,
  BatchApproveRequestSchema,
} from '../../../../shared/contracts/schemas/reservation';
import { IdParamSchema } from '../../../../shared/contracts/api-response';

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

export default reservationsRoute;
