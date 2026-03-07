import { describe, it, expect } from 'vitest';
import app from '../app';

describe('API 헬스체크', () => {
  it('GET / — 정상 응답', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      success: boolean;
      data: { service: string; status: string };
    };
    expect(data.success).toBe(true);
    expect(data.data.service).toBe('StudioGo API');
    expect(data.data.status).toBe('healthy');
  });
});

describe('인증 라우트 — 비인증 요청 거부', () => {
  it('GET /auth/me — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/auth/me');
    expect(res.status).toBe(401);

    const data = (await res.json()) as { success: boolean; error: { code: string } };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('AUTH_INVALID_TOKEN');
  });

  it('POST /auth/logout — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/auth/logout', { method: 'POST' });
    expect(res.status).toBe(401);
  });

  it('POST /auth/signup — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('예약 라우트', () => {
  it('POST /reservations — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});

describe('CORS', () => {
  it('OPTIONS 프리플라이트 응답', async () => {
    const res = await app.request('/', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    expect(allowOrigin).toBeTruthy();
  });
});
