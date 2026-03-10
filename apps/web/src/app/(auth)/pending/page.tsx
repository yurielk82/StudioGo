'use client';

import { Clock } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';

export default function PendingPage() {
  const logout = useLogout();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="bg-warning/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <Clock className="text-warning h-8 w-8" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">승인 대기 중</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          가입 신청이 완료되었습니다.
          <br />
          운영자 승인 후 서비스를 이용할 수 있습니다.
          <br />
          승인 완료 시 카카오 알림톡으로 안내드리겠습니다.
        </p>

        <button
          type="button"
          onClick={() => logout.mutate()}
          className="border-border text-muted-foreground hover:bg-accent hover:text-foreground mt-8 rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
