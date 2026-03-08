import { View, Pressable } from 'react-native';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Screen, StyledText, COLORS } from '@/design-system';
import { MonthlyView, WeeklyView, DailyView } from '@/features/calendar/components';
import { todayKST, addDays } from '@domain/date-time';

type CalendarMode = 'monthly' | 'weekly' | 'daily';

const MODE_TABS: { key: CalendarMode; label: string }[] = [
  { key: 'monthly', label: '월' },
  { key: 'weekly', label: '주' },
  { key: 'daily', label: '일' },
];

/**
 * 캘린더 탭 — 월/주/일 3종 뷰 전환
 */
export default function CalendarScreen() {
  const today = todayKST(); // string "YYYY-MM-DD"
  const [mode, setMode] = useState<CalendarMode>('monthly');
  const [selectedDate, setSelectedDate] = useState(today);
  const todayDate = new Date(today);
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth() + 1);

  function handlePrev() {
    if (mode === 'monthly') {
      if (viewMonth === 1) {
        setViewYear((y) => y - 1);
        setViewMonth(12);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else if (mode === 'weekly') {
      setSelectedDate((d: string) => addDays(d, -7));
    } else {
      setSelectedDate((d: string) => addDays(d, -1));
    }
  }

  function handleNext() {
    if (mode === 'monthly') {
      if (viewMonth === 12) {
        setViewYear((y) => y + 1);
        setViewMonth(1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else if (mode === 'weekly') {
      setSelectedDate((d: string) => addDays(d, 7));
    } else {
      setSelectedDate((d: string) => addDays(d, 1));
    }
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setMode('daily');
  }

  const headerLabel =
    mode === 'monthly'
      ? `${viewYear}년 ${viewMonth}월`
      : mode === 'weekly'
        ? `${selectedDate} 주간`
        : selectedDate;

  return (
    <Screen>
      {/* 모드 탭 */}
      <View className="mb-4 flex-row rounded-button bg-neutral-100 p-1">
        {MODE_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setMode(tab.key)}
            className={`flex-1 items-center rounded-button py-2 ${
              mode === tab.key ? 'bg-white shadow-sm' : ''
            }`}
          >
            <StyledText
              variant="label-md"
              className={mode === tab.key ? 'font-semibold text-primary' : 'text-neutral-500'}
            >
              {tab.label}
            </StyledText>
          </Pressable>
        ))}
      </View>

      {/* 네비게이션 */}
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={handlePrev} className="p-2">
          <ChevronLeft size={24} color={COLORS.neutral[700]} />
        </Pressable>
        <StyledText variant="heading-sm">{headerLabel}</StyledText>
        <Pressable onPress={handleNext} className="p-2">
          <ChevronRight size={24} color={COLORS.neutral[700]} />
        </Pressable>
      </View>

      {/* 뷰 */}
      {mode === 'monthly' && (
        <MonthlyView
          year={viewYear}
          month={viewMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      )}
      {mode === 'weekly' && (
        <WeeklyView
          startDate={selectedDate}
          onSelectSlot={(slot) => {
            setSelectedDate(slot.date);
            setMode('daily');
          }}
        />
      )}
      {mode === 'daily' && <DailyView date={selectedDate} />}
    </Screen>
  );
}
