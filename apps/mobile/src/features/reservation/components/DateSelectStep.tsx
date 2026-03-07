import { View, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { StyledText, Button, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { addDays, todayKST, toKSTDateString } from '@domain/date-time';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function DateSelectStep() {
  const { date, setDate, nextStep, prevStep } = useReservationWizardStore();
  const today = todayKST();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = date ? new Date(date) : today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startOffset = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(viewMonth.year, viewMonth.month, d));
    }
    return days;
  }, [viewMonth.year, viewMonth.month]);

  function handlePrevMonth() {
    setViewMonth((prev) => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
    });
  }

  function handleNextMonth() {
    setViewMonth((prev) => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
    });
  }

  function handleSelectDate(d: Date) {
    if (d < today) return;
    const maxDate = addDays(today, 30);
    if (d > maxDate) return;
    setDate(toKSTDateString(d));
    nextStep();
  }

  const monthLabel = `${viewMonth.year}년 ${viewMonth.month + 1}월`;

  return (
    <View>
      <StyledText variant="heading-md" className="mb-4">
        날짜 선택
      </StyledText>

      {/* 월 네비게이션 */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={handlePrevMonth} className="p-2">
          <ChevronLeft size={24} color={COLORS.neutral[700]} />
        </Pressable>
        <StyledText variant="heading-sm">{monthLabel}</StyledText>
        <Pressable onPress={handleNextMonth} className="p-2">
          <ChevronRight size={24} color={COLORS.neutral[700]} />
        </Pressable>
      </View>

      {/* 요일 헤더 */}
      <View className="flex-row mb-2">
        {DAYS_KO.map((day, i) => (
          <View key={day} className="flex-1 items-center">
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
        {calendarDays.map((d, i) => {
          if (!d) {
            return <View key={`empty-${i}`} className="w-[14.28%] h-11" />;
          }

          const dateStr = toKSTDateString(d);
          const isPast = d < today;
          const isTooFar = d > addDays(today, 30);
          const isDisabled = isPast || isTooFar;
          const isSelected = date === dateStr;
          const isToday = dateStr === toKSTDateString(today);

          return (
            <Pressable
              key={dateStr}
              onPress={() => !isDisabled && handleSelectDate(d)}
              className="w-[14.28%] h-11 items-center justify-center"
            >
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isSelected
                    ? 'bg-primary'
                    : isToday
                      ? 'border-2 border-primary'
                      : ''
                }`}
              >
                <StyledText
                  variant="body-sm"
                  className={
                    isSelected
                      ? 'text-white font-semibold'
                      : isDisabled
                        ? 'text-neutral-300'
                        : 'text-neutral-800'
                  }
                >
                  {String(d.getDate())}
                </StyledText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6">
        <Button onPress={prevStep} variant="ghost">
          이전 단계
        </Button>
      </View>
    </View>
  );
}
