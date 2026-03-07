import { View, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, ChevronRight, Plus, List } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Button, Badge, COLORS } from '@/design-system';
import { useAuthStore } from '@/stores/auth-store';
import { useMyReservations } from '@/hooks/useReservation';

const STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  COMPLETED: '완료',
};

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'primary'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  COMPLETED: 'primary',
};

/**
 * 회원 홈 — 인사, 다음 예약, 빠른 액션, 최근 예약
 */
export default function MemberHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data } = useMyReservations({ status: 'APPROVED' });

  const nextReservation = data?.items?.[0];

  return (
    <Screen>
      {/* 인사 */}
      <StyledText variant="heading-lg" className="mb-1">
        안녕하세요, {user?.nickname ?? '회원'}님!
      </StyledText>
      <StyledText variant="body-sm" className="text-neutral-500 mb-5">
        오늘도 멋진 방송을 준비하세요.
      </StyledText>

      {/* 다음 예약 카드 */}
      <GlassCard className="p-5 mb-4">
        <StyledText variant="label-md" className="text-neutral-500 mb-2">
          다음 예약
        </StyledText>

        {nextReservation ? (
          <Pressable
            onPress={() =>
              router.push(`/(member)/reservation/${nextReservation.id}`)
            }
          >
            <StyledText variant="heading-md" className="mb-2">
              {nextReservation.studioName}
            </StyledText>
            <View className="flex-row items-center mb-1">
              <Calendar size={14} color={COLORS.primary.DEFAULT} />
              <StyledText variant="body-md" className="ml-2">
                {nextReservation.date}
              </StyledText>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color={COLORS.primary.DEFAULT} />
              <StyledText variant="body-md" className="ml-2">
                {nextReservation.startTime} - {nextReservation.endTime}
              </StyledText>
            </View>
          </Pressable>
        ) : (
          <StyledText variant="body-md" className="text-neutral-400">
            예정된 예약이 없습니다.
          </StyledText>
        )}
      </GlassCard>

      {/* 빠른 액션 */}
      <View className="flex-row gap-3 mb-6">
        <Pressable
          onPress={() => router.push('/(member)/reservation/new')}
          className="flex-1"
        >
          <GlassCard className="p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mb-2">
              <Plus size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="label-md">새 예약</StyledText>
          </GlassCard>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(member)/reservation/list')}
          className="flex-1"
        >
          <GlassCard className="p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center mb-2">
              <List size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="label-md">예약 내역</StyledText>
          </GlassCard>
        </Pressable>
      </View>
    </Screen>
  );
}
