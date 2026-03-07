import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { Screen, StyledText, Badge, GlassCard, Button, COLORS } from '@/design-system';
import { useMyReservations } from '@/hooks/useReservation';

const STATUS_TABS = [
  { key: undefined, label: '전체' },
  { key: 'PENDING', label: '대기' },
  { key: 'APPROVED', label: '승인' },
  { key: 'COMPLETED', label: '완료' },
  { key: 'CANCELLED', label: '취소' },
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
  NO_SHOW: '노쇼',
};

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'neutral'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'neutral',
  COMPLETED: 'primary',
  NO_SHOW: 'error',
};

export default function ReservationListScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data, isLoading } = useMyReservations({ status: statusFilter });

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        내 예약
      </StyledText>

      {/* 상태 필터 탭 */}
      <View className="flex-row mb-4">
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.label}
            onPress={() => setStatusFilter(tab.key)}
            className={`mr-2 px-3 py-1.5 rounded-chip ${
              statusFilter === tab.key ? 'bg-primary' : 'bg-neutral-100'
            }`}
          >
            <StyledText
              variant="label-md"
              className={statusFilter === tab.key ? 'text-white' : 'text-neutral-600'}
            >
              {tab.label}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(member)/reservation/${item.id}`)}
            >
              <GlassCard className="p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <StyledText variant="heading-sm">{item.studioName}</StyledText>
                  <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Badge>
                </View>

                <View className="flex-row items-center mb-1">
                  <Calendar size={14} color={COLORS.neutral[500]} />
                  <StyledText variant="body-sm" className="text-neutral-500 ml-1">
                    {item.date}
                  </StyledText>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Clock size={14} color={COLORS.neutral[500]} />
                    <StyledText variant="body-sm" className="text-neutral-500 ml-1">
                      {item.startTime} - {item.endTime}
                    </StyledText>
                  </View>
                  <ChevronRight size={16} color={COLORS.neutral[400]} />
                </View>
              </GlassCard>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <StyledText variant="body-md" className="text-neutral-500 mb-4">
                예약 내역이 없습니다.
              </StyledText>
              <Button onPress={() => router.push('/(member)/reservation/new')}>
                새 예약하기
              </Button>
            </View>
          }
        />
      )}
    </Screen>
  );
}
