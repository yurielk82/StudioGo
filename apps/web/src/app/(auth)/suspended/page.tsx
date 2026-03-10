'use client';

import { ShieldAlert } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';

export default function SuspendedPage() {
  const logout = useLogout();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="bg-destructive/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <ShieldAlert className="text-destructive h-8 w-8" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">계정 정지</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          계정이 정지되었습니다.
          <br />
          자세한 사항은 운영팀에 문의해 주세요.
        </p>

        <a
          href="mailto:support@studiogo.kr"
          className="text-primary mt-4 inline-block text-sm font-medium underline"
        >
          support@studiogo.kr
        </a>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="border-border text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
