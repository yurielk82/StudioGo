import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { QUERY_KEYS } from '@/constants/api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

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
      apiClient<MonthlyData>(
        `${API_BASE}/calendar/monthly?year=${year}&month=${month}`,
      ),
  });
}

export function useWeeklyCalendar(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.calendar.weekly(date),
    queryFn: () =>
      apiClient<WeeklyData>(`${API_BASE}/calendar/weekly?date=${date}`),
    enabled: !!date,
  });
}

export function useDailyCalendar(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.calendar.daily(date),
    queryFn: () =>
      apiClient<DailyData>(`${API_BASE}/calendar/daily?date=${date}`),
    enabled: !!date,
  });
}
