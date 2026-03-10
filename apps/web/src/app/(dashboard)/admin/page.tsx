'use client';

import { useState } from 'react';
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
import { CalendarCheck, Users, Activity, TrendingDown } from 'lucide-react';

import { useAdminStats } from '@/hooks/useAdmin';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CHART_COLOR_AREA = '#6C5CE7';
const CHART_COLOR_BAR = '#00D2D3';

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

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="bg-muted h-5 w-40 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="bg-muted h-[220px] animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

function formatChartDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

const PERIOD_LABELS = { week: '최근 7일', month: '최근 30일', quarter: '최근 90일' } as const;

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const { data: stats, isLoading } = useAdminStats(period);

  const chartData =
    stats?.dailyReservations.map((d) => ({
      date: formatChartDate(d.date),
      count: d.count,
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">관리자 대시보드</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            StudioGo 전체 운영 현황을 확인하세요.
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">최근 7일</SelectItem>
            <SelectItem value="month">최근 30일</SelectItem>
            <SelectItem value="quarter">최근 90일</SelectItem>
          </SelectContent>
        </Select>
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
              description={`${PERIOD_LABELS[period]} ${stats?.monthlyReservations ?? 0}건`}
            />
            <StatCard
              icon={Users}
              label="활성 회원"
              value={stats ? String(stats.activeMembers) : '—'}
              description={`전체 ${stats?.totalMembers ?? 0}명 중 승인됨`}
            />
            <StatCard
              icon={Activity}
              label="평균 가동률"
              value={stats ? `${stats.averageOccupancyRate}%` : '—'}
              description={`스튜디오 ${stats?.studioUtilization.length ?? 0}개 기준`}
            />
            <StatCard
              icon={TrendingDown}
              label="노쇼 / 취소율"
              value={stats ? `${stats.noShowRate}% / ${stats.cancellationRate}%` : '—'}
              description="전체 예약 기준"
            />
          </>
        )}
      </div>

      {/* 차트 2개 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* 예약 추이 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  예약 추이 ({PERIOD_LABELS[period]})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLOR_AREA} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLOR_AREA} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
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
                    data={
                      stats?.studioUtilization.map((s) => ({
                        name: s.studioName,
                        rate: s.rate,
                      })) ?? []
                    }
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
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
          </>
        )}
      </div>
    </div>
  );
}
