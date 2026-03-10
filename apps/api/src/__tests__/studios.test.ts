/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 서비스 모킹 ──────────────────────────────────
vi.mock('../services/studio-service', () => ({
  studioService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleActive: vi.fn(),
  },
}));

// ── JWT 토큰 헬퍼 ──────────────────────────────────
const JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.JWT_SECRET = JWT_SECRET;

async function makeToken(role: 'ADMIN' | 'OPERATOR' | 'MEMBER' = 'MEMBER') {
  return new SignJWT({ sub: 'user-admin-001', role, status: 'APPROVED', tier: 'GOLD' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 테스트 픽스처 ──────────────────────────────────
const STUDIO_ID = '550e8400-e29b-41d4-a716-446655440001';

const MOCK_STUDIO = {
  id: STUDIO_ID,
  name: '스튜디오 A',
  description: '메인 스튜디오',
  location: '서울 강남구',
  capacity: 3,
  amenities: ['wifi', 'monitor'],
  imageUrls: ['https://example.com/studio.jpg'],
  isActive: true,
  sortOrder: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

import { studioService } from '../services/studio-service';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Studios 라우트 — 인증 가드', () => {
  it('GET /api/studios — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/studios');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 스튜디오 목록
// ─────────────────────────────────────────────
describe('GET /api/studios — 스튜디오 목록 조회', () => {
  it('MEMBER 토큰으로 요청 시 200과 활성 스튜디오 목록 반환 (isAdmin=false)', async () => {
    vi.mocked(studioService.list).mockResolvedValue([MOCK_STUDIO] as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/studios', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(studioService.list).toHaveBeenCalledWith(false);
  });

  it('ADMIN 토큰으로 요청 시 isAdmin=true 전달 (전체 목록)', async () => {
    vi.mocked(studioService.list).mockResolvedValue([MOCK_STUDIO] as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/studios', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    expect(studioService.list).toHaveBeenCalledWith(true);
  });

  it('OPERATOR 토큰으로 요청 시 200 반환 (isAdmin=false)', async () => {
    vi.mocked(studioService.list).mockResolvedValue([MOCK_STUDIO] as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/studios', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    expect(studioService.list).toHaveBeenCalledWith(false);
  });
});

// ─────────────────────────────────────────────
// 스튜디오 상세
// ─────────────────────────────────────────────
describe('GET /api/studios/:id — 스튜디오 상세 조회', () => {
  it('MEMBER 토큰과 유효한 id로 요청 시 200과 스튜디오 반환', async () => {
    vi.mocked(studioService.getById).mockResolvedValue(MOCK_STUDIO as any);
    const token = await makeToken('MEMBER');

    const res = await app.request(`/api/studios/${STUDIO_ID}`, {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_STUDIO };
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(MOCK_STUDIO.id);
    expect(data.data.name).toBe('스튜디오 A');
    expect(studioService.getById).toHaveBeenCalledWith(MOCK_STUDIO.id);
  });
});

// ─────────────────────────────────────────────
// 스튜디오 생성 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('POST /api/studios — 스튜디오 생성', () => {
  it('ADMIN 토큰으로 유효한 body 요청 시 201 반환', async () => {
    vi.mocked(studioService.create).mockResolvedValue(MOCK_STUDIO as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/studios', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '스튜디오 A',
        description: '메인 스튜디오',
        capacity: 3,
        equipment: ['wifi'],
        images: [],
        sortOrder: 1,
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_STUDIO };
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('스튜디오 A');
    expect(studioService.create).toHaveBeenCalledOnce();
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/studios', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '새 스튜디오',
        description: '설명',
        capacity: 2,
        equipment: [],
        images: [],
        sortOrder: 1,
      }),
    });

    expect(res.status).toBe(403);
    expect(studioService.create).not.toHaveBeenCalled();
  });

  it('OPERATOR 토큰으로 요청 시 403', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/studios', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '새 스튜디오',
        description: '설명',
        capacity: 2,
        equipment: [],
        images: [],
        sortOrder: 1,
      }),
    });

    expect(res.status).toBe(403);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/studios', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '이름만' }),
    });

    expect(res.status).toBe(400);
    expect(studioService.create).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 스튜디오 수정 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('PATCH /api/studios/:id — 스튜디오 수정', () => {
  it('ADMIN 토큰으로 유효한 body 요청 시 200 반환', async () => {
    vi.mocked(studioService.update).mockResolvedValue({
      ...MOCK_STUDIO,
      name: '수정된 스튜디오',
    } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/studios/${STUDIO_ID}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '수정된 스튜디오' }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { name: string } };
    expect(data.data.name).toBe('수정된 스튜디오');
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request(`/api/studios/${STUDIO_ID}`, {
      method: 'PATCH',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '수정 시도' }),
    });

    expect(res.status).toBe(403);
    expect(studioService.update).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 스튜디오 삭제 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('DELETE /api/studios/:id — 스튜디오 삭제', () => {
  it('ADMIN 토큰으로 요청 시 204 반환', async () => {
    vi.mocked(studioService.delete).mockResolvedValue(undefined);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/studios/${STUDIO_ID}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(204);
    expect(studioService.delete).toHaveBeenCalledWith(MOCK_STUDIO.id, 'user-admin-001');
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request(`/api/studios/${STUDIO_ID}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });

    expect(res.status).toBe(403);
    expect(studioService.delete).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 활성화 토글 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('PATCH /api/studios/:id/toggle — 활성화 토글', () => {
  it('ADMIN 토큰으로 요청 시 200과 토글된 스튜디오 반환', async () => {
    vi.mocked(studioService.toggleActive).mockResolvedValue({
      ...MOCK_STUDIO,
      isActive: false,
    } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request(`/api/studios/${MOCK_STUDIO.id}/toggle`, {
      method: 'PATCH',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { isActive: boolean } };
    expect(data.success).toBe(true);
    expect(data.data.isActive).toBe(false);
    expect(studioService.toggleActive).toHaveBeenCalledWith(MOCK_STUDIO.id, 'user-admin-001');
  });

  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request(`/api/studios/${MOCK_STUDIO.id}/toggle`, {
      method: 'PATCH',
      headers: authHeader(token),
    });

    expect(res.status).toBe(403);
    expect(studioService.toggleActive).not.toHaveBeenCalled();
  });
});
