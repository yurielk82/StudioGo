'use client';

import Link from 'next/link';
import {
  CalendarPlus,
  ClipboardList,
  Calendar,
  Bell,
  Clock,
  Building2,
  Star,
  CalendarCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useMyReservations } from '@/hooks/useReservation';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ReservationSummary } from '@contracts/schemas/reservation';
import type { ReservationStatus } from '@contracts/enums';

// ── 상수 ──────────────────────────────────────────

const TIER_LABEL: Record<string, string> = {
  BRONZE: '브론즈',
  SILVER: '실버',
  GOLD: '골드',
  PLATINUM: '플래티넘',
  DIAMOND: '다이아몬드',
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인 완료',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
  NO_SHOW: '노쇼',
};

const STATUS_VARIANT: Record<
  ReservationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
  COMPLETED: 'secondary',
  NO_SHOW: 'destructive',
};

const QUICK_ACTIONS = [
  {
    href: '/member/reservations/new',
    icon: CalendarPlus,
    label: '새 예약',
    description: '스튜디오를 예약하세요',
  },
  {
    href: '/member/reservations',
    icon: ClipboardList,
    label: '예약 목록',
    description: '내 예약을 확인하세요',
  },
  {
    href: '/member/calendar',
    icon: Calendar,
    label: '캘린더',
    description: '일정을 한눈에 보세요',
  },
  {
    href: '/member/notifications',
    icon: Bell,
    label: '알림',
    description: '최신 알림을 확인하세요',
  },
] as const;

// ── 유틸 ──────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function formatTime(time: string): string {
  return time.substring(0, 5);
}

function getNextUpcoming(items: ReservationSummary[]): ReservationSummary | null {
  const today = new Date().toISOString().substring(0, 10);
  return (
    items
      .filter((r) => (r.status === 'PENDING' || r.status === 'APPROVED') && r.date >= today)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))[0] ?? null
  );
}

function countThisMonth(items: ReservationSummary[]): number {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return items.filter((r) => r.date.startsWith(ym)).length;
}

// ── 스켈레톤 ──────────────────────────────────────

function SkeletonStatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-card animate-pulse p-5">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <div className="bg-muted h-3 w-20 rounded" />
              <div className="bg-muted h-5 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonReservationList() {
  return (
    <div className="divide-border divide-y">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="bg-muted h-4 w-32 rounded" />
              <div className="bg-muted h-3 w-24 rounded" />
            </div>
            <div className="bg-muted h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────

export default function MemberHomePage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useMyReservations();

  const items = data?.items ?? [];
  const recentFive = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);
  const nextUpcoming = getNextUpcoming(items);
  const monthlyCount = countThisMonth(items);
  const tierLabel = TIER_LABEL[user?.tier ?? ''] ?? user?.tier ?? '—';

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div>
        <h2 className="text-2xl font-bold">안녕하세요, {user?.nickname ?? '셀러'}님 👋</h2>
        <p className="text-muted-foreground mt-1 text-sm">오늘도 성공적인 라이브 방송 되세요.</p>
      </div>

      {/* 통계 카드 */}
      {isLoading ? (
        <SkeletonStatCards />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Clock}
            label="다음 예약"
            value={nextUpcoming ? formatDate(nextUpcoming.date) : '없음'}
            description={
              nextUpcoming
                ? `${formatTime(nextUpcoming.startTime)} — ${nextUpcoming.studioName}`
                : '새 예약을 만들어 보세요'
            }
          />
          <StatCard
            icon={CalendarCheck}
            label="이번 달 예약"
            value={String(monthlyCount)}
            description="이번 달 총 예약 건수"
          />
          <StatCard
            icon={Star}
            label="나의 티어"
            value={tierLabel}
            description="현재 멤버십 등급"
          />
        </div>
      )}

      {/* 빠른 실행 */}
      <section>
        <h3 className="mb-4 text-base font-semibold">빠른 실행</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, description }) => (
            <Link key={href} href={href}>
              <Card className="hover:border-primary/50 cursor-pointer py-5 transition-colors">
                <CardContent className="flex flex-col items-center gap-3 px-5 text-center">
                  <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 예약 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">최근 예약</h3>
          <Link
            href="/member/reservations"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        <Card>
          <CardContent className="px-6 py-2">
            {isLoading ? (
              <SkeletonReservationList />
            ) : recentFive.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                예약 내역이 없습니다.
                <br />
                <Link
                  href="/member/reservations/new"
                  className="text-primary hover:text-primary/80 mt-1 inline-block font-medium"
                >
                  첫 예약 만들기 →
                </Link>
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {recentFive.map((reservation) => (
                  <li key={reservation.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                          <span className="truncate text-sm font-medium">
                            {reservation.studioName}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            {formatDate(reservation.date)}&nbsp;
                            {formatTime(reservation.startTime)}–{formatTime(reservation.endTime)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={STATUS_VARIANT[reservation.status]}>
                        {STATUS_LABEL[reservation.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
