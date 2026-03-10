'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface DataTablePaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  selectedRowCount?: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
}

export function DataTablePagination({
  pageIndex,
  pageCount,
  pageSize,
  selectedRowCount,
  onPaginationChange,
}: DataTablePaginationProps) {
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;
  const currentPage = pageCount === 0 ? 0 : pageIndex + 1;

  function handlePrev() {
    if (!canGoPrev) return;
    onPaginationChange(pageIndex - 1, pageSize);
  }

  function handleNext() {
    if (!canGoNext) return;
    onPaginationChange(pageIndex + 1, pageSize);
  }

  function handlePageSizeChange(value: string) {
    onPaginationChange(0, Number(value));
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {/* 선택된 행 수 표시 */}
      <div className="text-muted-foreground min-w-[6rem] text-sm">
        {selectedRowCount !== undefined && selectedRowCount > 0
          ? `${selectedRowCount}행 선택됨`
          : null}
      </div>

      {/* 중앙: 페이지 이동 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="이전 페이지"
        >
          <ChevronLeftIcon className="size-4" />
          이전
        </Button>

        <span className="text-muted-foreground text-sm whitespace-nowrap">
          {currentPage} / {pageCount} 페이지
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="다음 페이지"
        >
          다음
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* 우측: 페이지 크기 선택 */}
      <div className="flex min-w-[6rem] items-center justify-end gap-2">
        <span className="text-muted-foreground text-sm whitespace-nowrap">페이지당 행</span>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger size="sm" className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
