'use client';

import { useRouter } from 'next/navigation';
import { Building2, Calendar, Clock, Package, FileText } from 'lucide-react';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useCreateReservation, useCancelHold } from '@/hooks/useReservation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ConfirmStep() {
  const router = useRouter();
  const {
    studioName,
    date,
    startTime,
    endTime,
    timeSlotId,
    holdToken,
    services,
    memo,
    setMemo,
    prevStep,
    reset,
  } = useReservationWizardStore();

  const createReservation = useCreateReservation();
  const cancelHold = useCancelHold();

  async function handleSubmit() {
    if (!timeSlotId || !holdToken) return;

    const { date, studioId } = useReservationWizardStore.getState();
    if (!date || !studioId) return;

    createReservation.mutate(
      {
        timeSlotId,
        holdToken,
        date,
        studioId,
        services: services.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          memo: s.memo || undefined,
        })),
        memo: memo || undefined,
      },
      {
        onSuccess: () => {
          reset();
          router.push('/member/reservations');
        },
      },
    );
  }

  function handlePrev() {
    // 뒤로 가더라도 Hold는 유지 (confirm → services)
    prevStep();
  }

  function handleCancel() {
    if (holdToken) cancelHold.mutate(holdToken);
    reset();
    router.push('/member/reservations');
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">예약 확인</h3>
        <p className="text-muted-foreground text-sm">예약 정보를 확인하고 제출하세요.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">예약 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={Building2} label="스튜디오" value={studioName ?? '-'} />
          <InfoRow icon={Calendar} label="날짜" value={date ?? '-'} />
          <InfoRow
            icon={Clock}
            label="시간"
            value={startTime && endTime ? `${startTime} ~ ${endTime}` : '-'}
          />

          {services.length > 0 && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Package className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">부가서비스</p>
                  {services.map((s) => (
                    <div key={s.serviceId} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {s.serviceName}
                      </Badge>
                      {s.quantity > 1 && <span className="text-xs">x{s.quantity}</span>}
                      {s.memo && <span className="text-muted-foreground text-xs">({s.memo})</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 메모 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">메모 (선택)</span>
        </div>
        <Textarea
          placeholder="운영자에게 전달할 메모를 입력하세요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="text-muted-foreground text-right text-xs">{memo.length}/500</p>
      </div>

      {createReservation.error && (
        <p className="text-destructive text-center text-sm">
          예약 생성에 실패했습니다. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button variant="ghost" onClick={handleCancel}>
          취소
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrev}>
            이전
          </Button>
          <Button onClick={handleSubmit} disabled={!holdToken || createReservation.isPending}>
            {createReservation.isPending ? '처리 중...' : '예약하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
