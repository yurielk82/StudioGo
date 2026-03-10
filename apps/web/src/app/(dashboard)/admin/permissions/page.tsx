'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

import { useOperatorList, useOperatorPermissions, useUpdatePermissions } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── 타입 ──────────────────────────────────────────────────────────────────

type PermissionKey =
  | 'canApproveReservations'
  | 'canManageCheckins'
  | 'canManageFulfillment'
  | 'canViewReports'
  | 'canManageMembers';

type Permissions = Record<PermissionKey, boolean>;

// ── 권한 카테고리 정의 ──────────────────────────────────────────────────

const PERMISSION_ITEMS: { key: PermissionKey; label: string; description: string }[] = [
  {
    key: 'canApproveReservations',
    label: '예약 관리',
    description: '예약 승인·거절·취소 처리',
  },
  {
    key: 'canManageMembers',
    label: '회원 관리',
    description: '셀러 승인·정지·등급 변경',
  },
  {
    key: 'canManageCheckins',
    label: '체크인',
    description: '방문 체크인 및 QR 스캔 처리',
  },
  {
    key: 'canManageFulfillment',
    label: '출고',
    description: '상품 출고 및 포장 작업 처리',
  },
  {
    key: 'canViewReports',
    label: '설정 조회',
    description: '운영 리포트 및 통계 열람',
  },
];

const DEFAULT_PERMISSIONS: Permissions = {
  canApproveReservations: false,
  canManageCheckins: false,
  canManageFulfillment: false,
  canViewReports: false,
  canManageMembers: false,
};

// ── 스켈레톤 ──────────────────────────────────────────────────────────────

function PermissionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <div className="bg-muted h-4 w-4 animate-pulse rounded" />
          <div className="space-y-1.5">
            <div className="bg-muted h-4 w-28 animate-pulse rounded" />
            <div className="bg-muted h-3 w-44 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [localPerms, setLocalPerms] = useState<Permissions>(DEFAULT_PERMISSIONS);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const { data: operatorListData, isLoading: isOperatorListLoading } = useOperatorList();
  const { data: permissionsData, isLoading: isPermissionsLoading } =
    useOperatorPermissions(selectedOperatorId);
  const updatePermissions = useUpdatePermissions();

  // 권한 데이터가 로드되면 로컬 상태에 반영
  useEffect(() => {
    if (permissionsData?.permissions) {
      setLocalPerms(permissionsData.permissions);
    }
  }, [permissionsData]);

  // 운영자 선택 초기화
  useEffect(() => {
    setLocalPerms(DEFAULT_PERMISSIONS);
    setFeedback(null);
  }, [selectedOperatorId]);

  const handleToggle = (key: PermissionKey) => {
    setLocalPerms((prev) => ({ ...prev, [key]: !prev[key] }));
    setFeedback(null);
  };

  const handleSave = () => {
    if (!selectedOperatorId) return;

    updatePermissions.mutate(
      { operatorId: selectedOperatorId, permissions: localPerms },
      {
        onSuccess: () => {
          setFeedback({ type: 'success', message: '권한이 저장되었습니다.' });
          setTimeout(() => setFeedback(null), 3000);
        },
        onError: () => {
          setFeedback({ type: 'error', message: '저장에 실패했습니다. 다시 시도해 주세요.' });
        },
      },
    );
  };

  const operators = operatorListData?.items ?? [];
  const selectedOperator = operators.find((op) => op.id === selectedOperatorId);
  const isDirty =
    selectedOperatorId !== null &&
    permissionsData !== undefined &&
    JSON.stringify(localPerms) !== JSON.stringify(permissionsData.permissions);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">운영자 권한 관리</h2>
        <p className="text-muted-foreground mt-1 text-sm">운영자별 기능 접근 권한을 설정합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" />
            <CardTitle className="text-base">권한 설정</CardTitle>
          </div>
          <CardDescription>운영자를 선택한 후 권한을 조정하고 저장하세요.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 운영자 선택 드롭다운 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">운영자 선택</label>
            {isOperatorListLoading ? (
              <div className="bg-muted h-9 w-64 animate-pulse rounded-md" />
            ) : (
              <Select
                value={selectedOperatorId ?? ''}
                onValueChange={(val) => setSelectedOperatorId(val || null)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="운영자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {operators.length === 0 ? (
                    <div className="text-muted-foreground px-2 py-3 text-center text-sm">
                      등록된 운영자가 없습니다
                    </div>
                  ) : (
                    operators.map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                        <span className="text-muted-foreground ml-1 text-xs">(@{op.nickname})</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 권한 목록 */}
          {selectedOperatorId && (
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">{selectedOperator?.name ?? ''}의 권한</p>
                <span className="text-muted-foreground text-xs">
                  {Object.values(localPerms).filter(Boolean).length} / {PERMISSION_ITEMS.length}{' '}
                  활성
                </span>
              </div>

              {isPermissionsLoading ? (
                <PermissionSkeleton />
              ) : (
                <div className="space-y-2">
                  {PERMISSION_ITEMS.map(({ key, label, description }) => (
                    <label
                      key={key}
                      className="hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors"
                    >
                      <Checkbox
                        id={key}
                        checked={localPerms[key]}
                        onCheckedChange={() => handleToggle(key)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-muted-foreground text-xs">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 플레이스홀더 — 운영자 미선택 */}
          {!selectedOperatorId && !isOperatorListLoading && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10">
              <ShieldCheck className="size-10 opacity-30" />
              <p className="text-sm">운영자를 선택하면 권한 목록이 표시됩니다.</p>
            </div>
          )}

          {/* 피드백 메시지 */}
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <XCircle className="size-4 shrink-0" />
              )}
              {feedback.message}
            </div>
          )}

          {/* 저장 버튼 */}
          {selectedOperatorId && !isPermissionsLoading && (
            <div className="flex justify-end border-t pt-4">
              <Button onClick={handleSave} disabled={updatePermissions.isPending || !isDirty}>
                {updatePermissions.isPending ? '저장 중…' : '저장'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
