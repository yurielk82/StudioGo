import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Users,
  ClipboardCheck,
  Package,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Badge, COLORS } from '@/design-system';
import { useOperatorDashboard, useApproveReservation, useRejectReservation } from '@/hooks/useOperator';
import { Button } from '@/design-system';

const STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
};

/**
 * 운영자 대시보드 — 오늘의 현황 + 대기 예약 빠른 처리
 */
export default function OperatorDashboardScreen() {
  const router = useRouter();
  const { data, isLoading } = useOperatorDashboard();
  const approve = useApproveReservation();

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        운영자 대시보드
      </StyledText>

      {/* 통계 카드 */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        <GlassCard className="flex-1 min-w-[45%] p-4">
          <View className="flex-row items-center mb-2">
            <Calendar size={18} color={COLORS.primary.DEFAULT} />
            <StyledText variant="label-md" className="ml-2 text-neutral-500">
              오늘 예약
            </StyledText>
          </View>
          <StyledText variant="display-sm">
            {String(data?.todayReservations ?? 0)}
          </StyledText>
        </GlassCard>

        <GlassCard className="flex-1 min-w-[45%] p-4">
          <View className="flex-row items-center mb-2">
            <Clock size={18} color={COLORS.warning.DEFAULT} />
            <StyledText variant="label-md" className="ml-2 text-neutral-500">
              승인 대기
            </StyledText>
          </View>
          <StyledText variant="display-sm" className="text-warning">
            {String(data?.pendingApprovals ?? 0)}
          </StyledText>
        </GlassCard>

        <GlassCard className="flex-1 min-w-[45%] p-4">
          <View className="flex-row items-center mb-2">
            <ClipboardCheck size={18} color={COLORS.success} />
            <StyledText variant="label-md" className="ml-2 text-neutral-500">
              오늘 체크인
            </StyledText>
          </View>
          <StyledText variant="display-sm">
            {String(data?.todayCheckins ?? 0)}
          </StyledText>
        </GlassCard>

        <GlassCard className="flex-1 min-w-[45%] p-4">
          <View className="flex-row items-center mb-2">
            <Users size={18} color={COLORS.secondary.DEFAULT} />
            <StyledText variant="label-md" className="ml-2 text-neutral-500">
              활성 스튜디오
            </StyledText>
          </View>
          <StyledText variant="display-sm">
            {String(data?.activeStudios ?? 0)}
          </StyledText>
        </GlassCard>
      </View>

      {/* 빠른 메뉴 */}
      <View className="flex-row gap-3 mb-6">
        <Pressable onPress={() => router.push('/(operator)/reservations')} className="flex-1">
          <GlassCard className="p-3 items-center">
            <Calendar size={20} color={COLORS.primary.DEFAULT} />
            <StyledText variant="label-sm" className="mt-1">예약 관리</StyledText>
          </GlassCard>
        </Pressable>
        <Pressable onPress={() => router.push('/(operator)/members')} className="flex-1">
          <GlassCard className="p-3 items-center">
            <Users size={20} color={COLORS.primary.DEFAULT} />
            <StyledText variant="label-sm" className="mt-1">회원 관리</StyledText>
          </GlassCard>
        </Pressable>
        <Pressable onPress={() => router.push('/(operator)/checkin')} className="flex-1">
          <GlassCard className="p-3 items-center">
            <ClipboardCheck size={20} color={COLORS.primary.DEFAULT} />
            <StyledText variant="label-sm" className="mt-1">체크인</StyledText>
          </GlassCard>
        </Pressable>
        <Pressable onPress={() => router.push('/(operator)/fulfillment')} className="flex-1">
          <GlassCard className="p-3 items-center">
            <Package size={20} color={COLORS.primary.DEFAULT} />
            <StyledText variant="label-sm" className="mt-1">출고</StyledText>
          </GlassCard>
        </Pressable>
      </View>

      {/* 최근 대기 예약 */}
      <StyledText variant="heading-sm" className="mb-3">
        승인 대기 예약
      </StyledText>
      <FlatList
        data={data?.recentReservations?.filter((r) => r.status === 'PENDING') ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard className="p-4 mb-2">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <StyledText variant="body-lg" className="font-medium">
                  {item.userName}
                </StyledText>
                <StyledText variant="body-sm" className="text-neutral-500">
                  {item.studioName} · {item.date} {item.startTime}
                </StyledText>
              </View>
              <Badge variant="warning">{STATUS_LABEL[item.status] ?? item.status}</Badge>
            </View>
            <View className="flex-row gap-2 mt-2">
              <Button
                size="sm"
                onPress={() => approve.mutate(item.id)}
                loading={approve.isPending}
                className="flex-1"
              >
                승인
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => router.push(`/(operator)/reservations?reject=${item.id}`)}
                className="flex-1"
              >
                거절
              </Button>
            </View>
          </GlassCard>
        )}
        scrollEnabled={false}
        ListEmptyComponent={
          <StyledText variant="body-md" className="text-neutral-400 text-center py-4">
            대기 중인 예약이 없습니다.
          </StyledText>
        }
      />
    </Screen>
  );
}
