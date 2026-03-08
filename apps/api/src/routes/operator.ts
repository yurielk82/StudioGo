import { Hono } from 'hono';
import { operatorService } from '../services/operator-service';
import { requireAuth, requireOperator, getAuthUser } from '../middleware/auth';
import { success, created, paginated } from '../lib/response';
import {
  CheckinRequestSchema,
  UpdateFulfillmentRequestSchema,
  FulfillmentListQuerySchema,
} from '../../../../shared/contracts/schemas/operator';
import { parseIdParam } from '../lib/request-helpers';

const operatorRoute = new Hono();

// GET /operator/dashboard — 대시보드 데이터
operatorRoute.get('/dashboard', requireAuth, requireOperator, async (c) => {
  const dashboard = await operatorService.getDashboard();
  return success(c, dashboard);
});

// POST /operator/checkin — 체크인 처리
operatorRoute.post('/checkin', requireAuth, requireOperator, async (c) => {
  const user = getAuthUser(c);
  const body = CheckinRequestSchema.parse(await c.req.json());
  const result = await operatorService.checkin(body, user.userId);
  return created(c, result);
});

// POST /operator/checkout/:id — 체크아웃
operatorRoute.post('/checkout/:id', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await operatorService.checkout(id, user.userId);
  return success(c, { message: '체크아웃이 완료되었습니다.' });
});

// GET /operator/fulfillment — 포장 작업 목록
operatorRoute.get('/fulfillment', requireAuth, requireOperator, async (c) => {
  const query = FulfillmentListQuerySchema.parse(c.req.query());
  const { items, total } = await operatorService.getFulfillments(query);
  return paginated(c, items, total, query.page, query.limit);
});

// PATCH /operator/fulfillment/:id — 포장 상태 변경
operatorRoute.patch('/fulfillment/:id', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const body = UpdateFulfillmentRequestSchema.parse(await c.req.json());
  const updated = await operatorService.updateFulfillment(id, body, user.userId);
  return success(c, updated);
});

// GET /operator/stats — 운영 통계
operatorRoute.get('/stats', requireAuth, requireOperator, async (c) => {
  const stats = await operatorService.getStats();
  return success(c, stats);
});

export default operatorRoute;
