import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useState } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  AlertOctagon,
  Building2,
} from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';
import { useAdminStats } from '@/hooks/useStats';

type Period = 'week' | 'month' | 'quarter';

/**
 * 관리자 대시보드 — 전체 통계 + 차트
 */
export default function AdminDashboardScreen() {
  const [period, setPeriod] = useState<Period>('month');
  const { data, isLoading } = useAdminStats(period);

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} className="mt-12" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <StyledText variant="heading-lg" className="mb-2">
          통계 대시보드
        </StyledText>

        {/* 기간 선택 */}
        <View className="flex-row mb-4">
          {([
            { key: 'week' as const, label: '주간' },
            { key: 'month' as const, label: '월간' },
            { key: 'quarter' as const, label: '분기' },
          ]).map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              className={`mr-2 px-3 py-1.5 rounded-chip ${period === key ? 'bg-primary' : 'bg-neutral-100'}`}
            >
              <StyledText
                variant="label-md"
                className={period === key ? 'text-white' : 'text-neutral-600'}
              >
                {label}
              </StyledText>
            </Pressable>
          ))}
        </View>

        {/* 핵심 지표 */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <GlassCard className="flex-1 min-w-[45%] p-4">
            <Users size={18} color={COLORS.primary.DEFAULT} />
            <StyledText variant="display-sm" className="mt-2">
              {String(data?.totalMembers ?? 0)}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">총 회원</StyledText>
          </GlassCard>

          <GlassCard className="flex-1 min-w-[45%] p-4">
            <Calendar size={18} color={COLORS.secondary.DEFAULT} />
            <StyledText variant="display-sm" className="mt-2">
              {String(data?.monthlyReservations ?? 0)}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">월간 예약</StyledText>
          </GlassCard>

          <GlassCard className="flex-1 min-w-[45%] p-4">
            <TrendingUp size={18} color={COLORS.success} />
            <StyledText variant="display-sm" className="mt-2">
              {data?.averageOccupancyRate != null
                ? `${(data.averageOccupancyRate * 100).toFixed(0)}%`
                : '-'}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">가동률</StyledText>
          </GlassCard>

          <GlassCard className="flex-1 min-w-[45%] p-4">
            <AlertOctagon size={18} color={COLORS.error.DEFAULT} />
            <StyledText variant="display-sm" className="mt-2">
              {data?.noShowRate != null
                ? `${(data.noShowRate * 100).toFixed(1)}%`
                : '-'}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">노쇼율</StyledText>
          </GlassCard>
        </View>

        {/* 일별 예약 추이 (텍스트 기반 — 차트 라이브러리 연동 시 교체) */}
        <GlassCard className="p-5 mb-4">
          <StyledText variant="heading-sm" className="mb-3">
            일별 예약 추이
          </StyledText>
          {data?.dailyReservations?.map((d) => (
            <View key={d.date} className="flex-row items-center mb-1">
              <StyledText variant="caption" className="w-20 text-neutral-500">
                {d.date.slice(5)}
              </StyledText>
              <View className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${Math.min(d.count * 10, 100)}%`,
                  }}
                />
              </View>
              <StyledText variant="label-sm" className="w-8 text-right">
                {String(d.count)}
              </StyledText>
            </View>
          ))}
        </GlassCard>

        {/* 스튜디오 가동률 */}
        <GlassCard className="p-5 mb-4">
          <StyledText variant="heading-sm" className="mb-3">
            스튜디오 가동률
          </StyledText>
          {data?.studioUtilization?.map((s) => (
            <View key={s.studioName} className="flex-row items-center mb-2">
              <Building2 size={14} color={COLORS.neutral[500]} />
              <StyledText variant="body-md" className="flex-1 ml-2">
                {s.studioName}
              </StyledText>
              <StyledText variant="label-md" className="text-primary font-medium">
                {(s.rate * 100).toFixed(0)}%
              </StyledText>
            </View>
          ))}
        </GlassCard>

        {/* 티어 분포 */}
        <GlassCard className="p-5">
          <StyledText variant="heading-sm" className="mb-3">
            회원 티어 분포
          </StyledText>
          {data?.tierDistribution?.map((t) => (
            <View key={t.tier} className="flex-row items-center justify-between mb-2">
              <StyledText variant="body-md">{t.tier}</StyledText>
              <StyledText variant="label-md" className="font-medium">
                {String(t.count)}명
              </StyledText>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </Screen>
  );
}
