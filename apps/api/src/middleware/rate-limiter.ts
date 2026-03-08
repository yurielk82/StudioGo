import type { MiddlewareHandler } from 'hono';

interface RateLimitConfig {
  /** 윈도우 크기 (밀리초) */
  windowMs: number;
  /** 윈도우 당 최대 요청 수 */
  max: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1분
  max: 60, // 분당 60회
};

// 인메모리 저장소 (IP 기반)
const store = new Map<string, { count: number; resetAt: number }>();

// 만료된 엔트리 주기적 정리
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.resetAt <= now) store.delete(key);
  }
}, 60_000);

export function rateLimiter(config: Partial<RateLimitConfig> = {}): MiddlewareHandler {
  const { windowMs, max } = { ...DEFAULT_CONFIG, ...config };

  return async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      'unknown';
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || entry.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', String(max - 1));
      return next();
    }

    entry.count++;
    const remaining = Math.max(0, max - entry.count);
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          },
        },
        429,
      );
    }

    return next();
  };
}

/** 인증 관련 엔드포인트용 — 더 엄격한 제한 */
export const authRateLimiter = rateLimiter({ windowMs: 60_000, max: 10 });
