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
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  calendar: {
    monthly: (year: number, month: number) => ['calendar', 'monthly', year, month] as const,
    weekly: (date: string) => ['calendar', 'weekly', date] as const,
    daily: (date: string) => ['calendar', 'daily', date] as const,
  },
} as const;
