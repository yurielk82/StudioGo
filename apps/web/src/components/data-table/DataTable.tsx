'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from './DataTablePagination';

// ────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────

interface DataTableProps<TData> {
  /** 컬럼 정의 (@tanstack/react-table ColumnDef) */
  columns: ColumnDef<TData>[];
  /** 현재 페이지 데이터 */
  data: TData[];
  /** 로딩 중 여부 — true 시 스켈레톤 행 표시 */
  isLoading?: boolean;
  /** 데이터 없을 때 표시할 메시지 */
  emptyMessage?: string;
  /** 행 선택(체크박스) 활성화 여부 */
  enableRowSelection?: boolean;
  /** 선택 상태 변경 콜백 */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** 서버사이드 페이지네이션: 전체 페이지 수 */
  pageCount?: number;
  /** 현재 페이지 인덱스 (0-based) */
  pageIndex?: number;
  /** 페이지당 행 수 */
  pageSize?: number;
  /** 페이지네이션 변경 콜백 (pageIndex, pageSize) */
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

// 스켈레톤 행 개수
const SKELETON_ROW_COUNT = 5;

// ────────────────────────────────────────────────────────────
// 정렬 아이콘
// ────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (direction === 'asc') return <ArrowUpIcon className="ml-1 size-3.5 shrink-0" />;
  if (direction === 'desc') return <ArrowDownIcon className="ml-1 size-3.5 shrink-0" />;
  return <ChevronsUpDownIcon className="text-muted-foreground/50 ml-1 size-3.5 shrink-0" />;
}

// ────────────────────────────────────────────────────────────
// DataTable
// ────────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = '데이터가 없습니다.',
  enableRowSelection = false,
  onRowSelectionChange,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // 행 선택 상태 변경 시 부모에 알림
  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
      setRowSelection((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onRowSelectionChange?.(next);
        return next;
      });
    },
    [onRowSelectionChange],
  );

  // 선택 체크박스 컬럼 (enableRowSelection 시 앞에 삽입)
  const selectionColumn: ColumnDef<TData> = {
    id: '__select__',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="전체 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };

  const effectiveColumns: ColumnDef<TData>[] = enableRowSelection
    ? [selectionColumn, ...columns]
    : columns;

  const pagination: PaginationState = { pageIndex, pageSize };

  const table = useReactTable<TData>({
    data,
    columns: effectiveColumns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    pageCount,
    manualPagination: true,
    enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange as Parameters<
      typeof useReactTable<TData>
    >[0]['onRowSelectionChange'],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const colSpan = effectiveColumns.length;
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border">
        <Table>
          {/* ── 헤더 ── */}
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center',
                            canSort &&
                              'hover:text-foreground cursor-pointer transition-colors select-none',
                          )}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          role={canSort ? 'button' : undefined}
                          tabIndex={canSort ? 0 : undefined}
                          onKeyDown={
                            canSort
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    header.column.getToggleSortingHandler()?.(e);
                                  }
                                }
                              : undefined
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIcon direction={sortDir} />}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* ── 바디 ── */}
          <TableBody>
            {isLoading ? (
              // 스켈레톤 행
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`} className="animate-pulse">
                  {Array.from({ length: colSpan }).map((_, colIdx) => (
                    <TableCell key={`skeleton-${rowIdx}-${colIdx}`}>
                      <div className="bg-muted h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              // 빈 상태
              <TableRow>
                <TableCell colSpan={colSpan} className="text-muted-foreground h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // 데이터 행
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── 페이지네이션 ── */}
      {onPaginationChange && (
        <DataTablePagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          pageSize={pageSize}
          selectedRowCount={enableRowSelection ? selectedCount : undefined}
          onPaginationChange={onPaginationChange}
        />
      )}
    </div>
  );
}
