import type { MiddlewareHandler } from 'hono';

/**
 * API 응답 캐시 헤더 — 엔드포인트 패턴별 캐시 정책
 *
 * - 정적 데이터 (스튜디오 목록, 서비스 목록): 5분 캐시 + stale-while-revalidate
 * - 동적 데이터 (예약, 슬롯): no-cache (항상 최신)
 * - Cron/인증: no-store
 */
export function cacheControl(): MiddlewareHandler {
  const CACHEABLE_GET_PATTERNS = [
    /^\/api\/studios$/,
    /^\/api\/services$/,
    /^\/api\/admin\/settings$/,
    /^\/api\/admin\/tiers$/,
    /^\/api\/admin\/announcements$/,
  ];

  const NO_STORE_PATTERNS = [/^\/api\/auth\//, /^\/api\/cron\//];

  return async (c, next) => {
    await next();

    if (c.req.method !== 'GET') return;

    const path = c.req.path;

    if (NO_STORE_PATTERNS.some((p) => p.test(path))) {
      c.header('Cache-Control', 'no-store');
      return;
    }

    if (CACHEABLE_GET_PATTERNS.some((p) => p.test(path))) {
      c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      return;
    }

    // 기본: 프라이빗, 재검증 필수
    c.header('Cache-Control', 'private, no-cache');
  };
}
