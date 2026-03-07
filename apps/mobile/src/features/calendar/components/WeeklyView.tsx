import { View, ScrollView, Pressable } from 'react-native';
import { useMemo } from 'react';
import { StyledText, Badge, COLORS } from '@/design-system';
import { useWeeklyCalendar } from '@/hooks/useCalendar';
import { toKSTDateString, todayKST, dateRange } from '@domain/date-time';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00~20:00

interface WeeklyViewProps {
  startDate: string;
  onSelectSlot?: (slotId: string) => void;
}

export function WeeklyView({ startDate, onSelectSlot }: WeeklyViewProps) {
  const { data } = useWeeklyCalendar(startDate);
  const todayStr = toKSTDateString(todayKST());

  const weekDates = useMemo(() => {
    const start = new Date(startDate);
    const sunday = new Date(start);
    sunday.setDate(start.getDate() - start.getDay());
    return dateRange(sunday, 7).map((d) => toKSTDateString(d));
  }, [startDate]);

  const slotsByDateHour = useMemo(() => {
    const map = new Map<string, typeof data extends undefined ? never : NonNullable<typeof data>['slots'][number]>();
    data?.slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0]!, 10);
      map.set(`${slot.date}-${hour}`, slot);
    });
    return map;
  }, [data]);

  return (
    <ScrollView horizontal={false}>
      <View className="flex-row">
        {/* 시간 축 */}
        <View className="w-12">
          <View className="h-10" />
          {HOURS.map((hour) => (
            <View key={hour} className="h-14 justify-center">
              <StyledText variant="caption" className="text-neutral-400 text-right pr-2">
                {String(hour).padStart(2, '0')}
              </StyledText>
            </View>
          ))}
        </View>

        {/* 날짜 컬럼 */}
        {weekDates.map((dateStr, dayIndex) => {
          const isToday = dateStr === todayStr;
          const dayNum = new Date(dateStr).getDate();

          return (
            <View key={dateStr} className="flex-1">
              {/* 날짜 헤더 */}
              <View className={`h-10 items-center justify-center ${isToday ? 'bg-primary-50' : ''}`}>
                <StyledText variant="label-sm" className={isToday ? 'text-primary' : 'text-neutral-500'}>
                  {DAYS_KO[dayIndex]}
                </StyledText>
                <StyledText
                  variant="label-md"
                  className={isToday ? 'text-primary font-bold' : ''}
                >
                  {String(dayNum)}
                </StyledText>
              </View>

              {/* 시간 셀 */}
              {HOURS.map((hour) => {
                const slot = slotsByDateHour.get(`${dateStr}-${hour}`);

                return (
                  <Pressable
                    key={hour}
                    onPress={() => slot && onSelectSlot?.(slot.id)}
                    className="h-14 border-t border-neutral-100 px-0.5"
                  >
                    {slot && (
                      <View
                        className="flex-1 rounded-sm p-1 mt-0.5"
                        style={{
                          backgroundColor:
                            slot.status === 'RESERVED'
                              ? COLORS.primary[100]
                              : slot.status === 'IN_USE'
                                ? COLORS.secondary[50]
                                : slot.status === 'BLOCKED'
                                  ? COLORS.neutral[200]
                                  : 'transparent',
                        }}
                      >
                        <StyledText variant="label-sm" numberOfLines={1}>
                          {slot.studioName}
                        </StyledText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
