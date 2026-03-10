/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 서비스 모킹 ──────────────────────────────────
vi.mock('../services/slot-service', () => ({
  slotService: {
    getSlots: vi.fn(),
    createHold: vi.fn(),
    cancelHold: vi.fn(),
    generateSlots: vi.fn(),
  },
}));

// ── JWT 토큰 헬퍼 ──────────────────────────────────
const JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.JWT_SECRET = JWT_SECRET;

async function makeToken(
  role: 'ADMIN' | 'OPERATOR' | 'MEMBER' = 'MEMBER',
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED' = 'APPROVED',
) {
  return new SignJWT({ sub: 'user-member-001', role, status, tier: 'BRONZE' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 테스트 픽스처 ──────────────────────────────────
const SLOT_ID = '550e8400-e29b-41d4-a716-446655440070';
const STUDIO_ID = '550e8400-e29b-41d4-a716-446655440001';

const MOCK_SLOT = {
  id: SLOT_ID,
  studioId: STUDIO_ID,
  date: '2026-03-15',
  startTime: '09:00',
  endTime: '11:00',
  cleaningEndTime: '11:30',
  status: 'AVAILABLE',
};

const HOLD_TOKEN = '550e8400-e29b-41d4-a716-446655440099';

const MOCK_HOLD = {
  holdToken: HOLD_TOKEN,
  timeSlotId: SLOT_ID,
  expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  status: 'ACTIVE',
};

import { slotService } from '../services/slot-service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Slots 라우트 — 인증 가드', () => {
  it('GET /api/slots — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/slots');
    expect(res.status).toBe(401);
  });

  it('POST /api/slots/hold — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/slots/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlotId: SLOT_ID }),
    });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 슬롯 조회
// ─────────────────────────────────────────────
describe('GET /api/slots — 슬롯 조회', () => {
  it('MEMBER 토큰과 date 파라미터로 요청 시 200과 슬롯 목록 반환', async () => {
    vi.mocked(slotService.getSlots).mockResolvedValue([MOCK_SLOT] as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/slots?date=2026-03-15', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(slotService.getSlots).toHaveBeenCalledWith('2026-03-15', undefined);
  });

  it('studioId 파라미터 포함 시 서비스에 전달됨', async () => {
    vi.mocked(slotService.getSlots).mockResolvedValue([] as any);
    const token = await makeToken('MEMBER');

    await app.request(`/api/slots?date=2026-03-15&studioId=${STUDIO_ID}`, {
      headers: authHeader(token),
    });

    expect(slotService.getSlots).toHaveBeenCalledWith('2026-03-15', STUDIO_ID);
  });

  it('date 파라미터 없이 요청 시 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/slots', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
    expect(slotService.getSlots).not.toHaveBeenCalled();
  });

  it('OPERATOR 토큰으로도 200 반환', async () => {
    vi.mocked(slotService.getSlots).mockResolvedValue([MOCK_SLOT] as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/slots?date=2026-03-15', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// Hold 생성
// ─────────────────────────────────────────────
describe('POST /api/slots/hold — Hold 생성', () => {
  it('APPROVED MEMBER 토큰으로 요청 시 201과 hold 정보 반환', async () => {
    vi.mocked(slotService.createHold).mockResolvedValue(MOCK_HOLD as any);
    const token = await makeToken('MEMBER', 'APPROVED');

    const res = await app.request('/api/slots/hold', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlotId: SLOT_ID }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as {
      success: boolean;
      data: { holdToken: string; expiresAt: string };
    };
    expect(data.success).toBe(true);
    expect(data.data.holdToken).toBe(MOCK_HOLD.holdToken);
    expect(data.data.expiresAt).toBeDefined();
    expect(slotService.createHold).toHaveBeenCalledWith(SLOT_ID, 'user-member-001');
  });

  it('PENDING 상태의 MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER', 'PENDING');

    const res = await app.request('/api/slots/hold', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlotId: SLOT_ID }),
    });

    expect(res.status).toBe(403);
    const data = (await res.json()) as { success: boolean; error: { code: string } };
    expect(data.error.code).toBe('MEMBER_NOT_APPROVED');
    expect(slotService.createHold).not.toHaveBeenCalled();
  });

  it('SUSPENDED 상태의 MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER', 'SUSPENDED');

    const res = await app.request('/api/slots/hold', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlotId: SLOT_ID }),
    });

    expect(res.status).toBe(403);
    expect(slotService.createHold).not.toHaveBeenCalled();
  });

  it('timeSlotId 누락 시 400 반환', async () => {
    const token = await makeToken('MEMBER', 'APPROVED');

    const res = await app.request('/api/slots/hold', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    expect(slotService.createHold).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// Hold 해제
// ─────────────────────────────────────────────
describe('DELETE /api/slots/hold/:token — Hold 해제', () => {
  it('유효한 UUID token으로 요청 시 200 반환', async () => {
    vi.mocked(slotService.cancelHold).mockResolvedValue(undefined);
    const token = await makeToken('MEMBER');
    const holdToken = HOLD_TOKEN;

    const res = await app.request(`/api/slots/hold/${holdToken}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { message: string } };
    expect(data.success).toBe(true);
    expect(data.data.message).toContain('Hold');
    expect(slotService.cancelHold).toHaveBeenCalledWith(holdToken, 'user-member-001');
  });

  it('UUID 형식이 아닌 token으로 요청 시 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/slots/hold/not-a-uuid', {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
    expect(slotService.cancelHold).not.toHaveBeenCalled();
  });

  it('토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/slots/hold/550e8400-e29b-41d4-a716-446655440099', {
      method: 'DELETE',
    });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 슬롯 생성 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('POST /api/slots/generate — 슬롯 (재)생성', () => {
  it('ADMIN 토큰으로 유효한 body 요청 시 201 반환', async () => {
    vi.mocked(slotService.generateSlots).mockResolvedValue({ created: 14, dates: 7 } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/slots/generate', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: STUDIO_ID,
        startDate: '2026-04-01',
        endDate: '2026-04-07',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as {
      success: boolean;
      data: { created: number; dates: number };
    };
    expect(data.success).toBe(true);
    expect(data.data.created).toBe(14);
    expect(data.data.dates).toBe(7);
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/slots/generate', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: STUDIO_ID,
        startDate: '2026-04-01',
        endDate: '2026-04-07',
      }),
    });

    expect(res.status).toBe(403);
    expect(slotService.generateSlots).not.toHaveBeenCalled();
  });

  it('OPERATOR 토큰으로 요청 시 403', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/slots/generate', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: STUDIO_ID,
        startDate: '2026-04-01',
        endDate: '2026-04-07',
      }),
    });

    expect(res.status).toBe(403);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/slots/generate', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ studioId: 'studio-uuid-001' }),
    });

    expect(res.status).toBe(400);
    expect(slotService.generateSlots).not.toHaveBeenCalled();
  });
});
