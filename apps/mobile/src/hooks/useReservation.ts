import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { QUERY_KEYS, API_ROUTES } from '@/constants/api';
import type { TimeSlot } from '@contracts/schemas/slot';
import type {
  ReservationSummary,
  ReservationDetail,
  CreateReservationRequest,
} from '@contracts/schemas/reservation';

interface HoldResult {
  holdToken: string;
  timeSlotId: string;
  expiresAt: string;
  status: string;
}

/**
 * 특정 날짜/스튜디오의 슬롯 목록 조회
 */
export function useSlots(date: string | null, studioId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.slots.byDate(date ?? '', studioId),
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (studioId) params.set('studioId', studioId);
      return apiClient<TimeSlot[]>(`${API_ROUTES.SLOTS.BASE}?${params.toString()}`);
    },
    enabled: !!date,
  });
}

/**
 * 슬롯 Hold 생성 (2분 임시 점유)
 */
export function useCreateHold() {
  return useMutation({
    mutationFn: (timeSlotId: string) =>
      apiClient<HoldResult>(API_ROUTES.SLOTS.HOLD, {
        method: 'POST',
        body: JSON.stringify({ timeSlotId }),
      }),
  });
}

/**
 * 슬롯 Hold 해제
 */
export function useCancelHold() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient<void>(API_ROUTES.SLOTS.cancelHold(token), {
        method: 'DELETE',
      }),
  });
}

/**
 * 예약 생성
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      apiClient<ReservationDetail>(API_ROUTES.RESERVATIONS.BASE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
    },
  });
}

/**
 * 내 예약 목록 조회
 */
export function useMyReservations(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.reservations.my(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', String(params.page));
      return apiClient<{
        items: ReservationSummary[];
        meta: { total: number; page: number; limit: number };
      }>(`${API_ROUTES.RESERVATIONS.BASE}?${searchParams.toString()}`);
    },
  });
}

/**
 * 예약 상세 조회
 */
export function useReservationDetail(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.reservations.byId(id ?? ''),
    queryFn: () => apiClient<ReservationDetail>(API_ROUTES.RESERVATIONS.byId(id ?? '')),
    enabled: !!id,
  });
}

/**
 * 예약 취소
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; reason: string }) =>
      apiClient<void>(API_ROUTES.RESERVATIONS.cancel(params.id), {
        method: 'POST',
        body: JSON.stringify({ reason: params.reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reservations.all });
    },
  });
}
