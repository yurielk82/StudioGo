'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useSlots, useCreateHold, useCancelHold } from '@/hooks/useReservation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function TimeStep() {
  const {
    date,
    studioId,
    timeSlotId,
    holdToken,
    holdExpiresAt,
    setTimeSlot,
    setHold,
    clearHold,
    nextStep,
    prevStep,
  } = useReservationWizardStore();

  const { data: slots, isLoading } = useSlots(date, studioId ?? undefined);
  const createHold = useCreateHold();
  const cancelHold = useCancelHold();

  const [remaining, setRemaining] = useState<number | null>(null);

  // Hold 타이머
  useEffect(() => {
    if (!holdExpiresAt) {
      setRemaining(null);
      return;
    }

    function tick() {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- holdExpiresAt는 위 guard에서 체크
      const diff = Math.max(
        0,
        Math.floor((new Date(holdExpiresAt!).getTime() - Date.now()) / 1000),
      );
      setRemaining(diff);
      if (diff <= 0) {
        clearHold();
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  const handleSelect = useCallback(
    async (slotId: string, start: string, end: string) => {
      // 기존 Hold 취소
      if (holdToken) {
        cancelHold.mutate(holdToken);
      }

      setTimeSlot(slotId, start, end);

      createHold.mutate(slotId, {
        onSuccess: (result) => {
          setHold(result.holdToken, result.expiresAt);
        },
      });
    },
    [holdToken, setTimeSlot, setHold, createHold, cancelHold],
  );

  function handlePrev() {
    if (holdToken) cancelHold.mutate(holdToken);
    prevStep();
  }

  const availableSlots =
    slots?.filter((s) => s.status === 'AVAILABLE' || s.id === timeSlotId) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">시간 선택</h3>
        <p className="text-muted-foreground text-sm">{date} — 원하는 시간대를 선택하세요.</p>
      </div>

      {/* Hold 타이머 */}
      {holdToken && remaining !== null && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border p-3 text-sm',
            remaining <= 30
              ? 'border-destructive bg-destructive/5 text-destructive'
              : 'border-primary bg-primary/5 text-primary',
          )}
        >
          {remaining <= 30 && <AlertTriangle className="h-4 w-4" />}
          <Clock className="h-4 w-4" />
          <span>
            슬롯 점유 중 — {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}{' '}
            남음
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : availableSlots.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          선택한 날짜에 이용 가능한 시간이 없습니다.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {availableSlots.map((slot) => {
            const isSelected = timeSlotId === slot.id;
            const isAvailable = slot.status === 'AVAILABLE';

            return (
              <button
                key={slot.id}
                disabled={!isAvailable && !isSelected}
                onClick={() => handleSelect(slot.id, slot.startTime, slot.endTime)}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 text-sm transition-all',
                  isSelected && 'border-primary bg-primary/5 ring-primary/20 ring-2',
                  !isSelected &&
                    isAvailable &&
                    'hover:border-primary/50 hover:bg-muted/50 cursor-pointer',
                  !isAvailable && !isSelected && 'cursor-not-allowed opacity-40',
                )}
              >
                <span className="font-medium">
                  {slot.startTime} ~ {slot.endTime}
                </span>
                <Badge variant={isAvailable || isSelected ? 'default' : 'secondary'}>
                  {isSelected ? '선택됨' : isAvailable ? '예약 가능' : slot.status}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {createHold.error && (
        <p className="text-destructive text-center text-sm">
          슬롯 점유에 실패했습니다. 다른 시간을 선택해 주세요.
        </p>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={handlePrev}>
          이전
        </Button>
        <Button onClick={nextStep} disabled={!holdToken || createHold.isPending}>
          {createHold.isPending ? '처리 중...' : '다음'}
        </Button>
      </div>
    </div>
  );
}
