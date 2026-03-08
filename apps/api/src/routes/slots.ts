import { Hono } from 'hono';
import { z } from 'zod';
import { slotService } from '../services/slot-service';
import { requireAuth, requireApproved, requireAdmin, getAuthUser } from '../middleware/auth';
import { success, created } from '../lib/response';
import {
  SlotListQuerySchema,
  CreateHoldRequestSchema,
  GenerateSlotsRequestSchema,
} from '../../../../shared/contracts/schemas/slot';

const slotsRoute = new Hono();

// GET /slots — 슬롯 조회
slotsRoute.get('/', requireAuth, async (c) => {
  const query = SlotListQuerySchema.parse(c.req.query());
  const slots = await slotService.getSlots(query.date, query.studioId);
  return success(c, slots);
});

// POST /slots/hold — hold 생성
slotsRoute.post('/hold', requireAuth, requireApproved, async (c) => {
  const user = getAuthUser(c);
  const body = CreateHoldRequestSchema.parse(await c.req.json());
  const hold = await slotService.createHold(body.timeSlotId, user.userId);
  return created(c, {
    holdToken: hold.holdToken,
    timeSlotId: hold.timeSlotId,
    expiresAt: hold.expiresAt.toISOString(),
    status: hold.status,
  });
});

// DELETE /slots/hold/:token — hold 해제
slotsRoute.delete('/hold/:token', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const token = z.string().uuid().parse(c.req.param('token'));
  await slotService.cancelHold(token, user.userId);
  return success(c, { message: 'Hold가 해제되었습니다.' });
});

// POST /slots/generate — 슬롯 (재)생성
slotsRoute.post('/generate', requireAuth, requireAdmin, async (c) => {
  const body = GenerateSlotsRequestSchema.parse(await c.req.json());
  const result = await slotService.generateSlots(body.studioId, body.startDate, body.endDate);
  return created(c, result);
});

export default slotsRoute;
