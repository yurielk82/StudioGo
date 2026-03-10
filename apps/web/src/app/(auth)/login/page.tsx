'use client';

import { useRouter } from 'next/navigation';
import { useDevLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ?? '';
const IS_DEV = process.env.NODE_ENV === 'development';

const DEV_ROLES = [
  { role: 'member' as const, label: '셀러', color: 'bg-blue-500' },
  { role: 'operator' as const, label: '운영자', color: 'bg-green-500' },
  { role: 'admin' as const, label: '관리자', color: 'bg-purple-500' },
  { role: 'pending' as const, label: '승인대기', color: 'bg-yellow-500' },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const devLogin = useDevLogin();
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const handleKakaoLogin = () => {
    const redirectUri = `${window.location.origin}/callback`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  const handleDevLogin = (role: 'member' | 'operator' | 'admin' | 'pending') => {
    devLogin.mutate(role, {
      onSuccess: (data) => {
        if (data.user.status === 'PENDING') {
          router.push('/pending');
        } else {
          const route =
            data.user.role === 'ADMIN'
              ? '/admin'
              : data.user.role === 'OPERATOR'
                ? '/operator'
                : '/member';
          router.push(route);
        }
      },
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="from-primary-500/5 via-background to-secondary-50/30 flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold">
            SG
          </div>
          <h1 className="mt-4 text-2xl font-bold">StudioGo</h1>
          <p className="text-muted-foreground mt-1 text-sm">라이브커머스 스튜디오 예약 플랫폼</p>
        </div>

        {/* 카카오 로그인 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="bg-kakao text-kakao-text hover:bg-kakao-active flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.758 5.108 4.415 6.484-.194.727-.703 2.636-.806 3.044-.128.507.186.5.39.364.161-.107 2.563-1.742 3.606-2.45.77.11 1.568.168 2.395.168 5.523 0 10-3.463 10-7.691C22 6.463 17.523 3 12 3" />
          </svg>
          카카오로 시작하기
        </button>

        {/* 개발용 로그인 */}
        {IS_DEV && (
          <div className="border-border mt-8 rounded-xl border border-dashed p-4">
            <p className="text-muted-foreground mb-3 text-center text-xs font-medium">
              개발용 로그인
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEV_ROLES.map(({ role, label, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDevLogin(role)}
                  disabled={devLogin.isPending}
                  className={`rounded-lg ${color} px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50`}
                >
                  {devLogin.isPending ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
