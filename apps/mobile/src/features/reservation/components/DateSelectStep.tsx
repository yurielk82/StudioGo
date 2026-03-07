import { View, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { StyledText, Button, COLORS } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { addDays, todayKST } from '@domain/date-time';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function DateSelectStep() {
  const { date, setDate, nextStep, prevStep } = useReservationWizardStore();
  const today = todayKST(); // string "YYYY-MM-DD"
  const [viewMonth, setViewMonth] = useState(() => {
    const d = date ? new Date(date) : new Date(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startOffset = firstDay.getDay();
    const days: (string | null)[] = [];

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const mm = String(viewMonth.month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push(`${viewMonth.year}-${mm}-${dd}`);
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

  function handleSelectDate(dateStr: string) {
    if (dateStr < today) return;
    const maxDate = addDays(today, 30);
    if (dateStr > maxDate) return;
    setDate(dateStr);
    nextStep();
  }

  const monthLabel = `${viewMonth.year}년 ${viewMonth.month + 1}월`;

  return (
    <View>
      <StyledText variant="heading-md" className="mb-4">
        날짜 선택
      </StyledText>

      {/* 월 네비게이션 */}
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={handlePrevMonth} className="p-2">
          <ChevronLeft size={24} color={COLORS.neutral[700]} />
        </Pressable>
        <StyledText variant="heading-sm">{monthLabel}</StyledText>
        <Pressable onPress={handleNextMonth} className="p-2">
          <ChevronRight size={24} color={COLORS.neutral[700]} />
        </Pressable>
      </View>

      {/* 요일 헤더 */}
      <View className="mb-2 flex-row">
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
        {calendarDays.map((dateStr, i) => {
          if (!dateStr) {
            return <View key={`empty-${i}`} className="h-11 w-[14.28%]" />;
          }

          const isPast = dateStr < today;
          const isTooFar = dateStr > addDays(today, 30);
          const isDisabled = isPast || isTooFar;
          const isSelected = date === dateStr;
          const isToday = dateStr === today;
          const dayPart = dateStr.split('-')[2] ?? '0';
          const dayNum = parseInt(dayPart, 10);

          return (
            <Pressable
              key={dateStr}
              onPress={() => !isDisabled && handleSelectDate(dateStr)}
              className="h-11 w-[14.28%] items-center justify-center"
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isSelected ? 'bg-primary' : isToday ? 'border-2 border-primary' : ''
                }`}
              >
                <StyledText
                  variant="body-sm"
                  className={
                    isSelected
                      ? 'font-semibold text-white'
                      : isDisabled
                        ? 'text-neutral-300'
                        : 'text-neutral-800'
                  }
                >
                  {String(dayNum)}
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
