import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

/**
 * TanStack Query 프로바이더 — 서버 상태 관리
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            gcTime: GC_TIME_MS,
            retry: 2,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
