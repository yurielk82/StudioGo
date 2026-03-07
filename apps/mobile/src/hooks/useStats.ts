import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

interface MemberStats {
  totalBroadcasts: number;
  monthlyBroadcasts: number;
  averageDurationMinutes: number;
  noShowRate: number;
  cancellationRate: number;
  tier: string;
  broadcastsUntilNextTier: number | null;
}

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  totalReservations: number;
  monthlyReservations: number;
  averageOccupancyRate: number;
  monthlyRevenue: number;
  noShowRate: number;
  cancellationRate: number;
  tierDistribution: { tier: string; count: number }[];
  dailyReservations: { date: string; count: number }[];
  studioUtilization: { studioName: string; rate: number }[];
}

export function useMemberStats() {
  return useQuery({
    queryKey: ['stats', 'member'],
    queryFn: () => apiClient<MemberStats>(`${API_BASE}/stats/member`),
  });
}

export function useAdminStats(period: 'week' | 'month' | 'quarter' = 'month') {
  return useQuery({
    queryKey: ['stats', 'admin', period],
    queryFn: () => apiClient<AdminStats>(`${API_BASE}/stats/admin?period=${period}`),
  });
}
