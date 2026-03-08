import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';

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

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requiresQuantity: boolean;
  requiresMemo: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface OperatorPermissions {
  operatorId: string;
  operatorName: string;
  permissions: {
    canApproveReservations: boolean;
    canManageCheckins: boolean;
    canManageFulfillment: boolean;
    canViewReports: boolean;
    canManageMembers: boolean;
  };
}

interface MemberItem {
  id: string;
  name: string;
  nickname: string;
  role: string;
  status: string;
}

// 운영 설정
export function useOperationSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.settings,
    queryFn: () => apiClient<OperationSetting[]>(API_ROUTES.ADMIN.SETTINGS),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { key: string; value: string }) =>
      apiClient<void>(API_ROUTES.ADMIN.SETTINGS, {
        method: 'PUT',
        body: JSON.stringify(params),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.settings }),
  });
}

// 스튜디오
export function useStudios() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.studios,
    queryFn: () => apiClient<StudioItem[]>(API_ROUTES.STUDIOS.BASE),
  });
}

export function useCreateStudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; capacity: number }) =>
      apiClient<StudioItem>(API_ROUTES.STUDIOS.BASE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.studios }),
  });
}

// 블랙아웃
export function useBlackouts() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.blackouts,
    queryFn: () => apiClient<BlackoutItem[]>(API_ROUTES.ADMIN.BLACKOUTS),
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
      apiClient<void>(API_ROUTES.ADMIN.BLACKOUTS, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.blackouts }),
  });
}

// 공지사항
export function useAnnouncements() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.announcements,
    queryFn: () => apiClient<AnnouncementItem[]>(API_ROUTES.ADMIN.ANNOUNCEMENTS),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; type: string }) =>
      apiClient<void>(API_ROUTES.ADMIN.ANNOUNCEMENTS, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.announcements }),
  });
}

// 기능 플래그
export function useFeatureFlags() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.featureFlags,
    queryFn: () => apiClient<FeatureFlagItem[]>(API_ROUTES.ADMIN.FEATURE_FLAGS),
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; enabled: boolean }) =>
      apiClient<void>(API_ROUTES.ADMIN.featureFlagById(params.id), {
        method: 'PATCH',
        body: JSON.stringify({ enabled: params.enabled }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.featureFlags }),
  });
}

// 시스템 로그
export function useSystemLogs(params?: { page?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.logs(params),
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      return apiClient<{ items: SystemLogItem[]; meta: { total: number } }>(
        `${API_ROUTES.ADMIN.LOGS}?${sp.toString()}`,
      );
    },
  });
}

// 부가서비스
export function useAdminServices() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.services,
    queryFn: () => apiClient<ServiceItem[]>(API_ROUTES.ADMIN.SERVICES),
  });
}

// 운영자 목록 (권한 관리용)
export function useOperatorList() {
  return useQuery({
    queryKey: [...QUERY_KEYS.members.all, 'operators'],
    queryFn: () =>
      apiClient<{ items: MemberItem[]; meta: { total: number } }>(
        `${API_ROUTES.MEMBERS.BASE}?role=OPERATOR&limit=100`,
      ),
  });
}

// 운영자 권한 조회
export function useOperatorPermissions(operatorId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.permissions(operatorId ?? ''),
    queryFn: () => apiClient<OperatorPermissions>(API_ROUTES.ADMIN.permissions(operatorId ?? '')),
    enabled: !!operatorId,
  });
}

// 운영자 권한 업데이트
export function useUpdatePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { operatorId: string; permissions: OperatorPermissions['permissions'] }) =>
      apiClient<void>(API_ROUTES.ADMIN.permissions(params.operatorId), {
        method: 'PATCH',
        body: JSON.stringify({ permissions: params.permissions }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.admin.permissions(variables.operatorId),
      });
    },
  });
}
