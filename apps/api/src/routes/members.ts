import { Hono } from 'hono';
import { memberService } from '../services/member-service';
import { requireAuth, requireOperator, requireAdmin, getAuthUser } from '../middleware/auth';
import { success, paginated } from '../lib/response';
import {
  MemberListQuerySchema,
  UpdateMemberRequestSchema,
  SuspendMemberRequestSchema,
} from '../../../../shared/contracts/schemas/member';
import { PaginationRequestSchema } from '../../../../shared/contracts/api-response';
import { parseIdParam } from '../lib/request-helpers';

const membersRoute = new Hono();

// GET /members — 회원 목록
membersRoute.get('/', requireAuth, requireOperator, async (c) => {
  const query = MemberListQuerySchema.parse(c.req.query());
  const { items, total } = await memberService.list(query);
  return paginated(c, items, total, query.page, query.limit);
});

// GET /members/:id — 회원 상세
membersRoute.get('/:id', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const member = await memberService.getById(id);
  return success(c, member);
});

// POST /members/:id/approve — 회원 승인
membersRoute.post('/:id/approve', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await memberService.approve(id, user.userId);
  return success(c, { message: '회원이 승인되었습니다.' });
});

// POST /members/:id/suspend — 회원 정지
membersRoute.post('/:id/suspend', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const body = SuspendMemberRequestSchema.parse(await c.req.json());
  await memberService.suspend(id, user.userId, body.reason);
  return success(c, { message: '회원이 정지되었습니다.' });
});

// POST /members/:id/unsuspend — 정지 해제
membersRoute.post('/:id/unsuspend', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await memberService.unsuspend(id, user.userId);
  return success(c, { message: '정지가 해제되었습니다.' });
});

// PATCH /members/:id — 회원 정보 수정
membersRoute.patch('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const body = UpdateMemberRequestSchema.parse(await c.req.json());
  const updated = await memberService.update(id, body, user.userId);
  return success(c, updated);
});

// GET /members/:id/history — 예약/방송 이력
membersRoute.get('/:id/history', requireAuth, requireOperator, async (c) => {
  const id = parseIdParam(c);
  const { page, limit } = PaginationRequestSchema.parse(c.req.query());
  const { items, total } = await memberService.getHistory(id, page, limit);
  return paginated(c, items, total, page, limit);
});

export default membersRoute;
