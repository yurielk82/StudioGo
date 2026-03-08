import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Plus, List } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, COLORS } from '@/design-system';
import { useAuthStore } from '@/stores/auth-store';
import { useMyReservations } from '@/hooks/useReservation';

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
      <StyledText variant="body-sm" className="mb-5 text-neutral-500">
        오늘도 멋진 방송을 준비하세요.
      </StyledText>

      {/* 다음 예약 카드 */}
      <GlassCard className="mb-4 p-5">
        <StyledText variant="label-md" className="mb-2 text-neutral-500">
          다음 예약
        </StyledText>

        {nextReservation ? (
          <Pressable onPress={() => router.push(`/(member)/reservation/${nextReservation.id}`)}>
            <StyledText variant="heading-md" className="mb-2">
              {nextReservation.studioName}
            </StyledText>
            <View className="mb-1 flex-row items-center">
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
      <View className="mb-6 flex-row gap-3">
        <Pressable onPress={() => router.push('/(member)/reservation/new')} className="flex-1">
          <GlassCard className="items-center p-4">
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Plus size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="label-md">새 예약</StyledText>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => router.push('/(member)/reservation/list')} className="flex-1">
          <GlassCard className="items-center p-4">
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <List size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="label-md">예약 내역</StyledText>
          </GlassCard>
        </Pressable>
      </View>
    </Screen>
  );
}
