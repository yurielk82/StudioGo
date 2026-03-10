/**
 * API 경로 + 쿼리 키 — 단일 소스
 * 각 앱에서 createApiRoutes(baseUrl)로 호출하여 사용
 */

export function createApiRoutes(baseUrl: string) {
  return {
    AUTH: {
      KAKAO_LOGIN: `${baseUrl}/auth/kakao`,
      KAKAO_CALLBACK: `${baseUrl}/auth/kakao/callback`,
      SIGNUP: `${baseUrl}/auth/signup`,
      ME: `${baseUrl}/auth/me`,
      LOGOUT: `${baseUrl}/auth/logout`,
      REFRESH: `${baseUrl}/auth/refresh`,
      SESSIONS: `${baseUrl}/auth/sessions`,
      devLogin: (role: string) => `${baseUrl}/auth/dev-login/${role}`,
    },

    RESERVATIONS: {
      BASE: `${baseUrl}/reservations`,
      byId: (id: string) => `${baseUrl}/reservations/${id}`,
      cancel: (id: string) => `${baseUrl}/reservations/${id}/cancel`,
      approve: (id: string) => `${baseUrl}/reservations/${id}/approve`,
      reject: (id: string) => `${baseUrl}/reservations/${id}/reject`,
      BATCH_APPROVE: `${baseUrl}/reservations/batch-approve`,
    },

    SLOTS: {
      BASE: `${baseUrl}/slots`,
      HOLD: `${baseUrl}/slots/hold`,
      cancelHold: (token: string) => `${baseUrl}/slots/hold/${token}`,
      GENERATE: `${baseUrl}/slots/generate`,
    },

    STUDIOS: {
      BASE: `${baseUrl}/studios`,
      byId: (id: string) => `${baseUrl}/studios/${id}`,
    },

    MEMBERS: {
      BASE: `${baseUrl}/members`,
      byId: (id: string) => `${baseUrl}/members/${id}`,
    },

    ADMIN: {
      SETTINGS: `${baseUrl}/admin/settings`,
      SERVICES: `${baseUrl}/admin/services`,
      serviceById: (id: string) => `${baseUrl}/admin/services/${id}`,
      TIERS: `${baseUrl}/admin/tiers`,
      BLACKOUTS: `${baseUrl}/admin/blackouts`,
      LOGS: `${baseUrl}/admin/logs`,
      FEATURE_FLAGS: `${baseUrl}/admin/feature-flags`,
      featureFlagById: (id: string) => `${baseUrl}/admin/feature-flags/${id}`,
      ANNOUNCEMENTS: `${baseUrl}/admin/announcements`,
      announcementById: (id: string) => `${baseUrl}/admin/announcements/${id}`,
      permissions: (operatorId: string) => `${baseUrl}/admin/permissions/${operatorId}`,
    },

    CALENDAR: {
      MONTHLY: `${baseUrl}/calendar/monthly`,
      WEEKLY: `${baseUrl}/calendar/weekly`,
      DAILY: `${baseUrl}/calendar/daily`,
    },

    NOTIFICATIONS: {
      BASE: `${baseUrl}/notifications`,
      SETTINGS: `${baseUrl}/notifications/settings`,
      settingByEventType: (eventType: string) => `${baseUrl}/notifications/settings/${eventType}`,
    },

    SERVICES: `${baseUrl}/services`,

    OPERATOR: {
      DASHBOARD: `${baseUrl}/operator/dashboard`,
      CHECKIN: `${baseUrl}/operator/checkin`,
      checkout: (id: string) => `${baseUrl}/operator/checkout/${id}`,
      FULFILLMENT: `${baseUrl}/operator/fulfillment`,
      fulfillmentById: (id: string) => `${baseUrl}/operator/fulfillment/${id}`,
      STATS: `${baseUrl}/operator/stats`,
    },
  } as const;
}

export type ApiRoutes = ReturnType<typeof createApiRoutes>;

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
  services: {
    all: ['services'] as const,
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
