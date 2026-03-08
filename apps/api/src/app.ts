import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { rateLimiter, authRateLimiter } from './middleware/rate-limiter';
import { securityHeaders } from './middleware/security-headers';
import authRoutes from './routes/auth';
import reservationsRoutes from './routes/reservations';
import slotsRoutes from './routes/slots';
import cronRoutes from './routes/cron';
import notificationsRoutes from './routes/notifications';
import studiosRoutes from './routes/studios';
import membersRoutes from './routes/members';
import adminRoutes from './routes/admin';
import operatorRoutes from './routes/operator';
import calendarRoutes from './routes/calendar';
import waitlistRoutes from './routes/waitlist';
import assetsRoutes from './routes/assets';
import servicesRoutes from './routes/services';
import { sql } from 'drizzle-orm';
import { APP_NAME, API_VERSION } from '../../../shared/constants';
import { db } from '../../../shared/db/index';
import { env } from './lib/env';

const CORS_ORIGINS =
  env.NODE_ENV === 'production'
    ? [env.APP_URL]
    : ['http://localhost:8081', 'http://localhost:3000'];

const app = new Hono().basePath('/api');

// 글로벌 에러 핸들러 + 미들웨어
app.onError(errorHandler);
app.use('*', requestLogger);
app.use(
  '*',
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  }),
);
app.use('*', securityHeaders);
app.use('*', rateLimiter());
app.use('/auth/*', authRateLimiter);

// 헬스체크
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      service: `${APP_NAME} API`,
      version: API_VERSION,
      status: 'healthy',
    },
  });
});

// 상세 헬스체크 (모니터링 도구용)
app.get('/health', async (c) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbStatus = 'unhealthy';
  }

  const status = dbStatus === 'healthy' ? 'healthy' : 'degraded';
  const statusCode = status === 'healthy' ? 200 : 503;

  return c.json(
    {
      success: status === 'healthy',
      data: {
        service: `${APP_NAME} API`,
        version: API_VERSION,
        status,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: dbStatus, latencyMs: dbLatencyMs },
        },
      },
    },
    statusCode,
  );
});

// 라우트 등록
app.route('/auth', authRoutes);
app.route('/reservations', reservationsRoutes);
app.route('/slots', slotsRoutes);
app.route('/cron', cronRoutes);
app.route('/notifications', notificationsRoutes);
app.route('/studios', studiosRoutes);
app.route('/members', membersRoutes);
app.route('/admin', adminRoutes);
app.route('/operator', operatorRoutes);
app.route('/calendar', calendarRoutes);
app.route('/waitlist', waitlistRoutes);
app.route('/assets', assetsRoutes);
app.route('/services', servicesRoutes);

export default app;
