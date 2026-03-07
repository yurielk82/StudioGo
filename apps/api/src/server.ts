import { serve } from '@hono/node-server';
import app from './app';

const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
});

console.warn(`StudioGo API 서버 실행 중: http://localhost:${port}`);
