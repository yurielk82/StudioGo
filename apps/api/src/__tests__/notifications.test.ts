/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import app from '../app';

// ── 레포지토리 및 외부 의존성 모킹 ──────────────────────────────────
vi.mock('../repositories/notification-repository', () => ({
  notificationRepository: {
    getAppNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

vi.mock('../../../../shared/db/index', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    leftJoin: vi.fn().mockReturnThis(),
    then: vi.fn(),
  },
}));

vi.mock('../lib/kakao-bizmessage', () => ({
  sendAlimtalk: vi.fn(),
}));

// ── JWT 토큰 헬퍼 ──────────────────────────────────
const JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.JWT_SECRET = JWT_SECRET;

async function makeToken(
  role: 'ADMIN' | 'OPERATOR' | 'MEMBER' = 'MEMBER',
  userId = 'user-member-001',
) {
  return new SignJWT({ sub: userId, role, status: 'APPROVED', tier: 'BRONZE' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── 테스트 픽스처 ──────────────────────────────────
const NOTIF_ID = '550e8400-e29b-41d4-a716-446655440050';

const MOCK_NOTIFICATIONS = {
  items: [
    {
      id: NOTIF_ID,
      userId: 'user-member-001',
      title: '예약 승인',
      body: '예약이 승인되었습니다.',
      type: 'RESERVATION_APPROVED',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
  total: 1,
};

import { notificationRepository } from '../repositories/notification-repository';
import { sendAlimtalk } from '../lib/kakao-bizmessage';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// 인증 가드
// ─────────────────────────────────────────────
describe('Notifications 라우트 — 인증 가드', () => {
  it('GET /api/notifications — 토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/notifications');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 인앱 알림 목록
// ─────────────────────────────────────────────
describe('GET /api/notifications — 내 알림 목록', () => {
  it('MEMBER 토큰으로 요청 시 200과 알림 목록 반환', async () => {
    vi.mocked(notificationRepository.getAppNotifications).mockResolvedValue(
      MOCK_NOTIFICATIONS as any,
    );
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/notifications', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: { items: unknown[]; meta: { total: number } };
    };
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.meta.total).toBe(1);
    expect(notificationRepository.getAppNotifications).toHaveBeenCalledWith(
      'user-member-001',
      1,
      20,
    );
  });

  it('page, limit 쿼리 파라미터 전달 시 레포지토리에 반영됨', async () => {
    vi.mocked(notificationRepository.getAppNotifications).mockResolvedValue({
      items: [],
      total: 0,
    } as any);
    const token = await makeToken('MEMBER');

    await app.request('/api/notifications?page=2&limit=5', {
      headers: authHeader(token),
    });

    expect(notificationRepository.getAppNotifications).toHaveBeenCalledWith(
      'user-member-001',
      2,
      5,
    );
  });
});

// ─────────────────────────────────────────────
// 읽음 처리
// ─────────────────────────────────────────────
describe('POST /api/notifications/:id/read — 읽음 처리', () => {
  it('MEMBER 토큰과 유효한 id로 요청 시 200 반환', async () => {
    vi.mocked(notificationRepository.markAsRead).mockResolvedValue(undefined);
    const token = await makeToken('MEMBER');

    const res = await app.request(`/api/notifications/${NOTIF_ID}/read`, {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { message: string } };
    expect(data.success).toBe(true);
    expect(notificationRepository.markAsRead).toHaveBeenCalledWith(NOTIF_ID, 'user-member-001');
  });
});

// ─────────────────────────────────────────────
// 전체 읽음 처리
// ─────────────────────────────────────────────
describe('POST /api/notifications/read-all — 전체 읽음 처리', () => {
  it('MEMBER 토큰으로 요청 시 200 반환', async () => {
    vi.mocked(notificationRepository.markAllAsRead).mockResolvedValue(undefined);
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/notifications/read-all', {
      method: 'POST',
      headers: authHeader(token),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { message: string } };
    expect(data.success).toBe(true);
    expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('user-member-001');
  });

  it('토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/notifications/read-all', { method: 'POST' });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// 알림 설정 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('GET /api/notifications/settings — 알림 설정 조회', () => {
  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/notifications/settings', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(403);
  });

  it('OPERATOR 토큰으로 요청 시 403', async () => {
    const token = await makeToken('OPERATOR');

    const res = await app.request('/api/notifications/settings', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────
// 테스트 발송 (ADMIN 전용)
// ─────────────────────────────────────────────
describe('POST /api/notifications/test — 테스트 발송', () => {
  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/notifications/test', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientPhone: '01012345678',
        eventType: 'RESERVATION_APPROVED',
      }),
    });

    expect(res.status).toBe(403);
    expect(sendAlimtalk).not.toHaveBeenCalled();
  });

  it('ADMIN 토큰으로 유효한 body 요청 시 200 반환', async () => {
    vi.mocked(sendAlimtalk).mockResolvedValue({ success: true, messageId: 'msg-001' } as any);
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/notifications/test', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientPhone: '01012345678',
        eventType: 'RESERVATION_APPROVED',
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; data: { sent: boolean } };
    expect(data.success).toBe(true);
    expect(data.data.sent).toBe(true);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    const token = await makeToken('ADMIN');

    const res = await app.request('/api/notifications/test', {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientPhone: '01012345678' }),
    });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// 발송 이력 (OPERATOR+)
// ─────────────────────────────────────────────
describe('GET /api/notifications/logs — 발송 이력', () => {
  it('MEMBER 토큰으로 요청 시 403', async () => {
    const token = await makeToken('MEMBER');

    const res = await app.request('/api/notifications/logs', {
      headers: authHeader(token),
    });

    expect(res.status).toBe(403);
  });

  it('토큰 없이 요청 시 401', async () => {
    const res = await app.request('/api/notifications/logs');
    expect(res.status).toBe(401);
  });
});
