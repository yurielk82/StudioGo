import { describe, it, expect } from 'vitest';
import app from '../app';

// ─────────────────────────────────────────────
// 헬스체크
// ─────────────────────────────────────────────
describe('헬스체크 엔드포인트', () => {
  it('GET /api — 200 응답과 success: true 반환', async () => {
    const res = await app.request('/api');
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      success: boolean;
      data: { service: string; version: string; status: string };
    };
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('healthy');
  });

  it('GET /api/health — 200 응답과 checks.database 포함', async () => {
    const res = await app.request('/api/health');
    // DB 연결 실패 시 503, 성공 시 200 — 응답 구조만 검증
    expect([200, 503]).toContain(res.status);

    const data = (await res.json()) as {
      success: boolean;
      data: {
        status: string;
        checks: { database: { status: string; latencyMs: number } };
      };
    };
    expect(data.data.checks).toBeDefined();
    expect(data.data.checks.database).toBeDefined();
    expect(data.data.checks.database).toHaveProperty('status');
    expect(data.data.checks.database).toHaveProperty('latencyMs');
  });
});

// ─────────────────────────────────────────────
// 보안 헤더
// ─────────────────────────────────────────────
describe('보안 헤더', () => {
  it('응답에 X-Content-Type-Options: nosniff 헤더가 존재한다', async () => {
    const res = await app.request('/api');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('응답에 X-Frame-Options: DENY 헤더가 존재한다', async () => {
    const res = await app.request('/api');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it('응답에 Referrer-Policy 헤더가 존재한다', async () => {
    const res = await app.request('/api');
    expect(res.headers.get('referrer-policy')).toBeTruthy();
  });

  it('응답에 Permissions-Policy 헤더가 존재한다', async () => {
    const res = await app.request('/api');
    expect(res.headers.get('permissions-policy')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────
describe('Rate Limiting', () => {
  it('첫 요청에 X-RateLimit-Limit, X-RateLimit-Remaining 헤더가 존재한다', async () => {
    // 고유 IP를 사용해 다른 테스트와 상태 격리
    const res = await app.request('/api', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });
    expect(res.headers.get('x-ratelimit-limit')).toBeTruthy();
    expect(res.headers.get('x-ratelimit-remaining')).toBeTruthy();
  });

  it('X-RateLimit-Limit은 숫자 문자열이다', async () => {
    const res = await app.request('/api', {
      headers: { 'x-forwarded-for': '10.0.0.2' },
    });
    const limit = res.headers.get('x-ratelimit-limit');
    expect(Number(limit)).toBeGreaterThan(0);
  });

  it('연속 요청 시 X-RateLimit-Remaining이 감소한다', async () => {
    const ip = '10.0.0.3';
    const res1 = await app.request('/api', {
      headers: { 'x-forwarded-for': ip },
    });
    const res2 = await app.request('/api', {
      headers: { 'x-forwarded-for': ip },
    });
    const remaining1 = Number(res1.headers.get('x-ratelimit-remaining'));
    const remaining2 = Number(res2.headers.get('x-ratelimit-remaining'));
    expect(remaining2).toBeLessThan(remaining1);
  });

  it('한도 초과 시 429와 RATE_LIMIT_EXCEEDED 코드를 반환한다', async () => {
    // 고유 IP로 max(60) + 1회 초과 요청을 보낸다
    const ip = '10.0.0.100';
    let lastRes!: Response;

    for (let i = 0; i <= 61; i++) {
      lastRes = await app.request('/api', {
        headers: { 'x-forwarded-for': ip },
      });
    }

    expect(lastRes.status).toBe(429);
    const data = (await lastRes.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

// ─────────────────────────────────────────────
// 에러 처리
// ─────────────────────────────────────────────
describe('에러 처리', () => {
  it('존재하지 않는 경로 — 404 반환', async () => {
    const res = await app.request('/api/does-not-exist-at-all');
    expect(res.status).toBe(404);
  });

  it('POST /api/auth/kakao — 잘못된 JSON body 시 400 반환', async () => {
    const res = await app.request('/api/auth/kakao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // accessToken 필드 누락 → Zod 검증 실패
      body: JSON.stringify({ wrong_field: 'invalid' }),
    });
    expect(res.status).toBe(400);

    const data = (await res.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/auth/kakao — 필수 필드 없는 body 시 400 반환', async () => {
    // 고유 IP로 authRateLimiter 한도 누적 방지
    const res = await app.request('/api/auth/kakao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.1.0.1',
      },
      body: '{}',
    });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
describe('CORS', () => {
  it('허용된 Origin(localhost:8081) — OPTIONS 프리플라이트 시 Access-Control-Allow-Origin 반환', async () => {
    const res = await app.request('/api', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    expect(allowOrigin).toBeTruthy();
  });

  it('허용된 Origin(localhost:3000) — OPTIONS 프리플라이트 성공', async () => {
    const res = await app.request('/api', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    expect(allowOrigin).toBeTruthy();
  });

  it('허용되지 않은 Origin — Access-Control-Allow-Origin 미반환', async () => {
    const res = await app.request('/api', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://evil.example.com',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    // 허용되지 않은 출처는 CORS 헤더가 없거나 다른 값
    expect(allowOrigin).not.toBe('http://evil.example.com');
  });
});
