'use client';

import { useState } from 'react';
import { Plus, Building2, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useStudios, useCreateStudio } from '@/hooks/useAdmin';
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

interface StudioFormState {
  name: string;
  capacity: string;
}

const INITIAL_FORM: StudioFormState = { name: '', capacity: '' };

function StudioFormDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StudioFormState>(INITIAL_FORM);
  const createStudio = useCreateStudio();

  const isValid = form.name.trim().length > 0 && Number(form.capacity) > 0;

  function handleChange(field: keyof StudioFormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    createStudio.mutate(
      { name: form.name.trim(), capacity: Number(form.capacity) },
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
          스튜디오 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 스튜디오 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studio-name">스튜디오 이름</Label>
            <Input
              id="studio-name"
              placeholder="예) A스튜디오"
              value={form.name}
              onChange={handleChange('name')}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studio-capacity">수용 인원 (명)</Label>
            <Input
              id="studio-capacity"
              type="number"
              min={1}
              placeholder="예) 10"
              value={form.capacity}
              onChange={handleChange('capacity')}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isValid || createStudio.isPending}>
              {createStudio.isPending ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudioTable({
  studios,
}: {
  studios: Array<{ id: string; name: string; capacity: number; isActive: boolean }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-muted-foreground pr-6 pb-3 text-left font-medium">이름</th>
            <th className="text-muted-foreground pr-6 pb-3 text-left font-medium">수용 인원</th>
            <th className="text-muted-foreground pb-3 text-left font-medium">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {studios.map((studio) => (
            <tr key={studio.id} className="hover:bg-muted/40 transition-colors">
              <td className="py-3 pr-6 font-medium">
                <div className="flex items-center gap-2">
                  <Building2 className="text-muted-foreground size-4 shrink-0" />
                  {studio.name}
                </div>
              </td>
              <td className="py-3 pr-6">
                <div className="flex items-center gap-1.5">
                  <Users className="text-muted-foreground size-3.5" />
                  <span>{studio.capacity}명</span>
                </div>
              </td>
              <td className="py-3">
                {studio.isActive ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <CheckCircle2 className="size-3" />
                    운영 중
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <XCircle className="size-3" />
                    비활성
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminStudiosPage() {
  const { data: studios, isLoading } = useStudios();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">스튜디오 관리</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            스튜디오를 등록하고 운영 상태를 관리합니다.
          </p>
        </div>
        <StudioFormDialog onSuccess={() => {}} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>스튜디오 목록</CardTitle>
          {!isLoading && studios && (
            <CardDescription>총 {studios.length}개의 스튜디오가 등록되어 있습니다.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              불러오는 중...
            </div>
          )}

          {!isLoading && (!studios || studios.length === 0) && (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <Building2 className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm">등록된 스튜디오가 없습니다.</p>
            </div>
          )}

          {!isLoading && studios && studios.length > 0 && <StudioTable studios={studios} />}
        </CardContent>
      </Card>
    </div>
  );
}
