import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './routes/auth';
import reservationsRoutes from './routes/reservations';
import slotsRoutes from './routes/slots';
import cronRoutes from './routes/cron';

const app = new Hono();

// 글로벌 미들웨어
app.use('*', errorHandler);
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

// 라우트 등록
app.route('/auth', authRoutes);
app.route('/reservations', reservationsRoutes);
app.route('/slots', slotsRoutes);
app.route('/cron', cronRoutes);

// 개발 서버
const port = Number(process.env.PORT) ?? 3001;

serve({
  fetch: app.fetch,
  port,
});

console.warn(`StudioGo API 서버 실행 중: http://localhost:${port}`);

export default app;
