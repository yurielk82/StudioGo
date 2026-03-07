import { Hono } from 'hono';
import { assetService } from '../services/asset-service';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { success } from '../lib/response';
import { z } from 'zod';

const UploadUrlRequestSchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().min(1).max(255),
});

const ConfirmUploadRequestSchema = z.object({
  key: z.string().min(1),
});

const assetsRoute = new Hono();

// POST /assets/upload-url — 업로드 URL 발급
assetsRoute.post('/upload-url', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const body = UploadUrlRequestSchema.parse(await c.req.json());
  const result = await assetService.getUploadUrl(user.userId, body.contentType, body.fileName);
  return success(c, result);
});

// POST /assets/confirm — 업로드 확인
assetsRoute.post('/confirm', requireAuth, async (c) => {
  const user = getAuthUser(c);
  const body = ConfirmUploadRequestSchema.parse(await c.req.json());
  const result = await assetService.confirmUpload(user.userId, body.key);
  return success(c, result);
});

export default assetsRoute;
