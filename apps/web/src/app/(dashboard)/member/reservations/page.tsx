'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Building2,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';

import { useMyReservations, useCancelReservation } from '@/hooks/useReservation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ReservationSummary } from '@contracts/schemas/reservation';
import type { ReservationStatus } from '@contracts/enums';

// ── 상태 탭 정의 ──────────────────────────────────────

type StatusFilter = 'ALL' | ReservationStatus;

interface StatusTab {
  value: StatusFilter;
  label: string;
}

const STATUS_TABS: StatusTab[] = [
  { value: 'ALL', label: '전체' },
  { value: 'APPROVED', label: '예정' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELLED', label: '취소' },
];

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
          <label className="text-sm font-medium" htmlFor="cancel-reason">
            취소 사유 <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="cancel-reason"
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

// ── 서브 컴포넌트: 예약 카드 ─────────────────────────

interface ReservationCardProps {
  reservation: ReservationSummary;
  onCancelClick: (reservation: ReservationSummary) => void;
}

function ReservationCard({ reservation, onCancelClick }: ReservationCardProps) {
  const isApproved = reservation.status === 'APPROVED';

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* 상단: 예약번호 + 상태 배지 */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-xs">
            {reservation.reservationNumber}
          </span>
          <StatusBadge status={reservation.status} />
        </div>

        {/* 스튜디오 이름 */}
        <div className="flex items-center gap-2">
          <Building2 className="text-muted-foreground size-4 shrink-0" />
          <span className="font-semibold">{reservation.studioName}</span>
        </div>

        {/* 날짜 + 시간 */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="text-muted-foreground size-4 shrink-0" />
            <span className="text-sm">{reservation.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="text-muted-foreground size-4 shrink-0" />
            <span className="text-sm">
              {reservation.startTime} – {reservation.endTime}
            </span>
          </div>
        </div>

        {/* 하단: 상세 보기 + 취소 버튼 */}
        <div className="flex items-center justify-between border-t pt-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/member/reservations/${reservation.id}`}>상세 보기</Link>
          </Button>
          {isApproved && (
            <Button variant="outline" size="sm" onClick={() => onCancelClick(reservation)}>
              <XCircle />
              취소
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── 서브 컴포넌트: 로딩 스켈레톤 ────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
            </div>
            <div className="bg-muted h-5 w-48 animate-pulse rounded" />
            <div className="flex gap-4">
              <div className="bg-muted h-4 w-28 animate-pulse rounded" />
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
            <div className="flex justify-between border-t pt-3">
              <div className="bg-muted h-8 w-20 animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── 서브 컴포넌트: 빈 상태 ──────────────────────────

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const tab = STATUS_TABS.find((t) => t.value === statusFilter);
  const message =
    statusFilter === 'ALL'
      ? '예약 내역이 없습니다.'
      : `${tab?.label ?? ''} 상태의 예약이 없습니다.`;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Inbox className="text-muted-foreground/40 mb-3 size-12" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────

export default function MemberReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<ReservationSummary | null>(null);

  const cancel = useCancelReservation();

  const { data, isLoading } = useMyReservations({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
  });

  const reservations = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function handleStatusChange(next: StatusFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  function handleCancelConfirm(reason: string) {
    if (!cancelTarget) return;
    cancel.mutate({ id: cancelTarget.id, reason }, { onSuccess: () => setCancelTarget(null) });
  }

  // ── 렌더 ─────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <CalendarDays className="size-6" />내 예약
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">스튜디오 예약 내역을 확인하세요.</p>
      </div>

      {/* 상태 탭 필터 */}
      <div className="flex flex-wrap gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleStatusChange(tab.value)}
            className={[
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              statusFilter === tab.value
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground hover:border-border border-transparent',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 목록 영역 */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : reservations.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancelClick={setCancelTarget}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft />
            이전
          </Button>
          <span className="text-muted-foreground text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext}
          >
            다음
            <ChevronRight />
          </Button>
        </div>
      )}

      {/* 취소 다이얼로그 */}
      <CancelDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        onConfirm={handleCancelConfirm}
        isPending={cancel.isPending}
        reservationNumber={cancelTarget?.reservationNumber}
      />
    </div>
  );
}
