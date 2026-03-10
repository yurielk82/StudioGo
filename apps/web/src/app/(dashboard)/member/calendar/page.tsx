'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMonthlyCalendar, useDailyCalendar } from '@/hooks/useCalendar';

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

const STATUS_LABEL: Record<string, string> = {
  available: '예약 가능',
  booked: '예약됨',
  pending: '승인 대기',
  cancelled: '취소됨',
  completed: '완료',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  available: 'secondary',
  booked: 'default',
  pending: 'outline',
  cancelled: 'destructive',
  completed: 'secondary',
};

function buildCalendarGrid(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= lastDate; d++) {
    cells.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function MemberCalendarPage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: monthlyData, isLoading: isMonthlyLoading } = useMonthlyCalendar(year, month);
  const { data: dailyData, isLoading: isDailyLoading } = useDailyCalendar(selectedDate ?? '');

  const weeks = buildCalendarGrid(year, month);

  const dayMap = new Map((monthlyData?.days ?? []).map((d) => [d.date, d]));

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  function handleDayClick(date: string | null) {
    if (!date) return;
    setSelectedDate((prev) => (prev === date ? null : date));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <CalendarDays className="text-primary size-5" />
        <h1 className="text-xl font-semibold">예약 캘린더</h1>
      </div>

      <Card>
        <CardHeader className="pb-0">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon-sm" onClick={prevMonth} aria-label="이전 달">
              <ChevronLeft />
            </Button>
            <CardTitle className="text-base">
              {year}년 {month}월
            </CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={nextMonth} aria-label="다음 달">
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* 요일 헤더 */}
          <div className="mb-1 grid grid-cols-7">
            {DAY_HEADERS.map((label, i) => (
              <div
                key={label}
                className={cn(
                  'py-1 text-center text-xs font-medium',
                  i === 0 && 'text-destructive',
                  i === 6 && 'text-blue-500',
                  i > 0 && i < 6 && 'text-muted-foreground',
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          {isMonthlyLoading ? (
            <div className="text-muted-foreground py-16 text-center text-sm">불러오는 중…</div>
          ) : (
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5">
                  {week.map((date, di) => {
                    const info = date ? dayMap.get(date) : undefined;
                    const isToday = date === todayStr;
                    const isSelected = date === selectedDate;
                    const isSun = di === 0;
                    const isSat = di === 6;
                    const dayNum = date ? parseInt(date.split('-')[2], 10) : null;

                    return (
                      <button
                        key={di}
                        disabled={!date}
                        onClick={() => handleDayClick(date)}
                        className={cn(
                          'relative flex flex-col items-center rounded-md py-1.5 text-sm transition-colors',
                          'md:py-2',
                          date ? 'hover:bg-accent cursor-pointer' : 'pointer-events-none',
                          isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                          isToday && !isSelected && 'bg-accent font-semibold',
                          !isSelected && isSun && 'text-destructive',
                          !isSelected && isSat && 'text-blue-500',
                          !isSelected && !isSun && !isSat && date && 'text-foreground',
                          !date && 'opacity-0',
                        )}
                      >
                        <span className="leading-none">{dayNum}</span>
                        {info?.hasReservation && (
                          <span
                            className={cn(
                              'mt-0.5 size-1.5 rounded-full',
                              isSelected ? 'bg-primary-foreground' : 'bg-primary',
                            )}
                          />
                        )}
                        {info && info.reservationCount > 0 && (
                          <span
                            className={cn(
                              'absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold',
                              isSelected
                                ? 'bg-primary-foreground text-primary'
                                : 'bg-primary text-primary-foreground',
                            )}
                          >
                            {info.reservationCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 일별 상세 */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selectedDate.replace(/-/g, '.')} 예약 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {isDailyLoading ? (
              <p className="text-muted-foreground text-sm">불러오는 중…</p>
            ) : !dailyData?.slots.length ? (
              <p className="text-muted-foreground text-sm">예약된 슬롯이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {dailyData.slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {slot.startTime} – {slot.endTime}
                      </p>
                      <p className="text-muted-foreground text-xs">{slot.studioName}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[slot.status] ?? 'outline'}>
                      {STATUS_LABEL[slot.status] ?? slot.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
