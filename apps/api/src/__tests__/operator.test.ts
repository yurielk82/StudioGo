/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 서비스 모킹 ──────────────────────────────────
vi.mock('../services/operator-service', () => ({
  operatorService: {
    getDashboard: vi.fn(),
    checkin: vi.fn(),
    checkout: vi.fn(),
    getFulfillments: vi.fn(),
    updateFulfillment: vi.fn(),
    getStats: vi.fn(),
  },
}));

// ── JWT 토큰 헬퍼 ──────────────────────────────────
const JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.JWT_SECRET = JWT_SECRET;

async function makeToken(role: 'ADMIN' | 'OPERATOR' | 'MEMBER' = 'OPERATOR') {
  return new SignJWT({ sub: 'user-operator-001', role, status: 'APPROVED', tier: 'BRONZE' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 테스트 픽스처 ──────────────────────────────────
const MOCK_DASHBOARD = {
  todayReservations: {
    total: 5,
    pending: 2,
    approved: 2,
    inProgress: 1,
    completed: 0,
  },
  pendingApprovals: 2,
  pendingMembers: 3,
  pendingFulfillment: 1,
  weeklyReservationRate: 72,
  recentNotifications: [],
};

const MOCK_CHECKIN_RESULT = {
  id: '550e8400-e29b-41d4-a716-446655440050',
  reservationId: '550e8400-e29b-41d4-a716-446655440051',
  reservationNumber: 'RES-20260301-001',
  userName: '홍길동',
  userNickname: '길동',
  studioName: '스튜디오 A',
  method: 'QR',
  checkedInAt: '2026-03-10T09:00:00.000Z',
};

const MOCK_FULFILLMENT = {
  id: '550e8400-e29b-41d4-a716-446655440060',
  reservationId: '550e8400-e29b-41d4-a716-446655440051',
  status: 'PENDING',
  memo: null,
  updatedAt: new Date().toISOString(),
};

import { operatorService } from '../services/operator-service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Operator 라우트 — 인증 가드', () => {
  it('GET /api/operator/dashboard — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/operator/dashboard');
    expect(res.status).toBe(401);
  });

  it('GET /api/operator/dashboard — MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');
    const res = await app.request('/api/operator/dashboard', {
      headers: authHeader(token),
    });
    expect(res.status).toBe(403);
    const data = (await res.json()) as { success: boolean; error: { code: string } };
    expect(data.error.code).toBe('PERMISSION_DENIED');
  });
});

// ─────────────────────────────────────────────
// 대시보드
// ─────────────────────────────────────────────
describe('GET /api/operator/dashboard — 대시보드 조회', () => {
  it('OPERATOR 토큰으로 요청 시 200과 대시보드 데이터 반환', async () => {
    vi.mocked(operatorService.getDashboard).mockResolvedValue(MOCK_DASHBOARD as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/operator/dashboard', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_DASHBOARD };
    expect(data.success).toBe(true);
    expect(data.data.todayReservations).toBeDefined();
    expect(data.data.pendingApprovals).toBe(2);
    expect(operatorService.getDashboard).toHaveBeenCalledOnce();
  });

  it('ADMIN 토큰으로도 200 반환', async () => {
    vi.mocked(operatorService.getDashboard).mockResolvedValue(MOCK_DASHBOARD as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/operator/dashboard', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// 체크인
// ─────────────────────────────────────────────
describe('POST /api/operator/checkin — 체크인 처리', () => {
  it('유효한 body로 요청 시 201과 체크인 결과 반환', async () => {
    vi.mocked(operatorService.checkin).mockResolvedValue(MOCK_CHECKIN_RESULT as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/operator/checkin', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: '550e8400-e29b-41d4-a716-446655440051',
        method: 'QR',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_CHECKIN_RESULT };
    expect(data.success).toBe(true);
    expect(data.data.reservationNumber).toBe('RES-20260301-001');
    expect(operatorService.checkin).toHaveBeenCalledOnce();
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/operator/checkin', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    expect(operatorService.checkin).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 체크아웃
// ─────────────────────────────────────────────
describe('POST /api/operator/checkout/:id — 체크아웃', () => {
  it('유효한 예약 id로 요청 시 200 반환', async () => {
    vi.mocked(operatorService.checkout).mockResolvedValue(undefined);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/operator/checkout/550e8400-e29b-41d4-a716-446655440051', {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { message: string } };
    expect(data.success).toBe(true);
    expect(data.data.message).toContain('체크아웃');
  });

  it('토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/operator/checkout/550e8400-e29b-41d4-a716-446655440051', {
      method: 'POST',
    });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 포장 작업
// ─────────────────────────────────────────────
describe('GET /api/operator/fulfillment — 포장 작업 목록', () => {
  it('OPERATOR 토큰으로 요청 시 200과 paginated 응답 반환', async () => {
    vi.mocked(operatorService.getFulfillments).mockResolvedValue({
      items: [MOCK_FULFILLMENT],
      total: 1,
    } as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/operator/fulfillment', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: unknown[];
      meta: { total: number; page: number; limit: number };
    };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.meta.total).toBe(1);
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');
    const res = await app.request('/api/operator/fulfillment', {
      headers: authHeader(token),
    });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/operator/fulfillment/:id — 포장 상태 변경', () => {
  it('유효한 status로 요청 시 200 반환', async () => {
    vi.mocked(operatorService.updateFulfillment).mockResolvedValue({
      ...MOCK_FULFILLMENT,
      status: 'PACKING',
    } as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request(
      `/api/operator/fulfillment/550e8400-e29b-41d4-a716-446655440060`,
      {
        method: 'PATCH',
        headers: { ...authHeader(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PACKING' }),
      },
    );

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// 운영 통계
// ─────────────────────────────────────────────
describe('GET /api/operator/stats — 운영 통계', () => {
  it('OPERATOR 토큰으로 요청 시 200과 통계 반환', async () => {
    const MOCK_STATS = {
      totalReservations: 500,
      weeklyReservations: 30,
      totalMembers: 100,
      approvedMembers: 90,
    };
    vi.mocked(operatorService.getStats).mockResolvedValue(MOCK_STATS as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/operator/stats', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_STATS };
    expect(data.success).toBe(true);
    expect(data.data.totalReservations).toBe(500);
  });
});
