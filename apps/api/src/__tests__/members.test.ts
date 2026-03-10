/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 서비스 모킹 ──────────────────────────────────
vi.mock('../services/member-service', () => ({
  memberService: {
    list: vi.fn(),
    getById: vi.fn(),
    approve: vi.fn(),
    suspend: vi.fn(),
    unsuspend: vi.fn(),
    update: vi.fn(),
    getHistory: vi.fn(),
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
const MEMBER_ID = '550e8400-e29b-41d4-a716-446655440001';

const MOCK_MEMBER = {
  id: MEMBER_ID,
  name: '홍길동',
  nickname: '길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  role: 'MEMBER',
  status: 'PENDING',
  tier: 'BRONZE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_HISTORY = {
  items: [
    {
      id: 'reservation-uuid-001',
      reservationNumber: 'RES-20260301-001',
      studioName: '스튜디오 A',
      date: '2026-03-01',
      status: 'COMPLETED',
    },
  ],
  total: 1,
};

import { memberService } from '../services/member-service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Members 라우트 — 인증 가드', () => {
  it('GET /api/members — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/members');
    expect(res.status).toBe(401);
  });

  it('GET /api/members — MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');
    const res = await app.request('/api/members', {
      headers: authHeader(token),
    });
    expect(res.status).toBe(403);
    const data = (await res.json()) as { success: boolean; error: { code: string } };
    expect(data.error.code).toBe('PERMISSION_DENIED');
  });
});

// ─────────────────────────────────────────────
// 회원 목록
// ─────────────────────────────────────────────
describe('GET /api/members — 회원 목록 조회', () => {
  it('OPERATOR 토큰으로 요청 시 200과 paginated 목록 반환', async () => {
    vi.mocked(memberService.list).mockResolvedValue({
      items: [MOCK_MEMBER],
      total: 1,
    } as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/members', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: unknown[];
      meta: { total: number };
    };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.meta.total).toBe(1);
    expect(memberService.list).toHaveBeenCalledOnce();
  });

  it('status 쿼리 파라미터 포함 시 서비스에 전달됨', async () => {
    vi.mocked(memberService.list).mockResolvedValue({ items: [], total: 0 } as any);
    const token = await makeToken('OPERATOR');

    await app.request('/api/members?status=PENDING&page=1&limit=10', {
      headers: authHeader(token),
    });

    expect(memberService.list).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING' }));
  });

  it('ADMIN 토큰으로도 200 반환', async () => {
    vi.mocked(memberService.list).mockResolvedValue({ items: [], total: 0 } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/members', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// 회원 상세
// ─────────────────────────────────────────────
describe('GET /api/members/:id — 회원 상세 조회', () => {
  it('OPERATOR 토큰과 유효한 id로 요청 시 200과 회원 반환', async () => {
    vi.mocked(memberService.getById).mockResolvedValue(MOCK_MEMBER as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}`, {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_MEMBER };
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(MEMBER_ID);
    expect(memberService.getById).toHaveBeenCalledWith(MEMBER_ID);
  });
});

// ─────────────────────────────────────────────
// 회원 승인
// ─────────────────────────────────────────────
describe('POST /api/members/:id/approve — 회원 승인', () => {
  it('OPERATOR 토큰으로 요청 시 200과 성공 메시지 반환', async () => {
    vi.mocked(memberService.approve).mockResolvedValue(undefined);
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}/approve`, {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { message: string } };
    expect(data.success).toBe(true);
    expect(data.data.message).toContain('승인');
    expect(memberService.approve).toHaveBeenCalledWith(MEMBER_ID, 'user-operator-001');
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request(`/api/members/${MEMBER_ID}/approve`, {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(403);
    expect(memberService.approve).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 회원 정지
// ─────────────────────────────────────────────
describe('POST /api/members/:id/suspend — 회원 정지', () => {
  it('유효한 reason과 함께 요청 시 200 반환', async () => {
    vi.mocked(memberService.suspend).mockResolvedValue(undefined);
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}/suspend`, {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: '규정 위반' }),
    });

    expect(res.status).toBe(200);
    expect(memberService.suspend).toHaveBeenCalledWith(MEMBER_ID, 'user-operator-001', '규정 위반');
  });

  it('reason 없이 요청 시 400 반환', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}/suspend`, {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    expect(memberService.suspend).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 정지 해제
// ─────────────────────────────────────────────
describe('POST /api/members/:id/unsuspend — 정지 해제', () => {
  it('OPERATOR 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(memberService.unsuspend).mockResolvedValue(undefined);
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}/unsuspend`, {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { message: string } };
    expect(data.data.message).toContain('해제');
  });
});

// ─────────────────────────────────────────────
// 회원 정보 수정 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('PATCH /api/members/:id — 회원 정보 수정', () => {
  it('ADMIN 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(memberService.update).mockResolvedValue({
      ...MOCK_MEMBER,
      nickname: '새닉네임',
    } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/members/${MEMBER_ID}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '새닉네임' }),
    });

    expect(res.status).toBe(200);
    expect(memberService.update).toHaveBeenCalledOnce();
  });

  it('OPERATOR 토큰으로 요청 시 403 반환 (ADMIN 전용)', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '변경시도' }),
    });

    expect(res.status).toBe(403);
    expect(memberService.update).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 예약/방송 이력
// ─────────────────────────────────────────────
describe('GET /api/members/:id/history — 예약 이력', () => {
  it('OPERATOR 토큰으로 요청 시 200과 paginated 이력 반환', async () => {
    vi.mocked(memberService.getHistory).mockResolvedValue(MOCK_HISTORY as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request(`/api/members/${MEMBER_ID}/history`, {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: unknown[];
      meta: { total: number };
    };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.meta.total).toBe(1);
  });
});
