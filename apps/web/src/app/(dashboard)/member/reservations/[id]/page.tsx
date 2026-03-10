'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Building2,
  Hash,
  FileText,
  ShoppingBag,
  Loader2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

import { useReservationDetail, useCancelReservation } from '@/hooks/useReservation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ReservationStatus } from '@contracts/enums';

// ── 상태 배지 스타일 매핑 ─────────────────────────────

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<ReservationStatus, StatusConfig> = {
  PENDING: {
    label: '승인 대기',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  APPROVED: {
    label: '예정',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  REJECTED: {
    label: '거절됨',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  CANCELLED: {
    label: '취소됨',
    className: 'bg-muted text-muted-foreground border-border',
  },
  COMPLETED: {
    label: '완료',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  NO_SHOW: {
    label: '노쇼',
    className:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
};

// ── 서브 컴포넌트: 상태 배지 ─────────────────────────

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// ── 서브 컴포넌트: 정보 행 ───────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 not-last:border-b">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="text-right text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}

// ── 서브 컴포넌트: 취소 다이얼로그 ──────────────────

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  reservationNumber?: string;
}

function CancelDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  reservationNumber,
}: CancelDialogProps) {
  const [reason, setReason] = useState('');

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setReason('');
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>예약 취소</DialogTitle>
          <DialogDescription>
            {reservationNumber && (
              <span className="text-foreground font-medium">{reservationNumber}</span>
            )}{' '}
            예약을 취소합니다. 취소 사유를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="cancel-reason-detail">
            취소 사유 <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="cancel-reason-detail"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="취소 사유를 입력하세요. (최대 500자)"
            maxLength={500}
            rows={4}
          />
          <p className="text-muted-foreground text-right text-xs">{reason.length} / 500</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            닫기
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            취소 확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 서브 컴포넌트: 로딩 상태 ─────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="bg-muted h-8 w-40 animate-pulse rounded" />
        <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
      </div>

      {/* 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-5 w-32 animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between py-3 not-last:border-b">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── 서브 컴포넌트: 에러 상태 ─────────────────────────

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="text-destructive/60 mb-3 size-12" />
      <p className="font-medium">예약 정보를 불러올 수 없습니다.</p>
      <p className="text-muted-foreground mt-1 text-sm">잠시 후 다시 시도해주세요.</p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/member/reservations">목록으로 돌아가기</Link>
      </Button>
    </div>
  );
}

// ── 날짜/시간 포맷 유틸 ──────────────────────────────

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── 메인 페이지 ──────────────────────────────────────

export default function MemberReservationDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: reservation, isLoading, isError } = useReservationDetail(id);
  const cancel = useCancelReservation();

  function handleCancelConfirm(reason: string) {
    if (!reservation) return;
    cancel.mutate({ id: reservation.id, reason }, { onSuccess: () => setCancelOpen(false) });
  }

  const isApproved = reservation?.status === 'APPROVED';

  // ── 렌더 ─────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/member/reservations">
          <ArrowLeft />내 예약 목록
        </Link>
      </Button>

      {isLoading ? (
        <LoadingState />
      ) : isError || !reservation ? (
        <ErrorState />
      ) : (
        <>
          {/* 페이지 헤더 */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">예약 상세</h2>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                {reservation.reservationNumber}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={reservation.status} />
              {isApproved && (
                <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
                  <XCircle />
                  예약 취소
                </Button>
              )}
            </div>
          </div>

          {/* 예약 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">예약 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                icon={<Building2 className="size-4" />}
                label="스튜디오"
                value={reservation.studioName}
              />
              <InfoRow
                icon={<CalendarDays className="size-4" />}
                label="예약 날짜"
                value={reservation.date}
              />
              <InfoRow
                icon={<Clock className="size-4" />}
                label="예약 시간"
                value={`${reservation.startTime} – ${reservation.endTime}`}
              />
              <InfoRow
                icon={<Hash className="size-4" />}
                label="예약 번호"
                value={<span className="font-mono text-xs">{reservation.reservationNumber}</span>}
              />
              <InfoRow
                icon={<CalendarDays className="size-4" />}
                label="예약 신청일"
                value={formatDateTime(reservation.createdAt)}
              />
            </CardContent>
          </Card>

          {/* 서비스 목록 카드 (있을 때만) */}
          {reservation.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingBag className="size-4" />
                  추가 서비스
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reservation.services.map((service) => (
                    <li
                      key={service.serviceId}
                      className="flex items-start justify-between gap-4 py-2 not-last:border-b"
                    >
                      <div>
                        <p className="text-sm font-medium">{service.serviceName}</p>
                        {service.memo && (
                          <p className="text-muted-foreground mt-0.5 text-xs">{service.memo}</p>
                        )}
                      </div>
                      <span className="text-muted-foreground shrink-0 text-sm">
                        × {service.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 메모 카드 (있을 때만) */}
          {reservation.memo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4" />
                  메모
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{reservation.memo}</p>
              </CardContent>
            </Card>
          )}

          {/* 취소·거절 사유 카드 (있을 때만) */}
          {(reservation.cancelledReason ?? reservation.rejectedReason) && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2 text-base">
                  <AlertCircle className="size-4" />
                  {reservation.cancelledReason ? '취소 사유' : '거절 사유'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {reservation.cancelledReason ?? reservation.rejectedReason}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 취소 다이얼로그 */}
      <CancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
        isPending={cancel.isPending}
        reservationNumber={reservation?.reservationNumber}
      />
    </div>
  );
}
