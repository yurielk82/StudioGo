'use client';

import { useState } from 'react';
import { useAnnouncements, useCreateAnnouncement } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type AnnouncementType = 'NOTICE' | 'EVENT' | 'MAINTENANCE' | 'URGENT';

const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  NOTICE: '공지',
  EVENT: '이벤트',
  MAINTENANCE: '점검',
  URGENT: '긴급',
};

const ANNOUNCEMENT_TYPE_CLASSES: Record<AnnouncementType, string> = {
  NOTICE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  EVENT: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function AnnouncementTypeBadge({ type }: { type: string }) {
  const safeType =
    (type as AnnouncementType) in ANNOUNCEMENT_TYPE_LABELS ? (type as AnnouncementType) : 'NOTICE';

  return (
    <Badge className={ANNOUNCEMENT_TYPE_CLASSES[safeType]}>
      {ANNOUNCEMENT_TYPE_LABELS[safeType]}
    </Badge>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface CreateFormState {
  title: string;
  content: string;
  type: AnnouncementType;
}

const INITIAL_FORM: CreateFormState = {
  title: '',
  content: '',
  type: 'NOTICE',
};

function CreateAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);
  const createAnnouncement = useCreateAnnouncement();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setForm(INITIAL_FORM);
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) return;

    createAnnouncement.mutate(
      { title: form.title.trim(), content: form.content.trim(), type: form.type },
      {
        onSuccess: () => handleOpenChange(false),
      },
    );
  }

  const isSubmitDisabled =
    !form.title.trim() || !form.content.trim() || createAnnouncement.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>공지 작성</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>새 공지 작성</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-title">제목</Label>
            <Input
              id="announcement-title"
              placeholder="공지 제목을 입력하세요"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-type">유형</Label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, type: value as AnnouncementType }))
              }
            >
              <SelectTrigger id="announcement-type" className="w-full">
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOTICE">공지</SelectItem>
                <SelectItem value="EVENT">이벤트</SelectItem>
                <SelectItem value="MAINTENANCE">점검</SelectItem>
                <SelectItem value="URGENT">긴급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-content">내용</Label>
            <Textarea
              id="announcement-content"
              placeholder="공지 내용을 입력하세요"
              className="min-h-32"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {createAnnouncement.isPending ? '등록 중...' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            셀러 및 운영자에게 공개되는 공지를 관리합니다.
          </p>
        </div>
        <CreateAnnouncementDialog />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="bg-muted mb-3 h-4 w-16 rounded" />
                <div className="bg-muted mb-2 h-5 w-2/3 rounded" />
                <div className="bg-muted h-4 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!announcements || announcements.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">등록된 공지사항이 없습니다.</p>
            <p className="text-muted-foreground mt-1 text-xs">
              위의 공지 작성 버튼으로 첫 공지를 등록해보세요.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && announcements && announcements.length > 0 && (
        <div className="flex flex-col gap-3">
          {announcements.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <AnnouncementTypeBadge type={item.type} />
                      {item.isPublished ? (
                        <span className="text-muted-foreground text-xs">게시중</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">미게시</span>
                      )}
                    </div>
                    <CardTitle className="truncate text-base">{item.title}</CardTitle>
                  </div>
                  <time className="text-muted-foreground shrink-0 text-xs">
                    {formatDate(item.startsAt)}
                  </time>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 text-sm">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
