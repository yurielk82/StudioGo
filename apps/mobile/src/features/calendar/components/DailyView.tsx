import { View, FlatList, Pressable } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { StyledText, GlassCard, Badge, COLORS } from '@/design-system';
import { useDailyCalendar } from '@/hooks/useCalendar';

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: '예약 가능',
  RESERVED: '예약됨',
  IN_USE: '사용 중',
  CLEANING: '정리 중',
  BLOCKED: '차단됨',
  COMPLETED: '완료',
};

const STATUS_VARIANT: Record<string, 'success' | 'primary' | 'warning' | 'neutral' | 'secondary' | 'error'> = {
  AVAILABLE: 'success',
  RESERVED: 'primary',
  IN_USE: 'secondary',
  CLEANING: 'warning',
  BLOCKED: 'neutral',
  COMPLETED: 'neutral',
};

interface DailyViewProps {
  date: string;
  onSelectSlot?: (slotId: string) => void;
}

export function DailyView({ date, onSelectSlot }: DailyViewProps) {
  const { data } = useDailyCalendar(date);

  return (
    <FlatList
      data={data?.slots ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => item.status === 'AVAILABLE' && onSelectSlot?.(item.id)}
          disabled={item.status !== 'AVAILABLE'}
        >
          <GlassCard className="p-4 mb-2">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Clock size={16} color={COLORS.primary.DEFAULT} />
                <StyledText variant="body-lg" className="ml-2 font-medium">
                  {item.startTime} - {item.endTime}
                </StyledText>
              </View>
              <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>
                {STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            </View>

            <View className="flex-row items-center">
              <MapPin size={14} color={COLORS.neutral[500]} />
              <StyledText variant="body-sm" className="text-neutral-500 ml-1">
                {item.studioName}
              </StyledText>
            </View>
          </GlassCard>
        </Pressable>
      )}
      ListEmptyComponent={
        <View className="items-center py-12">
          <StyledText variant="body-md" className="text-neutral-500">
            이 날짜에 슬롯이 없습니다.
          </StyledText>
        </View>
      }
    />
  );
}
