import { View, Pressable } from 'react-native';
import { useMemo } from 'react';
import { StyledText, COLORS } from '@/design-system';
import { useMonthlyCalendar } from '@/hooks/useCalendar';
import { todayKST, toKSTDateString } from '@domain/date-time';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface MonthlyViewProps {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function MonthlyView({ year, month, selectedDate, onSelectDate }: MonthlyViewProps) {
  const { data } = useMonthlyCalendar(year, month);
  const todayStr = toKSTDateString(todayKST());

  const reservationMap = useMemo(() => {
    const map = new Map<string, { count: number; statuses: string[] }>();
    data?.days.forEach((d) => {
      if (d.hasReservation) {
        map.set(d.date, { count: d.reservationCount, statuses: d.statuses });
      }
    });
    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startOffset = firstDay.getDay();
    const days: (string | null)[] = [];

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(year, month - 1, d);
      days.push(toKSTDateString(dateObj));
    }
    return days;
  }, [year, month]);

  return (
    <View>
      {/* 요일 헤더 */}
      <View className="flex-row mb-2">
        {DAYS_KO.map((day, i) => (
          <View key={day} className="flex-1 items-center py-1">
            <StyledText
              variant="label-sm"
              className={i === 0 ? 'text-error' : i === 6 ? 'text-info' : 'text-neutral-500'}
            >
              {day}
            </StyledText>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((dateStr, i) => {
          if (!dateStr) {
            return <View key={`empty-${i}`} className="w-[14.28%] h-14" />;
          }

          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const dayNum = new Date(dateStr).getDate();
          const info = reservationMap.get(dateStr);

          return (
            <Pressable
              key={dateStr}
              onPress={() => onSelectDate(dateStr)}
              className="w-[14.28%] h-14 items-center justify-center"
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isSelected
                    ? 'bg-primary'
                    : isToday
                      ? 'border-2 border-primary'
                      : ''
                }`}
              >
                <StyledText
                  variant="body-sm"
                  className={isSelected ? 'text-white font-semibold' : ''}
                >
                  {String(dayNum)}
                </StyledText>
              </View>

              {/* 예약 표시 점 */}
              {info && (
                <View className="flex-row gap-0.5 mt-0.5">
                  {info.statuses.slice(0, 3).map((status, si) => (
                    <View
                      key={si}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          status === 'APPROVED'
                            ? COLORS.success
                            : status === 'PENDING'
                              ? COLORS.warning
                              : COLORS.neutral[400],
                      }}
                    />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
