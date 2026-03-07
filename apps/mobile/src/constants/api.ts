/**
 * API 경로 상수 — 하드코딩 fetch URL 금지
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const API_ROUTES = {
  // 인증
  AUTH: {
    KAKAO_LOGIN: `${API_BASE}/auth/kakao`,
    KAKAO_CALLBACK: `${API_BASE}/auth/kakao/callback`,
    SIGNUP: `${API_BASE}/auth/signup`,
    ME: `${API_BASE}/auth/me`,
    LOGOUT: `${API_BASE}/auth/logout`,
    SESSIONS: `${API_BASE}/auth/sessions`,
  },

  // 예약
  RESERVATIONS: {
    BASE: `${API_BASE}/reservations`,
    byId: (id: string) => `${API_BASE}/reservations/${id}`,
    cancel: (id: string) => `${API_BASE}/reservations/${id}/cancel`,
    approve: (id: string) => `${API_BASE}/reservations/${id}/approve`,
    reject: (id: string) => `${API_BASE}/reservations/${id}/reject`,
    BATCH_APPROVE: `${API_BASE}/reservations/batch-approve`,
  },

  // 슬롯
  SLOTS: {
    BASE: `${API_BASE}/slots`,
    HOLD: `${API_BASE}/slots/hold`,
    cancelHold: (token: string) => `${API_BASE}/slots/hold/${token}`,
    GENERATE: `${API_BASE}/slots/generate`,
  },

  // 스튜디오 (공개)
  STUDIOS: {
    BASE: `${API_BASE}/studios`,
    byId: (id: string) => `${API_BASE}/studios/${id}`,
  },

  // 회원 관리
  MEMBERS: {
    BASE: `${API_BASE}/members`,
    byId: (id: string) => `${API_BASE}/members/${id}`,
  },

  // 관리자
  ADMIN: {
    SETTINGS: `${API_BASE}/admin/settings`,
    SERVICES: `${API_BASE}/admin/services`,
    serviceById: (id: string) => `${API_BASE}/admin/services/${id}`,
    TIERS: `${API_BASE}/admin/tiers`,
    BLACKOUTS: `${API_BASE}/admin/blackouts`,
    LOGS: `${API_BASE}/admin/logs`,
    FEATURE_FLAGS: `${API_BASE}/admin/feature-flags`,
    featureFlagById: (id: string) => `${API_BASE}/admin/feature-flags/${id}`,
    ANNOUNCEMENTS: `${API_BASE}/admin/announcements`,
    announcementById: (id: string) => `${API_BASE}/admin/announcements/${id}`,
    permissions: (operatorId: string) => `${API_BASE}/admin/permissions/${operatorId}`,
  },

  // 알림
  NOTIFICATIONS: {
    BASE: `${API_BASE}/notifications`,
    SETTINGS: `${API_BASE}/notifications/settings`,
    settingByEventType: (eventType: string) => `${API_BASE}/notifications/settings/${eventType}`,
  },

  // 운영자
  OPERATOR: {
    DASHBOARD: `${API_BASE}/operator/dashboard`,
    CHECKIN: `${API_BASE}/operator/checkin`,
    checkout: (id: string) => `${API_BASE}/operator/checkout/${id}`,
    FULFILLMENT: `${API_BASE}/operator/fulfillment`,
    fulfillmentById: (id: string) => `${API_BASE}/operator/fulfillment/${id}`,
    STATS: `${API_BASE}/operator/stats`,
  },
} as const;

export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
    sessions: ['auth', 'sessions'] as const,
  },
  reservations: {
    all: ['reservations'] as const,
    byId: (id: string) => ['reservations', id] as const,
    my: (params?: Record<string, unknown>) => ['reservations', 'my', params] as const,
  },
  slots: {
    byDate: (date: string, studioId?: string) =>
      ['slots', date, studioId].filter(Boolean) as string[],
  },
  studios: {
    all: ['studios'] as const,
    byId: (id: string) => ['studios', id] as const,
  },
  members: {
    all: ['members'] as const,
    byId: (id: string) => ['members', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
    settings: ['notifications', 'settings'] as const,
  },
  calendar: {
    monthly: (year: number, month: number) => ['calendar', 'monthly', year, month] as const,
    weekly: (date: string) => ['calendar', 'weekly', date] as const,
    daily: (date: string) => ['calendar', 'daily', date] as const,
  },
  admin: {
    settings: ['admin', 'settings'] as const,
    studios: ['admin', 'studios'] as const,
    services: ['admin', 'services'] as const,
    blackouts: ['admin', 'blackouts'] as const,
    tiers: ['admin', 'tiers'] as const,
    featureFlags: ['admin', 'feature-flags'] as const,
    announcements: ['admin', 'announcements'] as const,
    logs: (params?: Record<string, unknown>) => ['admin', 'logs', params] as const,
    permissions: (operatorId: string) => ['admin', 'permissions', operatorId] as const,
  },
  operator: {
    dashboard: ['operator', 'dashboard'] as const,
    fulfillment: ['operator', 'fulfillment'] as const,
    stats: ['operator', 'stats'] as const,
  },
} as const;
