import { handle } from '@hono/node-server/vercel';
import { Hono } from 'hono';

// 디버그: esbuild 번들 여부를 응답으로 확인
const BUNDLE_SOURCE = 'ESBUILD_CJS_BUNDLE';

const app = new Hono();
app.get('/', (c) =>
  c.json({ success: true, bundle: BUNDLE_SOURCE, data: { service: 'StudioGo API' } }),
);
app.get('/*', (c) => c.json({ success: true, bundle: BUNDLE_SOURCE, path: c.req.path }));

export default handle(app);
