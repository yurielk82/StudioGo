/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 레포지토리 모킹 ──────────────────────────────────
vi.mock('../repositories/service-repository', () => ({
  serviceRepository: {
    findAll: vi.fn(),
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
const MOCK_SERVICES = [
  {
    id: '550e8400-e29b-41d4-a716-446655440080',
    name: '포장 서비스',
    description: '상품을 안전하게 포장해 드립니다.',
    icon: 'box',
    isActive: true,
    requiresQuantity: true,
    requiresMemo: false,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440081',
    name: '배송 대행',
    description: '당일 배송을 대행해 드립니다.',
    icon: 'truck',
    isActive: true,
    requiresQuantity: false,
    requiresMemo: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

import { serviceRepository } from '../repositories/service-repository';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Services 라우트 — 인증 가드', () => {
  it('GET /api/services — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/services');
    expect(res.status).toBe(401);
    expect(serviceRepository.findAll).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 부가서비스 목록
// ─────────────────────────────────────────────
describe('GET /api/services — 활성 부가서비스 목록', () => {
  it('MEMBER 토큰으로 요청 시 200과 활성 서비스 목록 반환', async () => {
    vi.mocked(serviceRepository.findAll).mockResolvedValue(MOCK_SERVICES as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/services', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: typeof MOCK_SERVICES };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]?.id).toBe('550e8400-e29b-41d4-a716-446655440080');
    expect(data.data[1]?.id).toBe('550e8400-e29b-41d4-a716-446655440081');
    // isActive=true 필터로 호출되어야 함
    expect(serviceRepository.findAll).toHaveBeenCalledWith(true);
  });

  it('OPERATOR 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(serviceRepository.findAll).mockResolvedValue(MOCK_SERVICES as any);
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/services', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    expect(serviceRepository.findAll).toHaveBeenCalledWith(true);
  });

  it('ADMIN 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(serviceRepository.findAll).mockResolvedValue(MOCK_SERVICES as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/services', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
  });

  it('서비스가 없을 때 빈 배열 반환', async () => {
    vi.mocked(serviceRepository.findAll).mockResolvedValue([]);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/services', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: unknown[] };
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(0);
  });

  it('응답 데이터에 success: true가 포함된다', async () => {
    vi.mocked(serviceRepository.findAll).mockResolvedValue(MOCK_SERVICES as any);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/services', {
      headers: authHeader(token),
    });

    const data = (await res.json()) as { success: boolean };
    expect(data.success).toBe(true);
  });
});
