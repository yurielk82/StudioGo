import { handle } from '@hono/node-server/vercel';
import { Hono } from 'hono';

// 최소 Hono 앱 — 라우트/미들웨어 없이 어댑터 동작만 검증
const app = new Hono();
app.get('/', (c) =>
  c.json({ success: true, data: { service: 'StudioGo API', status: 'healthy' } }),
);
app.get('/*', (c) => c.json({ success: true, data: { path: c.req.path, method: c.req.method } }));

export default handle(app);
