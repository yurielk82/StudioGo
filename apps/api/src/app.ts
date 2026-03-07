import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './routes/auth';
import reservationsRoutes from './routes/reservations';
import slotsRoutes from './routes/slots';
import cronRoutes from './routes/cron';
import notificationsRoutes from './routes/notifications';

const app = new Hono();

// 글로벌 에러 핸들러 + 미들웨어
app.onError(errorHandler);
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
      version: '0.9.1',
      status: 'healthy',
    },
  });
});

// 라우트 등록
app.route('/auth', authRoutes);
app.route('/reservations', reservationsRoutes);
app.route('/slots', slotsRoutes);
app.route('/cron', cronRoutes);
app.route('/notifications', notificationsRoutes);

export default app;
