'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CalendarCheck, Users, Activity, DollarSign } from 'lucide-react';

import { apiClient } from '@/lib/api/client';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── 타입 ──────────────────────────────────────────────────────────────────

interface OperatorStats {
  totalReservations: number;
  weeklyReservations: number;
  totalMembers: number;
  approvedMembers: number;
}

// ── 차트 목 데이터 (API 미제공 필드) ──────────────────────────────────────

const RESERVATION_TREND: { date: string; count: number }[] = [
  { date: '3/4', count: 8 },
  { date: '3/5', count: 14 },
  { date: '3/6', count: 11 },
  { date: '3/7', count: 18 },
  { date: '3/8', count: 7 },
  { date: '3/9', count: 21 },
  { date: '3/10', count: 15 },
];

const STUDIO_UTILIZATION: { name: string; rate: number }[] = [
  { name: '스튜디오 A', rate: 82 },
  { name: '스튜디오 B', rate: 67 },
  { name: '스튜디오 C', rate: 91 },
  { name: '스튜디오 D', rate: 55 },
];

const CHART_COLOR_AREA = '#6C5CE7';
const CHART_COLOR_BAR = '#00D2D3';

// ── 스켈레톤 ──────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="glass-card animate-pulse p-5">
      <div className="flex items-center gap-3">
        <div className="bg-muted h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <div className="bg-muted h-3 w-20 rounded" />
          <div className="bg-muted h-6 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<OperatorStats>({
    queryKey: QUERY_KEYS.operator.stats,
    queryFn: () => apiClient<OperatorStats>(API_ROUTES.OPERATOR.STATS),
  });

  // 가동률: 스튜디오 목 데이터 평균값 (API 미제공)
  const avgUtilization = Math.round(
    STUDIO_UTILIZATION.reduce((sum, s) => sum + s.rate, 0) / STUDIO_UTILIZATION.length,
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">관리자 대시보드</h2>
        <p className="text-muted-foreground mt-1 text-sm">StudioGo 전체 운영 현황을 확인하세요.</p>
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
              label="총 예약"
              value={stats ? String(stats.totalReservations) : '—'}
              description={`이번 주 ${stats?.weeklyReservations ?? 0}건`}
            />
            <StatCard
              icon={Users}
              label="활성 회원"
              value={stats ? String(stats.approvedMembers) : '—'}
              description={`전체 ${stats?.totalMembers ?? 0}명 중 승인됨`}
            />
            <StatCard
              icon={Activity}
              label="평균 가동률"
              value={`${avgUtilization}%`}
              description="스튜디오 4개 기준"
            />
            <StatCard
              icon={DollarSign}
              label="이번 달 매출"
              value="준비 중"
              description="정산 모듈 연동 예정"
            />
          </>
        )}
      </div>

      {/* 차트 2개 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 예약 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">예약 추이 (최근 7일)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={RESERVATION_TREND}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLOR_AREA} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLOR_AREA} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(128,128,128,0.2)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value}건`, '예약']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_COLOR_AREA}
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 스튜디오별 가동률 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">스튜디오별 가동률</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={STUDIO_UTILIZATION}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(128,128,128,0.2)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value}%`, '가동률']}
                />
                <Bar dataKey="rate" fill={CHART_COLOR_BAR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
