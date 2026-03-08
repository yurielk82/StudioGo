import { serve } from '@hono/node-server';
import app from './app';

// 처리되지 않은 에러 로깅
process.on('unhandledRejection', (reason) => {
  console.error(
    JSON.stringify({
      level: 'fatal',
      type: 'UNHANDLED_REJECTION',
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      timestamp: new Date().toISOString(),
    }),
  );
});

process.on('uncaughtException', (error) => {
  console.error(
    JSON.stringify({
      level: 'fatal',
      type: 'UNCAUGHT_EXCEPTION',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }),
  );
  // 프로세스 종료 (상태가 불확실하므로)
  process.exit(1);
});

const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
});

console.warn(`StudioGo API 서버 실행 중: http://localhost:${port}`);
