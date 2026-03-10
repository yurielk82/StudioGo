'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, CalendarDays, Inbox } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useApproveReservation, useRejectReservation, useBatchApprove } from '@/hooks/useOperator';
import type { ReservationSummary } from '@contracts/schemas/reservation';
import type { ReservationStatus } from '@contracts/enums';

// ── 상태 탭 정의 ──────────────────────────────────

type StatusFilter = 'ALL' | ReservationStatus;

interface StatusTab {
  value: StatusFilter;
  label: string;
}

const STATUS_TABS: StatusTab[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '승인 대기' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '거절' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELLED', label: '취소' },
];

// ── 상태 배지 매핑 ──────────────────────────────────

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
    label: '승인됨',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  REJECTED: {
    label: '거절',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  CANCELLED: {
    label: '취소',
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

// ── 서브 컴포넌트: 상태 배지 ──────────────────────

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// ── 서브 컴포넌트: 거절 다이얼로그 ──────────────────

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  reservationNumber?: string;
}

function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  reservationNumber,
}: RejectDialogProps) {
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
          <DialogTitle>예약 거절</DialogTitle>
          <DialogDescription>
            {reservationNumber && (
              <span className="text-foreground font-medium">{reservationNumber}</span>
            )}{' '}
            예약을 거절합니다. 거절 사유를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="reject-reason">
            거절 사유 <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="셀러에게 전달될 거절 사유를 입력하세요. (최대 500자)"
            maxLength={500}
            rows={4}
          />
          <p className="text-muted-foreground text-right text-xs">{reason.length} / 500</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            거절 확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 서브 컴포넌트: 빈 상태 ──────────────────────────

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const message =
    statusFilter === 'ALL'
      ? '등록된 예약이 없습니다.'
      : `${STATUS_CONFIG[statusFilter as ReservationStatus]?.label ?? ''} 상태의 예약이 없습니다.`;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="text-muted-foreground/40 mb-3 size-12" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

// ── 서브 컴포넌트: 로딩 상태 ─────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="text-muted-foreground size-8 animate-spin" />
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────

export default function OperatorReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<ReservationSummary | null>(null);

  const approve = useApproveReservation();
  const reject = useRejectReservation();
  const batchApprove = useBatchApprove();

  // ── 예약 목록 조회 ──────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.reservations.all, { status: statusFilter }],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (statusFilter !== 'ALL') sp.set('status', statusFilter);
      sp.set('limit', '50');
      const qs = sp.toString();
      return apiClient<{
        items: ReservationSummary[];
        meta: { total: number; page: number; limit: number };
      }>(`${API_ROUTES.RESERVATIONS.BASE}?${qs}`);
    },
  });

  const reservations = data?.items ?? [];
  const pendingReservations = reservations.filter((r) => r.status === 'PENDING');

  // ── 체크박스 선택 핸들러 ────────────────────────────

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(pendingReservations.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleSelectRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  // ── 승인 핸들러 ─────────────────────────────────────

  function handleApprove(id: string) {
    approve.mutate(id);
  }

  // ── 일괄 승인 핸들러 ────────────────────────────────

  function handleBatchApprove() {
    if (selectedIds.size === 0) return;
    batchApprove.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  }

  // ── 거절 핸들러 ─────────────────────────────────────

  function handleRejectConfirm(reason: string) {
    if (!rejectTarget) return;
    reject.mutate({ id: rejectTarget.id, reason }, { onSuccess: () => setRejectTarget(null) });
  }

  // ── 전체 선택 상태 계산 ──────────────────────────────

  const isAllPendingSelected =
    pendingReservations.length > 0 && pendingReservations.every((r) => selectedIds.has(r.id));

  const isIndeterminate =
    !isAllPendingSelected && pendingReservations.some((r) => selectedIds.has(r.id));

  // ── 렌더 ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="size-6" />
            예약 관리
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            셀러의 예약 요청을 검토하고 승인하거나 거절하세요.
          </p>
        </div>

        {selectedIds.size > 0 && (
          <Button
            onClick={handleBatchApprove}
            disabled={batchApprove.isPending}
            className="shrink-0"
          >
            {batchApprove.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle />}
            선택 승인 ({selectedIds.size}건)
          </Button>
        )}
      </div>

      {/* 상태 탭 필터 */}
      <div className="flex flex-wrap gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setSelectedIds(new Set());
            }}
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

      {/* 테이블 영역 */}
      <div className="bg-card rounded-lg border">
        {isLoading ? (
          <LoadingState />
        ) : reservations.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {/* 전체 선택 체크박스 — PENDING 행만 선택 가능 */}
                <TableHead className="w-10">
                  {pendingReservations.length > 0 && (
                    <Checkbox
                      checked={isIndeterminate ? 'indeterminate' : isAllPendingSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="승인 대기 전체 선택"
                    />
                  )}
                </TableHead>
                <TableHead>예약번호</TableHead>
                <TableHead>예약자</TableHead>
                <TableHead>스튜디오</TableHead>
                <TableHead>날짜</TableHead>
                <TableHead>시간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => {
                const isPending = reservation.status === 'PENDING';
                const isSelected = selectedIds.has(reservation.id);
                const isApprovingThis = approve.isPending && approve.variables === reservation.id;

                return (
                  <TableRow key={reservation.id} data-state={isSelected ? 'selected' : undefined}>
                    {/* 체크박스 — PENDING만 활성화 */}
                    <TableCell>
                      {isPending && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(reservation.id, !!checked)}
                          aria-label={`${reservation.reservationNumber} 선택`}
                        />
                      )}
                    </TableCell>

                    {/* 예약번호 */}
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {reservation.reservationNumber}
                    </TableCell>

                    {/* 예약자 */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{reservation.userName}</p>
                        <p className="text-muted-foreground text-xs">{reservation.userNickname}</p>
                      </div>
                    </TableCell>

                    {/* 스튜디오 */}
                    <TableCell>{reservation.studioName}</TableCell>

                    {/* 날짜 */}
                    <TableCell>{reservation.date}</TableCell>

                    {/* 시간 */}
                    <TableCell className="text-muted-foreground text-sm">
                      {reservation.startTime} – {reservation.endTime}
                    </TableCell>

                    {/* 상태 배지 */}
                    <TableCell>
                      <StatusBadge status={reservation.status} />
                    </TableCell>

                    {/* 작업 버튼 */}
                    <TableCell className="text-right">
                      {isPending && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reservation.id)}
                            disabled={isApprovingThis || batchApprove.isPending}
                          >
                            {isApprovingThis ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <CheckCircle />
                            )}
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectTarget(reservation)}
                            disabled={isApprovingThis || batchApprove.isPending}
                          >
                            <XCircle />
                            거절
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 거절 사유 입력 다이얼로그 */}
      <RejectDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        onConfirm={handleRejectConfirm}
        isPending={reject.isPending}
        reservationNumber={rejectTarget?.reservationNumber}
      />
    </div>
  );
}
