'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useKakaoWebLogin } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kakaoLogin = useKakaoWebLogin();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get('code');
    if (!code) {
      router.replace('/login');
      return;
    }

    const redirectUri = `${window.location.origin}/callback`;

    kakaoLogin.mutate(
      { code, redirectUri },
      {
        onSuccess: (data) => {
          if (data.isNewUser) {
            router.replace('/signup');
            return;
          }
          if (data.user.status === 'PENDING') {
            router.replace('/pending');
            return;
          }
          const route =
            data.user.role === 'ADMIN'
              ? '/admin'
              : data.user.role === 'OPERATOR'
                ? '/operator'
                : '/member';
          router.replace(route);
        },
        onError: () => {
          router.replace('/login');
        },
      },
    );
  }, [searchParams, kakaoLogin, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="text-primary h-10 w-10 animate-spin" />
      <p className="text-muted-foreground text-sm">로그인 처리 중...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground text-sm">로그인 처리 중...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
