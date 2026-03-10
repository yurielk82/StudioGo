'use client';

import Link from 'next/link';
import { CalendarCheck, Clock, Building2, ScanLine, ClipboardList, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/StatCard';
import { useOperatorDashboard } from '@/hooks/useOperator';

const STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인',
  REJECTED: '거절',
  CANCELLED: '취소',
  CHECKED_IN: '체크인',
  CHECKED_OUT: '완료',
  NO_SHOW: '노쇼',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
  CHECKED_IN: 'default',
  CHECKED_OUT: 'secondary',
  NO_SHOW: 'destructive',
};

function StatCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-10" />
        </div>
      </div>
    </div>
  );
}

function ReservationTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20 flex-1" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function OperatorDashboardPage() {
  const { data, isLoading, isError } = useOperatorDashboard();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">운영자 대시보드</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          오늘의 스튜디오 운영 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 4개 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={CalendarCheck}
              label="오늘 예약"
              value={isError ? '—' : String(data?.todayReservations ?? 0)}
            />
            <StatCard
              icon={Clock}
              label="승인 대기"
              value={isError ? '—' : String(data?.pendingApprovals ?? 0)}
            />
            <StatCard
              icon={Building2}
              label="활성 스튜디오"
              value={isError ? '—' : String(data?.activeStudios ?? 0)}
            />
            <StatCard
              icon={ScanLine}
              label="오늘 체크인"
              value={isError ? '—' : String(data?.todayCheckins ?? 0)}
            />
          </>
        )}
      </div>

      {/* 최근 예약 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">최근 예약</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ReservationTableSkeleton />
          ) : isError ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
          ) : !data?.recentReservations?.length ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              최근 예약 내역이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pr-4 pb-2 font-medium">예약번호</th>
                    <th className="pr-4 pb-2 font-medium">셀러</th>
                    <th className="pr-4 pb-2 font-medium">스튜디오</th>
                    <th className="pr-4 pb-2 font-medium">일시</th>
                    <th className="pb-2 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recentReservations.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="text-muted-foreground py-2.5 pr-4 font-mono text-xs">
                        {r.reservationNumber}
                      </td>
                      <td className="py-2.5 pr-4">{r.userName}</td>
                      <td className="py-2.5 pr-4">{r.studioName}</td>
                      <td className="text-muted-foreground py-2.5 pr-4 whitespace-nowrap">
                        {r.date} {r.startTime}–{r.endTime}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={STATUS_VARIANT[r.status] ?? 'outline'}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 빠른 이동 버튼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">빠른 이동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/operator/reservations">
                <ClipboardList className="mr-2 h-4 w-4" />
                예약 관리
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/operator/members">
                <Users className="mr-2 h-4 w-4" />
                회원 관리
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/operator/checkin">
                <ScanLine className="mr-2 h-4 w-4" />
                체크인
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
