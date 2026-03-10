'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';

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
    queryKey: QUERY_KEYS.operator.dashboard,
    queryFn: () => apiClient<DashboardData>(API_ROUTES.OPERATOR.DASHBOARD),
  });
}

export function useApproveReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(API_ROUTES.RESERVATIONS.approve(id), { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.operator.dashboard });
    },
  });
}

export function useRejectReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; reason: string }) =>
      apiClient<void>(API_ROUTES.RESERVATIONS.reject(params.id), {
        method: 'POST',
        body: JSON.stringify({ reason: params.reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.operator.dashboard });
    },
  });
}

export function useBatchApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient<void>(API_ROUTES.RESERVATIONS.BATCH_APPROVE, {
        method: 'POST',
        body: JSON.stringify({ reservationIds: ids }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.operator.dashboard });
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
      const qs = sp.toString();
      const url = qs ? `${API_ROUTES.MEMBERS.BASE}?${qs}` : API_ROUTES.MEMBERS.BASE;
      return apiClient<{ items: MemberItem[]; meta: { total: number } }>(url);
    },
  });
}

export function useCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { reservationId: string; method: 'QR' | 'PIN' | 'MANUAL' }) =>
      apiClient<void>(API_ROUTES.OPERATOR.CHECKIN, {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.operator.dashboard });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) =>
      apiClient<void>(API_ROUTES.OPERATOR.checkout(reservationId), {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.operator.dashboard });
    },
  });
}

export function useFulfillmentTasks(params?: { status?: string }) {
  return useQuery({
    queryKey: ['operator', 'fulfillment', params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set('status', params.status);
      const qs = sp.toString();
      const url = qs ? `${API_ROUTES.OPERATOR.FULFILLMENT}?${qs}` : API_ROUTES.OPERATOR.FULFILLMENT;
      return apiClient<{ items: FulfillmentItem[] }>(url);
    },
  });
}

export function useUpdateFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id: string;
      status: string;
      courier?: string;
      trackingNumber?: string;
    }) =>
      apiClient<void>(API_ROUTES.OPERATOR.fulfillmentById(params.id), {
        method: 'PATCH',
        body: JSON.stringify(params),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.operator.fulfillment });
    },
  });
}
