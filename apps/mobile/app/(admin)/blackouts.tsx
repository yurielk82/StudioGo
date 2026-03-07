import { View, FlatList, ActivityIndicator } from 'react-native';
import { CalendarX } from 'lucide-react-native';
import { Screen, StyledText, GlassCard, Badge, COLORS } from '@/design-system';
import { useBlackouts } from '@/hooks/useAdmin';

const TYPE_LABEL: Record<string, string> = {
  HOLIDAY: '공휴일',
  MAINTENANCE: '정비',
  MANUAL: '수동',
  EVENT: '이벤트',
};

export default function BlackoutsScreen() {
  const { data, isLoading } = useBlackouts();

  return (
    <Screen>
      <StyledText variant="heading-lg" className="mb-4">
        블랙아웃 관리
      </StyledText>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard className="p-4 mb-2">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center">
                  <CalendarX size={16} color={COLORS.error.DEFAULT} />
                  <StyledText variant="body-lg" className="ml-2 font-medium">
                    {item.studioName}
                  </StyledText>
                </View>
                <Badge variant="error">{TYPE_LABEL[item.type] ?? item.type}</Badge>
              </View>
              <StyledText variant="body-sm" className="text-neutral-500">
                {new Date(item.startAt).toLocaleString('ko-KR')} ~{' '}
                {new Date(item.endAt).toLocaleString('ko-KR')}
              </StyledText>
              {item.reason && (
                <StyledText variant="caption" className="text-neutral-400 mt-1">
                  {item.reason}
                </StyledText>
              )}
            </GlassCard>
          )}
          ListEmptyComponent={
            <StyledText variant="body-md" className="text-neutral-400 text-center py-8">
              등록된 블랙아웃이 없습니다.
            </StyledText>
          }
        />
      )}
    </Screen>
  );
}
