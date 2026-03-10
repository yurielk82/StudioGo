'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScanLine, Hash, ClipboardList, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useCheckin, useCheckout } from '@/hooks/useOperator';
import { apiClient } from '@/lib/api/client';
import { API_ROUTES, QUERY_KEYS } from '@/constants/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type CheckinMethod = 'QR' | 'PIN' | 'MANUAL';

interface CheckinRecord {
  id: string;
  reservationNumber: string;
  userName: string;
  studioName: string;
  checkinAt: string;
  checkoutAt: string | null;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
}

interface CheckinHistoryResponse {
  items: CheckinRecord[];
}

type FeedbackState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

const METHOD_TABS: { id: CheckinMethod; label: string; icon: typeof ScanLine }[] = [
  { id: 'QR', label: 'QR 코드', icon: ScanLine },
  { id: 'PIN', label: 'PIN 번호', icon: Hash },
  { id: 'MANUAL', label: '수동 입력', icon: ClipboardList },
];

const STATUS_LABEL: Record<CheckinRecord['status'], string> = {
  CHECKED_IN: '체크인 중',
  CHECKED_OUT: '체크아웃',
};

const STATUS_VARIANT: Record<CheckinRecord['status'], 'default' | 'secondary'> = {
  CHECKED_IN: 'default',
  CHECKED_OUT: 'secondary',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function OperatorCheckinPage() {
  const [activeMethod, setActiveMethod] = useState<CheckinMethod>('QR');
  const [qrValue, setQrValue] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const checkinMutation = useCheckin();
  const checkoutMutation = useCheckout();

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: [...QUERY_KEYS.operator.dashboard, 'checkin-history'],
    queryFn: () => apiClient<CheckinHistoryResponse>(API_ROUTES.OPERATOR.CHECKIN),
  });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const getInputValue = (): string => {
    if (activeMethod === 'QR') return qrValue.trim();
    if (activeMethod === 'PIN') return pinValue.trim();
    return manualValue.trim();
  };

  const clearInput = () => {
    if (activeMethod === 'QR') setQrValue('');
    else if (activeMethod === 'PIN') setPinValue('');
    else setManualValue('');
  };

  const handleCheckin = async () => {
    const reservationId = getInputValue();
    if (!reservationId) {
      showFeedback('error', '예약 번호를 입력해 주세요.');
      return;
    }

    checkinMutation.mutate(
      { reservationId, method: activeMethod },
      {
        onSuccess: () => {
          showFeedback('success', '체크인이 완료되었습니다.');
          clearInput();
        },
        onError: (err: Error) => {
          showFeedback('error', err.message ?? '체크인 처리 중 오류가 발생했습니다.');
        },
      },
    );
  };

  const handleCheckout = (reservationId: string) => {
    checkoutMutation.mutate(reservationId, {
      onSuccess: () => showFeedback('success', '체크아웃이 완료되었습니다.'),
      onError: (err: Error) => {
        showFeedback('error', err.message ?? '체크아웃 처리 중 오류가 발생했습니다.');
      },
    });
  };

  const isSubmitting = checkinMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">체크인 관리</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          셀러의 스튜디오 입장을 확인하고 체크인·체크아웃을 처리합니다.
        </p>
      </div>

      {/* 피드백 메시지 */}
      {feedback && (
        <div
          className={[
            'flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium',
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          ].join(' ')}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="size-4 shrink-0" />
          ) : (
            <XCircle className="size-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* 체크인 입력 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>체크인 처리</CardTitle>
          <CardDescription>방법을 선택한 후 예약 정보를 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 방법 선택 버튼 그룹 */}
          <div className="border-input flex w-fit gap-1 rounded-md border p-1">
            {METHOD_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveMethod(id);
                  setFeedback(null);
                }}
                className={[
                  'flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  activeMethod === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                ].join(' ')}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {/* QR 코드 입력 */}
          {activeMethod === 'QR' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">QR 코드 값</label>
              <Input
                autoFocus
                placeholder="QR 스캐너로 코드를 스캔하거나 예약 ID를 입력하세요"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
              />
              <p className="text-muted-foreground text-xs">
                스캐너 연결 시 자동으로 값이 입력됩니다.
              </p>
            </div>
          )}

          {/* PIN 번호 입력 */}
          {activeMethod === 'PIN' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">PIN 번호 (6자리)</label>
              <Input
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6자리 PIN 번호 입력"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
              />
            </div>
          )}

          {/* 수동 입력 */}
          {activeMethod === 'MANUAL' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">예약 번호</label>
              <Input
                autoFocus
                placeholder="예약 번호를 직접 입력하세요 (예: RES-20240101-001)"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
              />
            </div>
          )}

          <Button onClick={handleCheckin} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? '처리 중...' : '체크인 확인'}
          </Button>
        </CardContent>
      </Card>

      {/* 최근 체크인 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 체크인 내역</CardTitle>
          <CardDescription>오늘 처리된 체크인 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted h-12 animate-pulse rounded-md" />
              ))}
            </div>
          ) : !historyData?.items?.length ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              오늘 처리된 체크인 내역이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pr-4 pb-3 font-medium">예약 번호</th>
                    <th className="pr-4 pb-3 font-medium">셀러명</th>
                    <th className="pr-4 pb-3 font-medium">스튜디오</th>
                    <th className="pr-4 pb-3 font-medium">체크인 시간</th>
                    <th className="pr-4 pb-3 font-medium">체크아웃 시간</th>
                    <th className="pb-3 font-medium">상태</th>
                    <th className="pb-3 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historyData.items.map((record) => (
                    <tr key={record.id} className="py-3">
                      <td className="py-3 pr-4 font-mono text-xs">{record.reservationNumber}</td>
                      <td className="py-3 pr-4">{record.userName}</td>
                      <td className="text-muted-foreground py-3 pr-4">{record.studioName}</td>
                      <td className="py-3 pr-4 tabular-nums">{formatTime(record.checkinAt)}</td>
                      <td className="text-muted-foreground py-3 pr-4 tabular-nums">
                        {record.checkoutAt ? formatTime(record.checkoutAt) : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_VARIANT[record.status]}>
                          {STATUS_LABEL[record.status]}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {record.status === 'CHECKED_IN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={checkoutMutation.isPending}
                            onClick={() => handleCheckout(record.id)}
                          >
                            <LogOut className="size-3.5" />
                            체크아웃
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
