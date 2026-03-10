/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 서비스 모킹 ──────────────────────────────────
vi.mock('../services/admin-service', () => ({
  adminService: {
    getSettings: vi.fn(),
    updateSetting: vi.fn(),
    getBlackouts: vi.fn(),
    createBlackout: vi.fn(),
    deleteBlackout: vi.fn(),
    getTierConfig: vi.fn(),
    updateTierConfig: vi.fn(),
    recalculateTiers: vi.fn(),
    getServices: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
    getLogs: vi.fn(),
    getFeatureFlags: vi.fn(),
    updateFeatureFlag: vi.fn(),
    getAnnouncements: vi.fn(),
    createAnnouncement: vi.fn(),
    updateAnnouncement: vi.fn(),
    deleteAnnouncement: vi.fn(),
    getPermissions: vi.fn(),
    updatePermissions: vi.fn(),
  },
}));

vi.mock('../services/stats-service', () => ({
  statsService: {
    getAdminStats: vi.fn(),
  },
}));

// ── JWT 토큰 헬퍼 ──────────────────────────────────
const JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.JWT_SECRET = JWT_SECRET;

async function makeToken(role: 'ADMIN' | 'OPERATOR' | 'MEMBER' = 'ADMIN') {
  return new SignJWT({ sub: 'user-admin-001', role, status: 'APPROVED', tier: 'GOLD' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 테스트 픽스처 ──────────────────────────────────
const MOCK_SETTINGS = [
  {
    key: 'operating_hours',
    value: { start: '09:00', end: '22:00' },
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_BLACKOUT = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  studioId: '550e8400-e29b-41d4-a716-446655440001',
  startAt: '2026-04-01T00:00:00.000Z',
  endAt: '2026-04-02T23:59:59.000Z',
  reason: '정기 점검',
  createdAt: new Date().toISOString(),
};

const MOCK_SERVICE = {
  id: '550e8400-e29b-41d4-a716-446655440020',
  name: '포장 서비스',
  description: '상품 포장',
  icon: 'box',
  isActive: true,
  requiresQuantity: true,
  requiresMemo: false,
  sortOrder: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_ANNOUNCEMENT = {
  id: '550e8400-e29b-41d4-a716-446655440030',
  title: '공지사항',
  content: '내용',
  type: 'NOTICE',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── 임포트 래퍼 (vitest 모킹 후 접근) ──────────────────────────────────
import { adminService } from '../services/admin-service';
import { statsService } from '../services/stats-service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Admin 라우트 — 인증 가드', () => {
  it('GET /api/admin/settings — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/admin/settings');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/settings — MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');
    const res = await app.request('/api/admin/settings', {
      headers: authHeader(token),
    });
    expect(res.status).toBe(403);
    const data = (await res.json()) as { success: boolean; error: { code: string } };
    expect(data.error.code).toBe('PERMISSION_DENIED');
  });

  it('GET /api/admin/settings — OPERATOR 토큰으로 요청 시 403', async () => {
    const token = await makeToken('OPERATOR');
    const res = await app.request('/api/admin/settings', {
      headers: authHeader(token),
    });
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────
// 운영 설정
// ─────────────────────────────────────────────
describe('GET /api/admin/settings — 운영 설정 조회', () => {
  it('ADMIN 토큰으로 요청 시 200과 설정 목록 반환', async () => {
    vi.mocked(adminService.getSettings).mockResolvedValue(MOCK_SETTINGS as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/settings', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_SETTINGS };
    expect(data.success).toBe(true);
    expect(data.data).toEqual(MOCK_SETTINGS);
    expect(adminService.getSettings).toHaveBeenCalledOnce();
  });
});

describe('PATCH /api/admin/settings/:key — 운영 설정 수정', () => {
  it('유효한 body로 요청 시 200 반환', async () => {
    vi.mocked(adminService.updateSetting).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/settings/operating_hours', {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: { start: '10:00', end: '22:00' } }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean };
    expect(data.success).toBe(true);
  });

  it('value 없이 빈 객체 전송 시에도 200 반환 (value: z.unknown() 허용)', async () => {
    // UpdateSettingRequestSchema는 value: z.unknown() — 빈 객체도 통과하는 것이 정상
    vi.mocked(adminService.updateSetting).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/settings/operating_hours', {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// Blackout
// ─────────────────────────────────────────────
describe('GET /api/admin/blackouts — blackout 목록', () => {
  it('ADMIN 토큰으로 요청 시 200과 목록 반환', async () => {
    vi.mocked(adminService.getBlackouts).mockResolvedValue([MOCK_BLACKOUT] as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/blackouts', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });
});

describe('POST /api/admin/blackouts — blackout 생성', () => {
  it('유효한 body로 요청 시 201 반환', async () => {
    vi.mocked(adminService.createBlackout).mockResolvedValue(MOCK_BLACKOUT as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/blackouts', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: '550e8400-e29b-41d4-a716-446655440001',
        startAt: '2026-04-01T00:00:00.000Z',
        endAt: '2026-04-02T23:59:59.000Z',
        reason: '정기 점검',
        type: 'MAINTENANCE',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_BLACKOUT };
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(MOCK_BLACKOUT.id);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/blackouts', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: '이유만 있고 날짜 없음' }),
    });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/blackouts/:id — blackout 삭제', () => {
  it('존재하는 id로 요청 시 204 반환', async () => {
    vi.mocked(adminService.deleteBlackout).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/admin/blackouts/${MOCK_BLACKOUT.id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(204);
  });
});

// ─────────────────────────────────────────────
// 부가서비스
// ─────────────────────────────────────────────
describe('GET /api/admin/services — 부가서비스 목록', () => {
  it('ADMIN 토큰으로 요청 시 200과 목록 반환', async () => {
    vi.mocked(adminService.getServices).mockResolvedValue([MOCK_SERVICE] as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/services', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.data).toHaveLength(1);
  });
});

describe('POST /api/admin/services — 부가서비스 생성', () => {
  it('유효한 body로 요청 시 201 반환', async () => {
    vi.mocked(adminService.createService).mockResolvedValue(MOCK_SERVICE as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/services', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '포장 서비스',
        description: '상품 포장',
        icon: 'box',
        requiresQuantity: true,
        requiresMemo: false,
        sortOrder: 1,
      }),
    });

    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/admin/services/:id — 부가서비스 수정', () => {
  it('유효한 body로 요청 시 200 반환', async () => {
    vi.mocked(adminService.updateService).mockResolvedValue({
      ...MOCK_SERVICE,
      name: '수정됨',
    } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/admin/services/${MOCK_SERVICE.id}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '수정됨' }),
    });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/admin/services/:id — 부가서비스 삭제', () => {
  it('존재하는 id로 요청 시 204 반환', async () => {
    vi.mocked(adminService.deleteService).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/admin/services/${MOCK_SERVICE.id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(204);
  });
});

// ─────────────────────────────────────────────
// 공지사항
// ─────────────────────────────────────────────
describe('GET /api/admin/announcements — 공지 목록', () => {
  it('ADMIN 토큰으로 요청 시 200과 목록 반환', async () => {
    vi.mocked(adminService.getAnnouncements).mockResolvedValue([MOCK_ANNOUNCEMENT] as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/announcements', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.data).toHaveLength(1);
  });
});

describe('POST /api/admin/announcements — 공지 생성', () => {
  it('유효한 body로 요청 시 201 반환', async () => {
    vi.mocked(adminService.createAnnouncement).mockResolvedValue(MOCK_ANNOUNCEMENT as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/announcements', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '공지사항',
        content: '내용',
        type: 'NOTICE',
        targetRoles: ['MEMBER'],
        isPublished: true,
      }),
    });

    expect(res.status).toBe(201);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/announcements', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '제목만' }),
    });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/admin/announcements/:id — 공지 수정', () => {
  it('유효한 body로 요청 시 200 반환', async () => {
    vi.mocked(adminService.updateAnnouncement).mockResolvedValue({
      ...MOCK_ANNOUNCEMENT,
      title: '수정됨',
    } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/admin/announcements/${MOCK_ANNOUNCEMENT.id}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '수정됨' }),
    });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/admin/announcements/:id — 공지 삭제', () => {
  it('존재하는 id로 요청 시 204 반환', async () => {
    vi.mocked(adminService.deleteAnnouncement).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/admin/announcements/${MOCK_ANNOUNCEMENT.id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(204);
  });
});

// ─────────────────────────────────────────────
// 통계
// ─────────────────────────────────────────────
describe('GET /api/admin/stats — 관리자 통계', () => {
  const MOCK_STATS = {
    members: { total: 100, pending: 5, approved: 90, suspended: 5 },
    reservations: { total: 500, week: 30 },
    dailyTrend: [],
    studioUtilization: [],
    tierDistribution: [],
  };

  it('period 없이 요청 시 200과 통계 반환 (기본값 month)', async () => {
    vi.mocked(statsService.getAdminStats).mockResolvedValue(MOCK_STATS as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/stats', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_STATS };
    expect(data.success).toBe(true);
    expect(statsService.getAdminStats).toHaveBeenCalledWith('month');
  });

  it('period=week로 요청 시 statsService에 week 전달', async () => {
    vi.mocked(statsService.getAdminStats).mockResolvedValue(MOCK_STATS as any);
    const token = await makeToken('ADMIN');

    await app.request('/api/admin/stats?period=week', {
      headers: authHeader(token),
    });

    expect(statsService.getAdminStats).toHaveBeenCalledWith('week');
  });

  it('잘못된 period 값으로 요청 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/stats?period=invalid', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// 권한 관리
// ─────────────────────────────────────────────
describe('GET /api/admin/permissions — 권한 목록', () => {
  it('ADMIN 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(adminService.getPermissions).mockResolvedValue([] as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/permissions', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/admin/permissions/:userId — 권한 수정', () => {
  it('유효한 userId와 body로 요청 시 200 반환', async () => {
    vi.mocked(adminService.updatePermissions).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');
    const targetUserId = '550e8400-e29b-41d4-a716-446655440001';

    const res = await app.request(`/api/admin/permissions/${targetUserId}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ canApproveReservation: true, canManageMembers: false }),
    });

    expect(res.status).toBe(200);
  });

  it('UUID 형식이 아닌 userId로 요청 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/permissions/not-a-uuid', {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ canApproveReservation: true }),
    });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// 티어
// ─────────────────────────────────────────────
describe('GET /api/admin/tiers/config — 티어 설정 조회', () => {
  it('ADMIN 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(adminService.getTierConfig).mockResolvedValue({
      thresholds: { BRONZE: 0, SILVER: 10, GOLD: 30 },
      autoApproveGoldAbove: true,
    } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/tiers/config', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

describe('POST /api/admin/tiers/recalculate — 전체 재계산', () => {
  it('ADMIN 토큰으로 요청 시 200과 updated 수 반환', async () => {
    vi.mocked(adminService.recalculateTiers).mockResolvedValue({ updated: 42 } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/tiers/recalculate', {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { updated: number } };
    expect(data.data.updated).toBe(42);
  });
});

// ─────────────────────────────────────────────
// Feature Flags
// ─────────────────────────────────────────────
describe('GET /api/admin/feature-flags — flag 목록', () => {
  it('ADMIN 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(adminService.getFeatureFlags).mockResolvedValue([] as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/feature-flags', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────
// 시스템 로그
// ─────────────────────────────────────────────
describe('GET /api/admin/logs — 시스템 로그', () => {
  it('ADMIN 토큰으로 요청 시 200과 paginated 응답 반환', async () => {
    vi.mocked(adminService.getLogs).mockResolvedValue({ items: [], total: 0 } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/admin/logs', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: unknown[];
      meta: { total: number };
    };
    expect(data.success).toBe(true);
    expect(data.meta).toBeDefined();
    expect(data.meta.total).toBe(0);
  });
});
