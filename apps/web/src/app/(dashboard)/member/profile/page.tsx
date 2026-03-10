'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, LogOut, Loader2, Radio, AlertCircle, CalendarCheck, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// ─── 타입 ──────────────────────────────────────────────────────────────────

interface MemberStats {
  totalBroadcasts: number;
  monthlyBroadcasts: number;
  noShowRate: number;
  cancelRate: number;
}

// ─── 상수 ──────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  BRONZE: {
    label: '브론즈',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  SILVER: {
    label: '실버',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  },
  GOLD: {
    label: '골드',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  PLATINUM: {
    label: '플래티넘',
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  DIAMOND: {
    label: '다이아몬드',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
};

const ROLE_LABELS: Record<string, string> = {
  MEMBER: '셀러',
  OPERATOR: '운영자',
  ADMIN: '관리자',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  APPROVED: {
    label: '활성',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  PENDING: {
    label: '승인 대기',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  SUSPENDED: {
    label: '정지',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  WITHDRAWN: {
    label: '탈퇴',
    className: 'bg-muted text-muted-foreground',
  },
};

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

function getInitial(nickname: string): string {
  return nickname.trim().charAt(0).toUpperCase();
}

function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

// ─── 커스텀 훅 ─────────────────────────────────────────────────────────────

function useMemberStats() {
  return useQuery<MemberStats>({
    queryKey: ['stats', 'member'],
    queryFn: () => apiClient<MemberStats>('/stats/member'),
    retry: false,
  });
}

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex animate-pulse flex-col items-center gap-4 py-8">
          <div className="bg-muted size-20 rounded-full" />
          <div className="space-y-2 text-center">
            <div className="bg-muted mx-auto h-6 w-32 rounded" />
            <div className="bg-muted mx-auto h-4 w-20 rounded" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="animate-pulse py-6">
              <div className="bg-muted mb-2 h-4 w-16 rounded" />
              <div className="bg-muted h-7 w-12 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description?: string;
}

function StatItem({ icon: Icon, label, value, description }: StatItemProps) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function MemberProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: stats, isLoading: statsLoading } = useMemberStats();

  const handleLogout = useCallback(() => {
    logout.mutate();
  }, [logout]);

  if (!user) {
    return <ProfileSkeleton />;
  }

  const tierConfig = TIER_CONFIG[user.tier] ?? {
    label: user.tier,
    className: 'bg-muted text-muted-foreground',
  };
  const statusConfig = STATUS_CONFIG[user.status] ?? {
    label: user.status,
    className: 'bg-muted text-muted-foreground',
  };
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <User className="size-6" />내 프로필
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">계정 정보와 활동 통계를 확인합니다.</p>
      </div>

      {/* 프로필 카드 */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* 아바타 */}
            <Avatar className="size-20 text-2xl">
              <AvatarImage src={user.profileImageUrl ?? undefined} alt={user.nickname} />
              <AvatarFallback className="text-2xl font-semibold">
                {getInitial(user.nickname)}
              </AvatarFallback>
            </Avatar>

            {/* 사용자 정보 */}
            <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
              <h3 className="text-xl font-bold">{user.nickname}</h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* 역할 뱃지 */}
                <Badge variant="secondary">{roleLabel}</Badge>

                {/* 티어 뱃지 */}
                <Badge className={tierConfig.className}>{tierConfig.label}</Badge>

                {/* 계정 상태 뱃지 */}
                <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 활동 통계 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">활동 통계</h3>
        {statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="animate-pulse py-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted size-10 rounded-xl" />
                    <div className="space-y-2">
                      <div className="bg-muted h-3 w-16 rounded" />
                      <div className="bg-muted h-6 w-10 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatItem
              icon={CalendarCheck}
              label="총 방송 횟수"
              value={stats ? String(stats.totalBroadcasts) : '—'}
              description="누적 완료 방송"
            />
            <StatItem
              icon={Radio}
              label="이번 달 방송"
              value={stats ? String(stats.monthlyBroadcasts) : '—'}
              description="이번 달 완료 방송"
            />
            <StatItem
              icon={AlertCircle}
              label="노쇼율"
              value={stats ? formatRate(stats.noShowRate) : '—'}
              description="전체 대비 노쇼 비율"
            />
            <StatItem
              icon={BarChart2}
              label="취소율"
              value={stats ? formatRate(stats.cancelRate) : '—'}
              description="전체 대비 취소 비율"
            />
          </div>
        )}
      </div>

      {/* 계정 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-6 pb-6">
          {/* 구분선 */}
          <Separator className="mb-4" />

          {/* 카카오 계정 정보 */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">카카오 계정</p>
              <p className="text-muted-foreground text-xs">카카오 OAuth로 연동된 계정입니다.</p>
            </div>
            <Badge variant="outline" className="shrink-0">
              연동됨
            </Badge>
          </div>

          <Separator />

          {/* 로그아웃 */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">로그아웃</p>
              <p className="text-muted-foreground text-xs">현재 기기에서 로그아웃합니다.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <LogOut className="size-4" />
                  로그아웃
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
