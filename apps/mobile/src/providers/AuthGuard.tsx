import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore, selectIsLoggedIn } from '@/stores/auth-store';
import { useMe } from '@/hooks/useAuth';
import { COLORS } from '@/design-system';

/**
 * 인증 가드 — 로그인/승인 상태에 따라 라우트 자동 리다이렉트
 *
 * - 비로그인 → (public)
 * - 로그인 + PENDING + 추가정보 미입력 → (public)/signup
 * - 로그인 + PENDING + 추가정보 입력 완료 → (public)/pending
 * - 로그인 + SUSPENDED → (public)/suspended
 * - 로그인 + APPROVED + MEMBER → (member)
 * - 로그인 + APPROVED + OPERATOR → (operator)
 * - 로그인 + APPROVED + ADMIN → (admin)
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isInitialized, user } = useAuthStore();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  // 앱 시작 시 /auth/me 호출하여 인증 상태 복원
  useMe();

  useEffect(() => {
    if (!isInitialized) return;

    const currentGroup = segments[0] as string | undefined;

    if (!isLoggedIn) {
      // 비로그인인데 public이 아닌 곳 → 로그인 화면으로
      if (currentGroup !== '(public)') {
        router.replace('/(public)');
      }
      return;
    }

    // 로그인 상태에서 사용자 상태별 분기
    if (user?.status === 'PENDING') {
      // 추가정보 미입력 → signup, 입력 완료 → pending (승인 대기)
      const needsSignup = !user.nickname;
      const targetPage = needsSignup ? 'signup' : 'pending';

      if (currentGroup !== '(public)') {
        router.replace(`/(public)/${targetPage}`);
      } else {
        const currentPage = segments[1] as string | undefined;
        if (currentPage !== targetPage) {
          router.replace(`/(public)/${targetPage}`);
        }
      }
      return;
    }

    if (user?.status === 'SUSPENDED') {
      if (currentGroup !== '(public)') {
        router.replace('/(public)/suspended');
      } else {
        const currentPage = segments[1] as string | undefined;
        if (currentPage !== 'suspended') {
          router.replace('/(public)/suspended');
        }
      }
      return;
    }

    // APPROVED 사용자 — 역할별 홈으로
    if (currentGroup === '(public)') {
      const roleRoute = getRoleRoute(user?.role);
      router.replace(roleRoute);
    }
  }, [isInitialized, isLoggedIn, user?.status, user?.role, user?.nickname, segments]);

  // 초기화 전 로딩 표시
  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-dark-bg">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      </View>
    );
  }

  return <>{children}</>;
}

function getRoleRoute(role: string | null | undefined): '/(member)' | '/(operator)' | '/(admin)' {
  switch (role) {
    case 'OPERATOR':
      return '/(operator)';
    case 'ADMIN':
      return '/(admin)';
    default:
      return '/(member)';
  }
}
