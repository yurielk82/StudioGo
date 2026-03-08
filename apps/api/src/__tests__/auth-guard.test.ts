import { describe, it, expect } from 'vitest';
import app from '../app';

describe('인증 가드 — 토큰 없이 요청 시 401 반환', () => {
  it('GET /api/slots — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/slots');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/studios — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/studios');
    expect(res.status).toBe(401);
  });

  it('GET /api/members — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/members');
    expect(res.status).toBe(401);
  });

  it('GET /api/calendar/monthly?year=2026&month=3 — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/calendar/monthly?year=2026&month=3');
    expect(res.status).toBe(401);
  });

  it('GET /api/services — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/services');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/settings — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/admin/settings');
    expect(res.status).toBe(401);
  });

  it('GET /api/operator/dashboard — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/operator/dashboard');
    expect(res.status).toBe(401);
  });

  it('POST /api/operator/checkin — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/operator/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/waitlist — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/assets/upload-url — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/assets/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});

describe('Cron 가드 — 시크릿 없이 요청 시 403 반환', () => {
  it('GET /api/cron/expire-holds — Authorization 헤더 없이 요청 시 403', async () => {
    const res = await app.request('/api/cron/expire-holds');
    expect(res.status).toBe(403);
  });
});
