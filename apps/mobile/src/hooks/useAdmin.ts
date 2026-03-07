import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

interface OperationSetting {
  key: string;
  value: string;
  description: string;
}

interface StudioItem {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
}

interface BlackoutItem {
  id: string;
  studioId: string;
  studioName: string;
  startAt: string;
  endAt: string;
  type: string;
  reason: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isPublished: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

interface FeatureFlagItem {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
}

interface SystemLogItem {
  id: string;
  userId: string | null;
  action: string;
  target: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

// 운영 설정
export function useOperationSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiClient<OperationSetting[]>(`${API_BASE}/admin/settings`),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { key: string; value: string }) =>
      apiClient<void>(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        body: JSON.stringify(params),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
}

// 스튜디오
export function useStudios() {
  return useQuery({
    queryKey: ['admin', 'studios'],
    queryFn: () => apiClient<StudioItem[]>(`${API_BASE}/admin/studios`),
  });
}

export function useCreateStudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; capacity: number }) =>
      apiClient<StudioItem>(`${API_BASE}/admin/studios`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'studios'] }),
  });
}

// 블랙아웃
export function useBlackouts() {
  return useQuery({
    queryKey: ['admin', 'blackouts'],
    queryFn: () => apiClient<BlackoutItem[]>(`${API_BASE}/admin/blackouts`),
  });
}

export function useCreateBlackout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studioId: string;
      startAt: string;
      endAt: string;
      type: string;
      reason: string;
    }) =>
      apiClient<void>(`${API_BASE}/admin/blackouts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'blackouts'] }),
  });
}

// 공지사항
export function useAnnouncements() {
  return useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => apiClient<AnnouncementItem[]>(`${API_BASE}/admin/announcements`),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; type: string }) =>
      apiClient<void>(`${API_BASE}/admin/announcements`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'announcements'] }),
  });
}

// 기능 플래그
export function useFeatureFlags() {
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: () => apiClient<FeatureFlagItem[]>(`${API_BASE}/admin/feature-flags`),
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; enabled: boolean }) =>
      apiClient<void>(`${API_BASE}/admin/feature-flags/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: params.enabled }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }),
  });
}

// 시스템 로그
export function useSystemLogs(params?: { page?: number }) {
  return useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      return apiClient<{ items: SystemLogItem[]; meta: { total: number } }>(
        `${API_BASE}/admin/logs?${sp.toString()}`,
      );
    },
  });
}
