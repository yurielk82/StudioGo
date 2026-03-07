import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { QUERY_KEYS } from '@/constants/api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

interface DashboardData {
  todayReservations: number;
  pendingApprovals: number;
  activeStudios: number;
  todayCheckins: number;
  recentReservations: {
    id: string;
    reservationNumber: string;
    userName: string;
    studioName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }[];
}

interface MemberItem {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  tier: string;
  status: string;
  totalBroadcasts: number;
  lastLoginAt: string | null;
}

interface FulfillmentItem {
  id: string;
  reservationNumber: string;
  userName: string;
  status: string;
  courier: string | null;
  trackingNumber: string | null;
  createdAt: string;
}

export function useOperatorDashboard() {
  return useQuery({
    queryKey: ['operator', 'dashboard'],
    queryFn: () => apiClient<DashboardData>(`${API_BASE}/operator/dashboard`),
  });
}

export function useApproveReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`${API_BASE}/reservations/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
      queryClient.invalidateQueries({ queryKey: ['operator', 'dashboard'] });
    },
  });
}

export function useRejectReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; reason: string }) =>
      apiClient<void>(`${API_BASE}/reservations/${params.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: params.reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
      queryClient.invalidateQueries({ queryKey: ['operator', 'dashboard'] });
    },
  });
}

export function useBatchApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient<void>(`${API_BASE}/reservations/batch-approve`, {
        method: 'POST',
        body: JSON.stringify({ reservationIds: ids }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
      queryClient.invalidateQueries({ queryKey: ['operator', 'dashboard'] });
    },
  });
}

export function useMembers(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['operator', 'members', params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set('status', params.status);
      if (params?.search) sp.set('search', params.search);
      return apiClient<{ items: MemberItem[]; meta: { total: number } }>(
        `${API_BASE}/operator/members?${sp.toString()}`,
      );
    },
  });
}

export function useCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { reservationId: string; method: 'QR' | 'PIN' | 'MANUAL' }) =>
      apiClient<void>(`${API_BASE}/operator/checkin`, {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator', 'dashboard'] });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) =>
      apiClient<void>(`${API_BASE}/operator/checkout`, {
        method: 'POST',
        body: JSON.stringify({ reservationId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator', 'dashboard'] });
    },
  });
}

export function useFulfillmentTasks(params?: { status?: string }) {
  return useQuery({
    queryKey: ['operator', 'fulfillment', params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set('status', params.status);
      return apiClient<{ items: FulfillmentItem[] }>(
        `${API_BASE}/operator/fulfillment?${sp.toString()}`,
      );
    },
  });
}

export function useUpdateFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; status: string; courier?: string; trackingNumber?: string }) =>
      apiClient<void>(`${API_BASE}/operator/fulfillment/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator', 'fulfillment'] });
    },
  });
}
