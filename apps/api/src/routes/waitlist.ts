import { Hono } from 'hono';
import { waitlistService } from '../services/waitlist-service';
import { requireAuth, requireApproved, getAuthUser } from '../middleware/auth';
import { success, created, noContent } from '../lib/response';
import { CreateWaitlistRequestSchema } from '../../../../shared/contracts/schemas/waitlist';
import { IdParamSchema } from '../../../../shared/contracts/api-response';

const waitlistRoute = new Hono();

// POST /waitlist — 대기 등록
waitlistRoute.post('/', requireAuth, requireApproved, async (c) => {
  const user = getAuthUser(c);
  const body = CreateWaitlistRequestSchema.parse(await c.req.json());
  const entry = await waitlistService.create(user.userId, body);
  return created(c, entry);
});

// DELETE /waitlist/:id — 대기 취소
waitlistRoute.delete('/:id', requireAuth, async (c) => {
  const { id } = IdParamSchema.parse({ id: c.req.param('id') });
  const user = getAuthUser(c);
  await waitlistService.cancel(id, user.userId);
  return noContent(c);
});

// GET /waitlist/my — 내 대기 목록
waitlistRoute.get('/my', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const list = await waitlistService.getMyWaitlist(user.userId);
  return success(c, list);
});

export default waitlistRoute;
