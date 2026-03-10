'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, selectIsLoggedIn } from '@/stores/auth-store';
import { useMe } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * 인증 가드 — 로그인/승인 상태에 따라 라우트 자동 리다이렉트
 *
 * - 비로그인 → /login
 * - 로그인 + PENDING + 추가정보 미입력 → /signup
 * - 로그인 + PENDING + 추가정보 입력 완료 → /pending
 * - 로그인 + SUSPENDED → /suspended
 * - 로그인 + APPROVED + MEMBER → /member
 * - 로그인 + APPROVED + OPERATOR → /operator
 * - 로그인 + APPROVED + ADMIN → /admin
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInitialized, user } = useAuthStore();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  useMe();

  useEffect(() => {
    if (!isInitialized) return;

    const isAuthPage =
      pathname.startsWith('/login') ||
      pathname.startsWith('/callback') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/pending') ||
      pathname.startsWith('/suspended');

    if (!isLoggedIn) {
      if (!isAuthPage) {
        router.replace('/login');
      }
      return;
    }

    // PENDING 사용자
    if (user?.status === 'PENDING') {
      const needsSignup = !user.nickname;
      const target = needsSignup ? '/signup' : '/pending';
      if (pathname !== target) {
        router.replace(target);
      }
      return;
    }

    // SUSPENDED 사용자
    if (user?.status === 'SUSPENDED') {
      if (pathname !== '/suspended') {
        router.replace('/suspended');
      }
      return;
    }

    // APPROVED — 인증 페이지에 있으면 역할별 홈으로
    if (isAuthPage) {
      router.replace(getRoleRoute(user?.role));
    }
  }, [isInitialized, isLoggedIn, user?.status, user?.role, user?.nickname, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

function getRoleRoute(role: string | null | undefined): string {
  switch (role) {
    case 'OPERATOR':
      return '/operator';
    case 'ADMIN':
      return '/admin';
    default:
      return '/member';
  }
}
