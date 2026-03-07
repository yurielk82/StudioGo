import { QueryProvider } from './QueryProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * 루트 프로바이더 조합 — QueryClient + 향후 확장
 * Phase 6에서 AuthProvider 추가 예정
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
