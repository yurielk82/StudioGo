'use client';

import { useState } from 'react';
import { Plus, CalendarOff } from 'lucide-react';
import { useBlackouts, useCreateBlackout, useStudios } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BlackoutType = 'MAINTENANCE' | 'HOLIDAY' | 'OTHER';

interface BlackoutFormState {
  studioId: string;
  startAt: string;
  endAt: string;
  type: BlackoutType | '';
  reason: string;
}

const INITIAL_FORM: BlackoutFormState = {
  studioId: '',
  startAt: '',
  endAt: '',
  type: '',
  reason: '',
};

const BLACKOUT_TYPE_LABELS: Record<BlackoutType, string> = {
  MAINTENANCE: '정기 점검',
  HOLIDAY: '휴무',
  OTHER: '기타',
};

function blackoutTypeBadgeClass(type: string): string {
  if (type === 'MAINTENANCE')
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (type === 'HOLIDAY')
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  return 'bg-muted text-muted-foreground';
}

function formatDatetime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function BlackoutFormDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BlackoutFormState>(INITIAL_FORM);
  const { data: studios } = useStudios();
  const createBlackout = useCreateBlackout();

  const isValid =
    form.studioId !== '' &&
    form.startAt !== '' &&
    form.endAt !== '' &&
    form.type !== '' &&
    form.reason.trim().length > 0 &&
    form.endAt > form.startAt;

  function handleFieldChange(field: keyof BlackoutFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSelectChange(field: keyof BlackoutFormState) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || form.type === '') return;

    createBlackout.mutate(
      {
        studioId: form.studioId,
        startAt: form.startAt,
        endAt: form.endAt,
        type: form.type,
        reason: form.reason.trim(),
      },
      {
        onSuccess: () => {
          setForm(INITIAL_FORM);
          setOpen(false);
          onSuccess();
        },
      },
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) setForm(INITIAL_FORM);
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          블랙아웃 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블랙아웃 기간 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blackout-studio">스튜디오</Label>
            <Select value={form.studioId} onValueChange={handleSelectChange('studioId')}>
              <SelectTrigger id="blackout-studio" className="w-full">
                <SelectValue placeholder="스튜디오 선택" />
              </SelectTrigger>
              <SelectContent>
                {studios?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="blackout-start">시작 일시</Label>
              <Input
                id="blackout-start"
                type="datetime-local"
                value={form.startAt}
                onChange={handleFieldChange('startAt')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blackout-end">종료 일시</Label>
              <Input
                id="blackout-end"
                type="datetime-local"
                value={form.endAt}
                min={form.startAt || undefined}
                onChange={handleFieldChange('endAt')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blackout-type">유형</Label>
            <Select value={form.type} onValueChange={handleSelectChange('type')}>
              <SelectTrigger id="blackout-type" className="w-full">
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAINTENANCE">정기 점검</SelectItem>
                <SelectItem value="HOLIDAY">휴무</SelectItem>
                <SelectItem value="OTHER">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blackout-reason">사유</Label>
            <Textarea
              id="blackout-reason"
              placeholder="블랙아웃 사유를 입력하세요"
              value={form.reason}
              onChange={handleFieldChange('reason')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!isValid || createBlackout.isPending}>
              {createBlackout.isPending ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BlackoutTable({
  blackouts,
}: {
  blackouts: Array<{
    id: string;
    studioId: string;
    studioName: string;
    startAt: string;
    endAt: string;
    type: string;
    reason: string;
  }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-muted-foreground pr-6 pb-3 text-left font-medium">스튜디오</th>
            <th className="text-muted-foreground pr-6 pb-3 text-left font-medium">시작 일시</th>
            <th className="text-muted-foreground pr-6 pb-3 text-left font-medium">종료 일시</th>
            <th className="text-muted-foreground pr-6 pb-3 text-left font-medium">유형</th>
            <th className="text-muted-foreground pb-3 text-left font-medium">사유</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {blackouts.map((item) => (
            <tr key={item.id} className="hover:bg-muted/40 transition-colors">
              <td className="py-3 pr-6 font-medium">{item.studioName}</td>
              <td className="py-3 pr-6 tabular-nums">{formatDatetime(item.startAt)}</td>
              <td className="py-3 pr-6 tabular-nums">{formatDatetime(item.endAt)}</td>
              <td className="py-3 pr-6">
                <Badge className={blackoutTypeBadgeClass(item.type)}>
                  {BLACKOUT_TYPE_LABELS[item.type as BlackoutType] ?? item.type}
                </Badge>
              </td>
              <td className="text-muted-foreground max-w-xs truncate py-3">{item.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminBlackoutsPage() {
  const { data: blackouts, isLoading } = useBlackouts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">블랙아웃 관리</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            점검, 휴무 등 예약 불가 기간을 설정합니다.
          </p>
        </div>
        <BlackoutFormDialog onSuccess={() => {}} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>블랙아웃 목록</CardTitle>
          {!isLoading && blackouts && (
            <CardDescription>
              총 {blackouts.length}건의 블랙아웃이 등록되어 있습니다.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              불러오는 중...
            </div>
          )}

          {!isLoading && (!blackouts || blackouts.length === 0) && (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <CalendarOff className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm">등록된 블랙아웃 기간이 없습니다.</p>
            </div>
          )}

          {!isLoading && blackouts && blackouts.length > 0 && (
            <BlackoutTable blackouts={blackouts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
