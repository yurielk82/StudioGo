import { Hono } from 'hono';
import { z } from 'zod';
import { adminService } from '../services/admin-service';
import { requireAuth, requireAdmin, getAuthUser } from '../middleware/auth';
import { success, created, noContent, paginated } from '../lib/response';
import {
  UpdateSettingRequestSchema,
  CreateBlackoutRequestSchema,
  UpdateTierConfigRequestSchema,
  CreateServiceRequestSchema,
  UpdateServiceRequestSchema,
  CreateAnnouncementRequestSchema,
  UpdateAnnouncementRequestSchema,
  UpdateFeatureFlagRequestSchema,
  SystemLogQuerySchema,
  UpdatePermissionsRequestSchema,
} from '../../../../shared/contracts/schemas/admin';
import { parseIdParam } from '../lib/request-helpers';

const adminRoute = new Hono();

// 모든 Admin 라우트에 인증 + 관리자 권한 필수
adminRoute.use('*', requireAuth, requireAdmin);

// ── 운영 설정 ──────────────────────────────────

// GET /admin/settings — 운영 설정 조회
adminRoute.get('/settings', async (c) => {
  const settings = await adminService.getSettings();
  return success(c, settings);
});

// PATCH /admin/settings/:key — 운영 설정 수정
adminRoute.patch('/settings/:key', async (c) => {
  const key = z.string().min(1).parse(c.req.param('key'));
  const user = getAuthUser(c);
  const body = UpdateSettingRequestSchema.parse(await c.req.json());
  await adminService.updateSetting(key, body.value, user.userId);
  return success(c, { message: '설정이 수정되었습니다.' });
});

// ── Blackout ──────────────────────────────────

// GET /admin/blackouts — blackout 목록
adminRoute.get('/blackouts', async (c) => {
  const blackouts = await adminService.getBlackouts();
  return success(c, blackouts);
});

// POST /admin/blackouts — blackout 생성
adminRoute.post('/blackouts', async (c) => {
  const user = getAuthUser(c);
  const body = CreateBlackoutRequestSchema.parse(await c.req.json());
  const blackout = await adminService.createBlackout(body, user.userId);
  return created(c, blackout);
});

// DELETE /admin/blackouts/:id — blackout 삭제
adminRoute.delete('/blackouts/:id', async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await adminService.deleteBlackout(id, user.userId);
  return noContent(c);
});

// ── 티어 ──────────────────────────────────────

// GET /admin/tiers/config — 티어 설정 조회
adminRoute.get('/tiers/config', async (c) => {
  const config = await adminService.getTierConfig();
  return success(c, config);
});

// PATCH /admin/tiers/config — 티어 설정 수정
adminRoute.patch('/tiers/config', async (c) => {
  const user = getAuthUser(c);
  const body = UpdateTierConfigRequestSchema.parse(await c.req.json());
  await adminService.updateTierConfig(body, user.userId);
  return success(c, { message: '티어 설정이 수정되었습니다.' });
});

// POST /admin/tiers/recalculate — 전체 재계산
adminRoute.post('/tiers/recalculate', async (c) => {
  const user = getAuthUser(c);
  const result = await adminService.recalculateTiers(user.userId);
  return success(c, result);
});

// ── 부가서비스 ──────────────────────────────────

// GET /admin/services — 부가서비스 목록
adminRoute.get('/services', async (c) => {
  const services = await adminService.getServices();
  return success(c, services);
});

// POST /admin/services — 부가서비스 생성
adminRoute.post('/services', async (c) => {
  const user = getAuthUser(c);
  const body = CreateServiceRequestSchema.parse(await c.req.json());
  const service = await adminService.createService(body, user.userId);
  return created(c, service);
});

// PATCH /admin/services/:id — 부가서비스 수정
adminRoute.patch('/services/:id', async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const body = UpdateServiceRequestSchema.parse(await c.req.json());
  const service = await adminService.updateService(id, body, user.userId);
  return success(c, service);
});

// DELETE /admin/services/:id — 부가서비스 삭제
adminRoute.delete('/services/:id', async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await adminService.deleteService(id, user.userId);
  return noContent(c);
});

// ── 시스템 로그 ──────────────────────────────────

// GET /admin/logs — 시스템 로그
adminRoute.get('/logs', async (c) => {
  const query = SystemLogQuerySchema.parse(c.req.query());
  const { items, total } = await adminService.getLogs(query);
  return paginated(c, items, total, query.page, query.limit);
});

// ── Feature Flags ──────────────────────────────

// GET /admin/feature-flags — flag 목록
adminRoute.get('/feature-flags', async (c) => {
  const flags = await adminService.getFeatureFlags();
  return success(c, flags);
});

// PATCH /admin/feature-flags/:key — flag 수정
adminRoute.patch('/feature-flags/:key', async (c) => {
  const key = z.string().min(1).parse(c.req.param('key'));
  const user = getAuthUser(c);
  const body = UpdateFeatureFlagRequestSchema.parse(await c.req.json());
  const flag = await adminService.updateFeatureFlag(key, body, user.userId);
  return success(c, flag);
});

// ── 공지사항 ──────────────────────────────────

// GET /admin/announcements — 공지 목록
adminRoute.get('/announcements', async (c) => {
  const announcements = await adminService.getAnnouncements();
  return success(c, announcements);
});

// POST /admin/announcements — 공지 생성
adminRoute.post('/announcements', async (c) => {
  const user = getAuthUser(c);
  const body = CreateAnnouncementRequestSchema.parse(await c.req.json());
  const announcement = await adminService.createAnnouncement(body, user.userId);
  return created(c, announcement);
});

// PATCH /admin/announcements/:id — 공지 수정
adminRoute.patch('/announcements/:id', async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  const body = UpdateAnnouncementRequestSchema.parse(await c.req.json());
  const announcement = await adminService.updateAnnouncement(id, body, user.userId);
  return success(c, announcement);
});

// DELETE /admin/announcements/:id — 공지 삭제
adminRoute.delete('/announcements/:id', async (c) => {
  const id = parseIdParam(c);
  const user = getAuthUser(c);
  await adminService.deleteAnnouncement(id, user.userId);
  return noContent(c);
});

// ── 운영자 권한 ──────────────────────────────────

// GET /admin/permissions — 권한 목록
adminRoute.get('/permissions', async (c) => {
  const permissions = await adminService.getPermissions();
  return success(c, permissions);
});

// PATCH /admin/permissions/:userId — 권한 수정
adminRoute.patch('/permissions/:userId', async (c) => {
  const userId = z.string().uuid().parse(c.req.param('userId'));
  const user = getAuthUser(c);
  const body = UpdatePermissionsRequestSchema.parse(await c.req.json());
  await adminService.updatePermissions(userId, body, user.userId);
  return success(c, { message: '권한이 수정되었습니다.' });
});

export default adminRoute;
