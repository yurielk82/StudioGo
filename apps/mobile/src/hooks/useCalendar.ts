import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';

interface CalendarSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reservationId?: string;
  studioName: string;
}

interface MonthlyData {
  year: number;
  month: number;
  days: {
    date: string;
    hasReservation: boolean;
    reservationCount: number;
    statuses: string[];
  }[];
}

interface WeeklyData {
  startDate: string;
  endDate: string;
  slots: CalendarSlot[];
}

interface DailyData {
  date: string;
  slots: CalendarSlot[];
}

export function useMonthlyCalendar(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.calendar.monthly(year, month),
    queryFn: () =>
      apiClient<MonthlyData>(`${API_ROUTES.CALENDAR.MONTHLY}?year=${year}&month=${month}`),
  });
}

export function useWeeklyCalendar(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.calendar.weekly(date),
    queryFn: () => apiClient<WeeklyData>(`${API_ROUTES.CALENDAR.WEEKLY}?date=${date}`),
    enabled: !!date,
  });
}

export function useDailyCalendar(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.calendar.daily(date),
    queryFn: () => apiClient<DailyData>(`${API_ROUTES.CALENDAR.DAILY}?date=${date}`),
    enabled: !!date,
  });
}
