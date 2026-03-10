/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 서비스 모킹 ──────────────────────────────────
vi.mock('../services/calendar-service', () => ({
  calendarService: {
    getMonthly: vi.fn(),
    getWeekly: vi.fn(),
    getDaily: vi.fn(),
  },
}));

// ── JWT 토큰 헬퍼 ──────────────────────────────────
const JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.JWT_SECRET = JWT_SECRET;

async function makeToken(role: 'ADMIN' | 'OPERATOR' | 'MEMBER' = 'MEMBER') {
  return new SignJWT({ sub: 'user-member-001', role, status: 'APPROVED', tier: 'BRONZE' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 테스트 픽스처 ──────────────────────────────────
const MOCK_MONTHLY = Array.from({ length: 31 }, (_, i) => ({
  date: `2026-03-${String(i + 1).padStart(2, '0')}`,
  totalSlots: 8,
  availableSlots: 6,
  reservedSlots: 2,
  blockedSlots: 0,
  isBlackout: false,
  hasMyReservation: i === 9,
}));

const MOCK_WEEKLY_SLOTS = [
  {
    id: 'slot-uuid-001',
    studioId: '550e8400-e29b-41d4-a716-446655440001',
    studioName: '스튜디오 A',
    date: '2026-03-10',
    startTime: '09:00',
    endTime: '11:00',
    cleaningEndTime: '11:30',
    status: 'AVAILABLE',
    reservation: null,
  },
];

const MOCK_DAILY = [
  {
    studioId: '550e8400-e29b-41d4-a716-446655440001',
    studioName: '스튜디오 A',
    slots: [
      {
        id: 'slot-uuid-001',
        date: '2026-03-10',
        startTime: '09:00',
        endTime: '11:00',
        status: 'AVAILABLE',
        reservation: null,
      },
    ],
  },
];

import { calendarService } from '../services/calendar-service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Calendar 라우트 — 인증 가드', () => {
  it('GET /api/calendar/monthly — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/calendar/monthly?year=2026&month=3');
    expect(res.status).toBe(401);
  });

  it('GET /api/calendar/weekly — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/calendar/weekly?date=2026-03-10');
    expect(res.status).toBe(401);
  });

  it('GET /api/calendar/daily — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/calendar/daily?date=2026-03-10');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 월간 캘린더
// ─────────────────────────────────────────────
describe('GET /api/calendar/monthly — 월간 캘린더', () => {
  it('year, month 파라미터로 요청 시 200과 날짜별 데이터 반환', async () => {
    vi.mocked(calendarService.getMonthly).mockResolvedValue(MOCK_MONTHLY as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/monthly?year=2026&month=3', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(31);
    expect(calendarService.getMonthly).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2026, month: 3 }),
      'user-member-001',
    );
  });

  it('studioId 파라미터 포함 시 서비스에 전달됨', async () => {
    vi.mocked(calendarService.getMonthly).mockResolvedValue([] as any);
    const token = await makeToken('MEMBER');

    await app.request(
      '/api/calendar/monthly?year=2026&month=3&studioId=550e8400-e29b-41d4-a716-446655440001',
      {
        headers: authHeader(token),
      },
    );

    expect(calendarService.getMonthly).toHaveBeenCalledWith(
      expect.objectContaining({ studioId: '550e8400-e29b-41d4-a716-446655440001' }),
      'user-member-001',
    );
  });

  it('year 파라미터 없이 요청 시 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/monthly?month=3', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
    expect(calendarService.getMonthly).not.toHaveBeenCalled();
  });

  it('month 파라미터 없이 요청 시 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/monthly?year=2026', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
  });

  it('month가 1~12 범위 밖이면 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/monthly?year=2026&month=13', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
  });

  it('OPERATOR 토큰으로도 200 반환', async () => {
    vi.mocked(calendarService.getMonthly).mockResolvedValue([] as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/calendar/monthly?year=2026&month=3', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// 주간 캘린더
// ─────────────────────────────────────────────
describe('GET /api/calendar/weekly — 주간 캘린더', () => {
  it('date 파라미터로 요청 시 200과 슬롯 목록 반환', async () => {
    vi.mocked(calendarService.getWeekly).mockResolvedValue(MOCK_WEEKLY_SLOTS as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/weekly?date=2026-03-10', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(calendarService.getWeekly).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-03-10' }),
    );
  });

  it('date 파라미터 없이 요청 시 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/weekly', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
    expect(calendarService.getWeekly).not.toHaveBeenCalled();
  });

  it('잘못된 date 형식으로 요청 시 400 반환', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/weekly?date=20260310', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// 일간 캘린더
// ─────────────────────────────────────────────
describe('GET /api/calendar/daily — 일간 캘린더', () => {
  it('date 파라미터로 요청 시 200과 스튜디오별 슬롯 반환', async () => {
    vi.mocked(calendarService.getDaily).mockResolvedValue(MOCK_DAILY as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/calendar/daily?date=2026-03-10', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_DAILY };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0]?.studioId).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(calendarService.getDaily).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-03-10' }),
    );
  });

  it('studioId 파라미터 포함 시 서비스에 전달됨', async () => {
    vi.mocked(calendarService.getDaily).mockResolvedValue([] as any);
    const token = await makeToken('OPERATOR');

    await app.request(
      '/api/calendar/daily?date=2026-03-10&studioId=550e8400-e29b-41d4-a716-446655440001',
      {
        headers: authHeader(token),
      },
    );

    expect(calendarService.getDaily).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-03-10',
        studioId: '550e8400-e29b-41d4-a716-446655440001',
      }),
    );
  });

  it('date 파라미터 없이 요청 시 400 반환', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/calendar/daily', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
    expect(calendarService.getDaily).not.toHaveBeenCalled();
  });

  it('MEMBER 토큰으로도 200 반환', async () => {
    vi.mocked(calendarService.getDaily).mockResolvedValue([] as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/calendar/daily?date=2026-03-10', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});
