import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

interface NotificationSettingItem {
  eventType: string;
  enabled: boolean;
  pushEnabled: boolean;
  alimtalkEnabled: boolean;
  templateCode: string | null;
  description: string | null;
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications.all, page],
    queryFn: () =>
      apiClient<{
        items: AppNotification[];
        meta: { total: number; page: number; limit: number };
      }>(`${API_ROUTES.NOTIFICATIONS.BASE}?page=${page}`),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`${API_ROUTES.NOTIFICATIONS.BASE}/${id}/read`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<void>(`${API_ROUTES.NOTIFICATIONS.BASE}/read-all`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all }),
  });
}

// 알림 설정 (관리자)
export function useNotificationSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.settings,
    queryFn: () => apiClient<NotificationSettingItem[]>(API_ROUTES.NOTIFICATIONS.SETTINGS),
  });
}

export function useUpdateNotificationSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      eventType: string;
      enabled?: boolean;
      pushEnabled?: boolean;
      alimtalkEnabled?: boolean;
      templateCode?: string | null;
    }) => {
      const { eventType, ...body } = params;
      return apiClient<void>(API_ROUTES.NOTIFICATIONS.settingByEventType(eventType), {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.settings }),
  });
}
