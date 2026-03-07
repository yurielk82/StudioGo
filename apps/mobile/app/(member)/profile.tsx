import { View, ScrollView } from 'react-native';
import { Trophy, BarChart2, TrendingUp, LogOut } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Button, Badge, Divider, COLORS } from '@/design-system';
import { useAuthStore } from '@/stores/auth-store';
import { useMemberStats } from '@/hooks/useStats';
import { useLogout } from '@/hooks/useAuth';

const TIER_VARIANT: Record<string, 'primary' | 'secondary' | 'warning' | 'neutral'> = {
  BRONZE: 'neutral',
  SILVER: 'neutral',
  GOLD: 'warning',
  PLATINUM: 'secondary',
  DIAMOND: 'primary',
};

/**
 * 프로필 탭 — 내 정보 + 방송 통계 + 티어
 */
export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useMemberStats();
  const logout = useLogout();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 프로필 헤더 */}
        <View className="mb-6 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            <StyledText variant="display-sm" className="text-primary">
              {user?.nickname?.charAt(0) ?? '?'}
            </StyledText>
          </View>
          <StyledText variant="heading-lg">{user?.nickname}</StyledText>
          <Badge variant={TIER_VARIANT[user?.tier ?? 'BRONZE'] ?? 'neutral'} className="mt-1">
            {user?.tier ?? 'BRONZE'}
          </Badge>
        </View>

        {/* 통계 카드 */}
        <View className="mb-4 flex-row gap-3">
          <GlassCard className="flex-1 items-center p-4">
            <BarChart2 size={20} color={COLORS.primary.DEFAULT} />
            <StyledText variant="display-sm" className="mt-1">
              {String(stats?.totalBroadcasts ?? 0)}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">
              총 방송
            </StyledText>
          </GlassCard>

          <GlassCard className="flex-1 items-center p-4">
            <TrendingUp size={20} color={COLORS.secondary.DEFAULT} />
            <StyledText variant="display-sm" className="mt-1">
              {String(stats?.monthlyBroadcasts ?? 0)}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">
              이번 달
            </StyledText>
          </GlassCard>

          <GlassCard className="flex-1 items-center p-4">
            <Trophy size={20} color={COLORS.warning} />
            <StyledText variant="display-sm" className="mt-1">
              {stats?.broadcastsUntilNextTier != null ? String(stats.broadcastsUntilNextTier) : '-'}
            </StyledText>
            <StyledText variant="caption" className="text-neutral-500">
              승급까지
            </StyledText>
          </GlassCard>
        </View>

        {/* 상세 통계 */}
        <GlassCard className="mb-4 p-5">
          <StyledText variant="heading-sm" className="mb-3">
            방송 통계
          </StyledText>

          <View className="mb-2 flex-row justify-between">
            <StyledText variant="body-md" className="text-neutral-500">
              평균 방송 시간
            </StyledText>
            <StyledText variant="body-md" className="font-medium">
              {stats?.averageDurationMinutes
                ? `${Math.round(stats.averageDurationMinutes)}분`
                : '-'}
            </StyledText>
          </View>

          <View className="mb-2 flex-row justify-between">
            <StyledText variant="body-md" className="text-neutral-500">
              노쇼율
            </StyledText>
            <StyledText
              variant="body-md"
              className={`font-medium ${(stats?.noShowRate ?? 0) > 0.1 ? 'text-error' : 'text-success'}`}
            >
              {stats?.noShowRate != null ? `${(stats.noShowRate * 100).toFixed(1)}%` : '-'}
            </StyledText>
          </View>

          <View className="flex-row justify-between">
            <StyledText variant="body-md" className="text-neutral-500">
              취소율
            </StyledText>
            <StyledText variant="body-md" className="font-medium">
              {stats?.cancellationRate != null
                ? `${(stats.cancellationRate * 100).toFixed(1)}%`
                : '-'}
            </StyledText>
          </View>
        </GlassCard>

        <Divider className="my-4" />

        <Button
          onPress={() => logout.mutate()}
          variant="ghost"
          fullWidth
          icon={<LogOut size={18} color={COLORS.error} />}
        >
          <StyledText className="text-error">로그아웃</StyledText>
        </Button>
      </ScrollView>
    </Screen>
  );
}
