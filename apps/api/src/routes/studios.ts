import { Hono } from 'hono';
import { studioService } from '../services/studio-service';
import { requireAuth, requireAdmin, getAuthUser } from '../middleware/auth';
import { success, created, noContent } from '../lib/response';
import {
  CreateStudioRequestSchema,
  UpdateStudioRequestSchema,
} from '../../../../shared/contracts/schemas/studio';
import { parseIdParam } from '../lib/request-helpers';

const studiosRoute = new Hono();

// GET /studios — 스튜디오 목록
studiosRoute.get('/', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const isAdmin = user.role === 'ADMIN';
  const studios = await studioService.list(isAdmin);
  return success(c, studios);
});

// GET /studios/:id — 스튜디오 상세
studiosRoute.get('/:id', requireAuth, async (c) => {
  const id = parseIdParam(c);
  const studio = await studioService.getById(id);
  return success(c, studio);
});

// POST /studios — 스튜디오 생성
studiosRoute.post('/', requireAuth, requireAdmin, async (c) => {
  const user = getAuthUser(c);
  const body = CreateStudioRequestSchema.parse(await c.req.json());
  const studio = await studioService.create(body, user.userId);
  return created(c, studio);
});

// PATCH /studios/:id — 스튜디오 수정
studiosRoute.patch('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const body = UpdateStudioRequestSchema.parse(await c.req.json());
  const studio = await studioService.update(id, body, user.userId);
  return success(c, studio);
});

// DELETE /studios/:id — 스튜디오 삭제
studiosRoute.delete('/:id', requireAuth, requireAdmin, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await studioService.delete(id, user.userId);
  return noContent(c);
});

// PATCH /studios/:id/toggle — 활성화 토글
studiosRoute.patch('/:id/toggle', requireAuth, requireAdmin, async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const studio = await studioService.toggleActive(id, user.userId);
  return success(c, studio);
});

export default studiosRoute;
