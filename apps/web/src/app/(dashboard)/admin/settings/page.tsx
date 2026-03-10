'use client';

import { useState, useCallback } from 'react';
import { Settings, Loader2, CheckCircle2, AlertCircle, Pencil, X } from 'lucide-react';
import { useOperationSettings, useUpdateSetting } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

// ── 타입 ──────────────────────────────────────────────

interface OperationSetting {
  key: string;
  value: unknown;
  description: string;
}

type SettingValueType = 'boolean' | 'number' | 'string' | 'object';

// ── 카테고리 메타데이터 ────────────────────────────────

interface CategoryMeta {
  label: string;
  description: string;
  order: number;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  schedule: {
    label: '스케줄 설정',
    description: '운영 시간, 슬롯 단위, 청소 시간 등 일정 관련 설정입니다.',
    order: 1,
  },
  reservation: {
    label: '예약 설정',
    description: '예약 가능일, 일일 예약 수, 취소 정책 등 예약 규칙을 설정합니다.',
    order: 2,
  },
  tier: {
    label: '티어 설정',
    description: '셀러 등급 승급 기준 횟수를 설정합니다.',
    order: 3,
  },
  notification: {
    label: '알림 설정',
    description: '방송 리마인더 등 알림 타이밍을 설정합니다.',
    order: 4,
  },
};

const FALLBACK_CATEGORY: CategoryMeta = {
  label: '기타 설정',
  description: '분류되지 않은 설정 항목입니다.',
  order: 99,
};

// ── 설정 키 한국어 레이블 ───────────────────────────────

const KEY_LABELS: Record<string, string> = {
  operating_hours: '운영 시간',
  slot_duration_minutes: '슬롯 단위 (분)',
  cleaning_duration_minutes: '청소 시간 (분)',
  max_advance_booking_days: '최대 사전 예약 가능일',
  max_slots_per_day_per_member: '셀러 당 하루 최대 예약 수',
  cancellation_deadline_hours: '취소 마감 (예약 전 시간)',
  auto_approve_gold_above: 'GOLD 이상 티어 자동 승인',
  tier_thresholds: '티어 승급 기준 (방송 완료 횟수)',
  hold_duration_seconds: '슬롯 Hold 유지 시간 (초)',
  reminder_before_minutes: '방송 리마인더 사전 알림 (분)',
};

// ── 유틸 함수 ─────────────────────────────────────────

function inferValueType(value: unknown): SettingValueType {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object' && value !== null) return 'object';
  return 'string';
}

function serializeValue(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value ?? '');
}

function parseInputToApiValue(raw: string, valueType: SettingValueType): unknown {
  if (valueType === 'number') return Number(raw);
  if (valueType === 'object') return JSON.parse(raw);
  return raw;
}

function isValidInput(raw: string, valueType: SettingValueType): boolean {
  if (valueType === 'number') return raw.trim() !== '' && !Number.isNaN(Number(raw));
  if (valueType === 'object') {
    try {
      JSON.parse(raw);
      return true;
    } catch {
      return false;
    }
  }
  return raw.trim().length > 0;
}

// ── 서브 컴포넌트: 설정 행 ────────────────────────────

interface SettingRowSaveState {
  status: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
}

interface SettingRowProps {
  setting: OperationSetting;
  onSave: (key: string, value: unknown) => Promise<void>;
}

function SettingRow({ setting, onSave }: SettingRowProps) {
  const valueType = inferValueType(setting.value);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(serializeValue(setting.value));
  const [boolValue, setBoolValue] = useState<boolean>(
    typeof setting.value === 'boolean' ? setting.value : false,
  );
  const [saveState, setSaveState] = useState<SettingRowSaveState>({ status: 'idle' });
  const [jsonError, setJsonError] = useState<string | null>(null);

  const label = KEY_LABELS[setting.key] ?? setting.key;
  const inputId = `setting-${setting.key}`;

  function handleEditStart() {
    setEditValue(serializeValue(setting.value));
    setBoolValue(typeof setting.value === 'boolean' ? setting.value : false);
    setJsonError(null);
    setSaveState({ status: 'idle' });
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setJsonError(null);
    setSaveState({ status: 'idle' });
  }

  function handleTextChange(raw: string) {
    setEditValue(raw);
    if (valueType === 'object') {
      try {
        JSON.parse(raw);
        setJsonError(null);
      } catch {
        setJsonError('올바른 JSON 형식이 아닙니다.');
      }
    }
  }

  async function handleSave() {
    if (!isValidInput(editValue, valueType)) return;

    setSaveState({ status: 'saving' });

    try {
      const parsed = parseInputToApiValue(editValue, valueType);
      await onSave(setting.key, parsed);
      setSaveState({ status: 'success', message: '저장되었습니다.' });
      setIsEditing(false);
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
    } catch {
      setSaveState({ status: 'error', message: '저장에 실패했습니다. 다시 시도해주세요.' });
    }
  }

  async function handleBoolToggle(next: boolean) {
    setBoolValue(next);
    setSaveState({ status: 'saving' });

    try {
      await onSave(setting.key, next);
      setSaveState({ status: 'success', message: '저장되었습니다.' });
      setTimeout(() => setSaveState({ status: 'idle' }), 2500);
    } catch {
      setBoolValue(!next);
      setSaveState({ status: 'error', message: '저장에 실패했습니다. 다시 시도해주세요.' });
    }
  }

  const canSave = isValidInput(editValue, valueType) && jsonError === null;

  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-6 [&:not(:last-child)]:border-b">
      {/* 레이블 + 설명 */}
      <div className="min-w-0 flex-1">
        <Label htmlFor={inputId} className="cursor-default text-sm font-medium">
          {label}
        </Label>
        {setting.description && (
          <p className="text-muted-foreground mt-0.5 text-xs">{setting.description}</p>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="flex flex-col gap-2 sm:w-80">
        {/* Boolean → Switch */}
        {valueType === 'boolean' && (
          <div className="flex items-center gap-3">
            <Switch
              id={inputId}
              checked={boolValue}
              onCheckedChange={handleBoolToggle}
              disabled={saveState.status === 'saving'}
            />
            <span className="text-sm">{boolValue ? '활성화' : '비활성화'}</span>
            {saveState.status === 'saving' && (
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            )}
          </div>
        )}

        {/* Number → Input[number] */}
        {valueType === 'number' && (
          <>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  id={inputId}
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!canSave || saveState.status === 'saving'}
                  className="h-8 shrink-0"
                >
                  {saveState.status === 'saving' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    '저장'
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saveState.status === 'saving'}
                  aria-label="취소"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-foreground rounded border px-3 py-1.5 font-mono text-sm">
                  {serializeValue(setting.value)}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleEditStart}
                  aria-label={`${label} 편집`}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* String → Input[text] */}
        {valueType === 'string' && (
          <>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  id={inputId}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!canSave || saveState.status === 'saving'}
                  className="h-8 shrink-0"
                >
                  {saveState.status === 'saving' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    '저장'
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saveState.status === 'saving'}
                  aria-label="취소"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-foreground rounded border px-3 py-1.5 font-mono text-sm">
                  {serializeValue(setting.value)}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleEditStart}
                  aria-label={`${label} 편집`}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Object → JSON Textarea */}
        {valueType === 'object' && (
          <>
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  id={inputId}
                  value={editValue}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  autoFocus
                />
                {jsonError && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {jsonError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!canSave || saveState.status === 'saving'}
                    className="h-8"
                  >
                    {saveState.status === 'saving' ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      '저장'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={saveState.status === 'saving'}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <pre className="text-foreground min-w-0 flex-1 overflow-x-auto rounded border px-3 py-2 font-mono text-xs leading-relaxed">
                  {serializeValue(setting.value)}
                </pre>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleEditStart}
                  className="mt-1 shrink-0"
                  aria-label={`${label} 편집`}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* 저장 결과 피드백 */}
        {saveState.status === 'success' && (
          <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            {saveState.message}
          </p>
        )}
        {saveState.status === 'error' && (
          <p className="text-destructive flex items-center gap-1 text-xs">
            <AlertCircle className="size-3.5 shrink-0" />
            {saveState.message}
          </p>
        )}
      </div>
    </div>
  );
}

// ── 서브 컴포넌트: 스켈레톤 로딩 ────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between py-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── 서브 컴포넌트: 에러 상태 ─────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="text-destructive mb-4 size-10" />
      <p className="font-medium">설정을 불러오지 못했습니다.</p>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        네트워크 연결을 확인하고 다시 시도해주세요.
      </p>
      <Button variant="outline" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────

export default function AdminSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useOperationSettings();
  const updateSetting = useUpdateSetting();

  const handleSave = useCallback(
    async (key: string, value: unknown) => {
      await updateSetting.mutateAsync({ key, value: serializeValue(value) });
    },
    [updateSetting],
  );

  // 카테고리별 그룹핑 — 설정 배열을 category 기준으로 분류
  const grouped = (settings ?? []).reduce<Record<string, OperationSetting[]>>((acc, setting) => {
    const cat = (setting as OperationSetting & { category?: string }).category ?? 'etc';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting as OperationSetting);
    return acc;
  }, {});

  // 카테고리 order 기준 정렬
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const orderA = (CATEGORY_META[a] ?? FALLBACK_CATEGORY).order;
    const orderB = (CATEGORY_META[b] ?? FALLBACK_CATEGORY).order;
    return orderA - orderB;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="size-6" />
          운영 설정
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          스튜디오 운영 규칙과 예약 정책을 설정합니다. 변경사항은 즉시 반영됩니다.
        </p>
      </div>

      {/* 로딩 */}
      {isLoading && <SettingsSkeleton />}

      {/* 에러 */}
      {isError && !isLoading && <ErrorState onRetry={refetch} />}

      {/* 설정 목록 — 카테고리별 Card */}
      {!isLoading && !isError && settings && (
        <div className="space-y-6">
          {sortedCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Settings className="text-muted-foreground/40 mb-3 size-12" />
              <p className="text-muted-foreground text-sm">등록된 설정 항목이 없습니다.</p>
            </div>
          ) : (
            sortedCategories.map((category) => {
              const meta = CATEGORY_META[category] ?? FALLBACK_CATEGORY;
              const categorySettings = grouped[category];

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{meta.label}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {categorySettings.map((setting) => (
                        <SettingRow key={setting.key} setting={setting} onSave={handleSave} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
