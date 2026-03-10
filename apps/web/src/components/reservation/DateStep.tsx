'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useCancelHold } from '@/hooks/useReservation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= lastDate; d++) days.push(d);

  return days;
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function DateStep() {
  const { date, holdToken, setDate, nextStep, prevStep } = useReservationWizardStore();
  const cancelHold = useCancelHold();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
  const days = buildCalendarGrid(viewYear, viewMonth);

  function goPrev() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function isPast(day: number): boolean {
    return formatDate(viewYear, viewMonth, day) < todayStr;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">날짜 선택</h3>
        <p className="text-muted-foreground text-sm">예약할 날짜를 선택하세요.</p>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <Button variant="ghost" size="icon" onClick={goNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              'py-1 text-xs font-medium',
              i === 0 && 'text-red-500',
              i === 6 && 'text-blue-500',
              i > 0 && i < 6 && 'text-muted-foreground',
            )}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const dateStr = formatDate(viewYear, viewMonth, day);
          const isSelected = date === dateStr;
          const past = isPast(day);
          const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();

          return (
            <button
              key={dateStr}
              disabled={past}
              onClick={() => {
                if (holdToken) cancelHold.mutate(holdToken);
                setDate(dateStr);
              }}
              className={cn(
                'flex h-10 items-center justify-center rounded-lg text-sm transition-colors',
                past && 'text-muted-foreground/40 cursor-not-allowed',
                !past && !isSelected && 'hover:bg-muted cursor-pointer',
                isSelected && 'bg-primary text-primary-foreground',
                !isSelected && dayOfWeek === 0 && !past && 'text-red-500',
                !isSelected && dayOfWeek === 6 && !past && 'text-blue-500',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {date && <p className="text-primary text-center text-sm font-medium">선택: {date}</p>}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={prevStep}>
          이전
        </Button>
        <Button onClick={nextStep} disabled={!date}>
          다음
        </Button>
      </div>
    </div>
  );
}
