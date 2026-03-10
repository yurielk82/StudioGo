'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

import { useSystemLogs } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── 타입 ──────────────────────────────────────────────────────────────────

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

// ── 상수 ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const AUTO_REFRESH_INTERVAL = 30_000;

const LEVEL_BADGE_CLASS: Record<LogLevel, string> = {
  INFO: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  WARN: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  ERROR: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

// ── 헬퍼 함수 ─────────────────────────────────────────────────────────────

function inferLevel(action: string): LogLevel {
  const upper = action.toUpperCase();
  if (upper.startsWith('ERROR') || upper.includes('FAIL') || upper.includes('DENIED')) {
    return 'ERROR';
  }
  if (upper.startsWith('WARN') || upper.includes('RETRY') || upper.includes('EXPIRED')) {
    return 'WARN';
  }
  return 'INFO';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const ymd = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const hms = d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${ymd} ${hms}`;
}

function formatDetails(details: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) return '—';
  try {
    return JSON.stringify(details, null, 0)
      .replace(/[{}]/g, '')
      .replace(/"/g, '')
      .replace(/,/g, ', ')
      .slice(0, 120);
  } catch {
    return '—';
  }
}

// ── 스켈레톤 행 ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="bg-muted h-4 animate-pulse rounded"
            style={{ width: `${[88, 52, 72, 80, 72, 120][i]}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading, refetch, isFetching } = useSystemLogs({ page });

  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // 자동 갱신 — 30초마다 현재 페이지 재조회
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      void refetch();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, refetch]);

  // 페이지 변경 시 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">시스템 로그</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            전체 {total.toLocaleString()}개의 이벤트
          </p>
        </div>

        {/* 툴바 */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : ''} />
            새로고침
          </Button>

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh((v) => !v)}
          >
            <Clock />
            {autoRefresh ? '자동 갱신 ON' : '자동 갱신'}
          </Button>
        </div>
      </div>

      {/* 테이블 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">로그 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                    시간
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                    레벨
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                    액터
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                    액션
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                    대상
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left font-medium whitespace-nowrap">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground px-4 py-16 text-center text-sm"
                    >
                      로그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((log) => {
                    const level = inferLevel(log.action);
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-muted/40 border-b transition-colors last:border-0"
                      >
                        {/* 시간 */}
                        <td className="text-muted-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                          {formatTimestamp(log.createdAt)}
                        </td>

                        {/* 레벨 배지 */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={LEVEL_BADGE_CLASS[level]}>{level}</Badge>
                        </td>

                        {/* 액터 */}
                        <td className="text-muted-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                          {log.userId ? (
                            <span className="bg-muted rounded px-1.5 py-0.5" title={log.userId}>
                              {log.userId.slice(0, 8)}…
                            </span>
                          ) : (
                            <span className="opacity-40">시스템</span>
                          )}
                        </td>

                        {/* 액션 */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium">{log.action}</span>
                        </td>

                        {/* 대상 */}
                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                          {log.target || '—'}
                        </td>

                        {/* 상세 */}
                        <td
                          className="text-muted-foreground max-w-xs truncate px-4 py-3"
                          title={JSON.stringify(log.details)}
                        >
                          {formatDetails(log.details)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-muted-foreground text-sm">
                {page} / {totalPages} 페이지
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev || isFetching}
                >
                  <ChevronLeft />
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || isFetching}
                >
                  다음
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
