'use client';

import { useState } from 'react';
import { Package, Loader2, Pencil } from 'lucide-react';
import { useFulfillmentTasks, useUpdateFulfillment } from '@/hooks/useOperator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FulfillmentStatus = 'PENDING' | 'PACKING' | 'SHIPPED' | 'DELIVERED';

/** 훅에서 반환되는 원본 타입 (status가 string) */
interface RawFulfillmentItem {
  id: string;
  reservationNumber: string;
  userName: string;
  status: string;
  courier: string | null;
  trackingNumber: string | null;
  createdAt: string;
}

/** 페이지 내부에서 status를 FulfillmentStatus로 좁힌 타입 */
interface FulfillmentItem extends Omit<RawFulfillmentItem, 'status'> {
  status: FulfillmentStatus;
}

interface UpdateDialogState {
  item: FulfillmentItem;
  newStatus: FulfillmentStatus;
  courier: string;
  trackingNumber: string;
}

const VALID_STATUSES = new Set<FulfillmentStatus>(['PENDING', 'PACKING', 'SHIPPED', 'DELIVERED']);

function normalizeFulfillmentItem(raw: RawFulfillmentItem): FulfillmentItem {
  const status: FulfillmentStatus = VALID_STATUSES.has(raw.status as FulfillmentStatus)
    ? (raw.status as FulfillmentStatus)
    : 'PENDING';
  return { ...raw, status };
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'PACKING', label: '포장중' },
  { value: 'SHIPPED', label: '발송' },
  { value: 'DELIVERED', label: '완료' },
];

const STATUS_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'PENDING', label: '대기' },
  { value: 'PACKING', label: '포장중' },
  { value: 'SHIPPED', label: '발송' },
  { value: 'DELIVERED', label: '완료' },
];

const STATUS_BADGE_VARIANT: Record<
  FulfillmentStatus,
  'outline' | 'secondary' | 'default' | 'destructive'
> = {
  PENDING: 'outline',
  PACKING: 'secondary',
  SHIPPED: 'default',
  DELIVERED: 'secondary',
};

const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  PENDING: '대기',
  PACKING: '포장중',
  SHIPPED: '발송',
  DELIVERED: '완료',
};

const REQUIRES_TRACKING: FulfillmentStatus[] = ['SHIPPED', 'DELIVERED'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });
}

export default function OperatorFulfillmentPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogState, setDialogState] = useState<UpdateDialogState | null>(null);

  const { data, isLoading } = useFulfillmentTasks(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const updateMutation = useUpdateFulfillment();

  const openUpdateDialog = (item: FulfillmentItem) => {
    setDialogState({
      item,
      newStatus: item.status,
      courier: item.courier ?? '',
      trackingNumber: item.trackingNumber ?? '',
    });
  };

  const closeDialog = () => {
    if (!updateMutation.isPending) {
      setDialogState(null);
    }
  };

  const handleUpdate = () => {
    if (!dialogState) return;

    const needsTracking = REQUIRES_TRACKING.includes(dialogState.newStatus);
    if (needsTracking && !dialogState.courier.trim()) {
      return;
    }
    if (needsTracking && !dialogState.trackingNumber.trim()) {
      return;
    }

    updateMutation.mutate(
      {
        id: dialogState.item.id,
        status: dialogState.newStatus,
        courier: dialogState.courier.trim() || undefined,
        trackingNumber: dialogState.trackingNumber.trim() || undefined,
      },
      {
        onSuccess: () => setDialogState(null),
      },
    );
  };

  const isTrackingRequired =
    dialogState !== null && REQUIRES_TRACKING.includes(dialogState.newStatus);

  const isCourierMissing = isTrackingRequired && !dialogState.courier.trim();
  const isTrackingMissing = isTrackingRequired && !dialogState.trackingNumber.trim();
  const isUpdateDisabled = updateMutation.isPending || isCourierMissing || isTrackingMissing;

  const items: FulfillmentItem[] = (data?.items ?? []).map(normalizeFulfillmentItem);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">출고 관리</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          상품 포장부터 배송 완료까지 출고 현황을 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>출고 작업 목록</CardTitle>
          <CardDescription>상태를 필터링하고 각 항목의 배송 정보를 업데이트하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 상태 필터 탭 */}
          <div className="border-input flex w-fit flex-wrap gap-1 rounded-md border p-1">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={[
                  'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  statusFilter === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">불러오는 중...</span>
            </div>
          )}

          {/* 빈 상태 */}
          {!isLoading && items.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
              <Package className="size-10 opacity-40" />
              <p className="text-sm">해당하는 출고 작업이 없습니다.</p>
            </div>
          )}

          {/* 데이터 테이블 */}
          {!isLoading && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pr-4 pb-3 font-medium">예약 번호</th>
                    <th className="pr-4 pb-3 font-medium">예약자</th>
                    <th className="pr-4 pb-3 font-medium">등록일</th>
                    <th className="pr-4 pb-3 font-medium">상태</th>
                    <th className="pr-4 pb-3 font-medium">택배사</th>
                    <th className="pr-4 pb-3 font-medium">송장번호</th>
                    <th className="pb-3 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 font-mono text-xs">{item.reservationNumber}</td>
                      <td className="py-3 pr-4">{item.userName}</td>
                      <td className="text-muted-foreground py-3 pr-4 tabular-nums">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_BADGE_VARIANT[item.status]}>
                          {STATUS_LABEL[item.status]}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">{item.courier ?? '—'}</td>
                      <td className="text-muted-foreground py-3 pr-4 font-mono text-xs">
                        {item.trackingNumber ?? '—'}
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" onClick={() => openUpdateDialog(item)}>
                          <Pencil className="size-3.5" />
                          상태 변경
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상태 업데이트 다이얼로그 */}
      <Dialog open={dialogState !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>출고 상태 업데이트</DialogTitle>
          </DialogHeader>

          {dialogState && (
            <div className="space-y-4">
              <div className="bg-muted rounded-md px-4 py-3 text-sm">
                <span className="text-muted-foreground">예약 번호: </span>
                <span className="font-mono font-medium">{dialogState.item.reservationNumber}</span>
                <span className="text-muted-foreground ml-4">예약자: </span>
                <span className="font-medium">{dialogState.item.userName}</span>
              </div>

              {/* 상태 선택 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">새 상태</label>
                <Select
                  value={dialogState.newStatus}
                  onValueChange={(value) =>
                    setDialogState((prev) =>
                      prev ? { ...prev, newStatus: value as FulfillmentStatus } : prev,
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 택배사 입력 — 발송/완료 시 필수 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  택배사
                  {isTrackingRequired && <span className="text-destructive ml-1">*</span>}
                </label>
                <Input
                  placeholder="예: CJ대한통운, 롯데택배, 한진택배"
                  value={dialogState.courier}
                  onChange={(e) =>
                    setDialogState((prev) => (prev ? { ...prev, courier: e.target.value } : prev))
                  }
                  aria-invalid={isCourierMissing}
                />
                {isCourierMissing && (
                  <p className="text-destructive text-xs">
                    발송·완료 상태에는 택배사가 필요합니다.
                  </p>
                )}
              </div>

              {/* 송장번호 입력 — 발송/완료 시 필수 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  송장번호
                  {isTrackingRequired && <span className="text-destructive ml-1">*</span>}
                </label>
                <Input
                  placeholder="송장번호 입력"
                  value={dialogState.trackingNumber}
                  onChange={(e) =>
                    setDialogState((prev) =>
                      prev ? { ...prev, trackingNumber: e.target.value } : prev,
                    )
                  }
                  aria-invalid={isTrackingMissing}
                />
                {isTrackingMissing && (
                  <p className="text-destructive text-xs">
                    발송·완료 상태에는 송장번호가 필요합니다.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={updateMutation.isPending}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdateDisabled}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
