import type { MiddlewareHandler } from 'hono';

/** 프로덕션용 구조화 JSON 요청 로거 */
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // 프로덕션: JSON, 개발: 간결한 텍스트
  if (process.env.NODE_ENV === 'production') {
    console.log(
      JSON.stringify({
        level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
        type: 'REQUEST',
        method,
        path,
        status,
        durationMs: duration,
        ip: c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
        userAgent: c.req.header('user-agent')?.substring(0, 100),
      }),
    );
  } else {
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}${method}\x1b[0m ${path} ${status} ${duration}ms`);
  }
};
