import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';

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

/** 활성 부가서비스 목록 조회 (MEMBER+ 권한) */
export function useServices() {
  return useQuery({
    queryKey: QUERY_KEYS.services.all,
    queryFn: () => apiClient<ServiceItem[]>(API_ROUTES.SERVICES),
  });
}
