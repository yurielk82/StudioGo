import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

const app = new Hono();

// 미들웨어
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [process.env.APP_URL ?? 'http://localhost:8081'],
    credentials: true,
  }),
);

// 헬스체크
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      service: 'StudioGo API',
      version: '0.1.0',
      status: 'healthy',
    },
  });
});

// 라우트 등록은 Phase 5에서 추가
// app.route('/auth', authRoutes);
// app.route('/reservations', reservationRoutes);
// ...

// 개발 서버
const port = Number(process.env.PORT) ?? 3001;

serve({
  fetch: app.fetch,
  port,
});

console.warn(`StudioGo API 서버 실행 중: http://localhost:${port}`);

export default app;
