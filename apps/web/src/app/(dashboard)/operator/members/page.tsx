'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useMembers } from '@/hooks/useOperator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// ─── 타입 ──────────────────────────────────────────────────────────────────

type MemberStatus = 'APPROVED' | 'PENDING' | 'SUSPENDED';

interface StatusFilter {
  label: string;
  value: string;
}

// ─── 상수 ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_FILTERS: StatusFilter[] = [
  { label: '전체', value: '' },
  { label: '활성', value: 'APPROVED' },
  { label: '대기', value: 'PENDING' },
  { label: '정지', value: 'SUSPENDED' },
];

const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  APPROVED: {
    label: '활성',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  PENDING: {
    label: '대기',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  SUSPENDED: {
    label: '정지',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

const ROLE_LABELS: Record<string, string> = {
  MEMBER: '셀러',
  OPERATOR: '운영자',
  ADMIN: '관리자',
};

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return dateStr.substring(0, 10).replace(/-/g, '.');
}

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status as MemberStatus] ?? {
      label: status,
      className: 'bg-muted text-muted-foreground',
    }
  );
}

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return <Badge className={config.className}>{config.label}</Badge>;
}

function MemberTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg border px-4 py-3">
          <div className="bg-muted size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 w-32 rounded" />
            <div className="bg-muted h-3 w-20 rounded" />
          </div>
          <div className="bg-muted h-5 w-12 rounded-full" />
          <div className="bg-muted h-5 w-12 rounded-full" />
          <div className="bg-muted h-4 w-20 rounded" />
          <div className="bg-muted h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="text-muted-foreground/40 mb-4 size-12" />
      <p className="text-foreground text-base font-medium">
        {hasSearch ? '검색 결과가 없습니다' : '등록된 회원이 없습니다'}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {hasSearch
          ? '다른 검색어나 필터를 시도해 보세요.'
          : '첫 번째 회원이 가입하면 여기에 표시됩니다.'}
      </p>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function OperatorMembersPage() {
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMembers({
    status: statusFilter || undefined,
    search: activeSearch || undefined,
  });

  const allItems = data?.items ?? [];
  const total = data?.meta?.total ?? allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 클라이언트 사이드 페이지네이션 (API가 페이지 파라미터를 지원하지 않는 경우 대비)
  const startIndex = (page - 1) * PAGE_SIZE;
  const pagedItems = allItems.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSearch = useCallback(() => {
    setActiveSearch(search);
    setPage(1);
  }, [search]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const hasSearch = Boolean(activeSearch || statusFilter);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">회원 관리</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          가입한 셀러 회원을 조회하고 상태를 확인할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
          <CardDescription>
            총 <span className="text-foreground font-semibold">{total}</span>명의 회원이 등록되어
            있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 검색 + 필터 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* 검색 입력 */}
            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="이름 또는 닉네임 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="default" onClick={handleSearch}>
                검색
              </Button>
            </div>

            {/* 상태 필터 */}
            <div className="flex items-center gap-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilter(filter.value)}
                  className={[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    statusFilter === filter.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* 테이블 영역 */}
          {isLoading ? (
            <MemberTableSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive text-sm">
                회원 목록을 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          ) : pagedItems.length === 0 ? (
            <EmptyState hasSearch={hasSearch} />
          ) : (
            <>
              {/* 테이블 헤더 (데스크탑) */}
              <div className="bg-muted/50 text-muted-foreground hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-lg px-4 py-2 text-xs font-medium md:grid">
                <span>프로필</span>
                <span>닉네임</span>
                <span>역할</span>
                <span>상태</span>
                <span>가입일</span>
                <span className="text-right">작업</span>
              </div>

              {/* 회원 행 목록 */}
              <div className="space-y-2">
                {pagedItems.map((member) => (
                  <div
                    key={member.id}
                    className="bg-card hover:bg-accent/30 grid grid-cols-1 gap-3 rounded-lg border px-4 py-3 transition-colors md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
                  >
                    {/* 프로필 (아바타 + 이름 + 전화번호) */}
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarImage src={undefined} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        <p className="text-muted-foreground truncate text-xs">{member.phone}</p>
                      </div>
                    </div>

                    {/* 닉네임 */}
                    <div className="flex items-center gap-1 md:block">
                      <span className="text-muted-foreground text-xs md:hidden">닉네임: </span>
                      <span className="truncate text-sm">{member.nickname || '—'}</span>
                    </div>

                    {/* 역할 */}
                    <div className="flex items-center gap-1 md:block">
                      <span className="text-muted-foreground text-xs md:hidden">역할: </span>
                      <span className="text-sm">{ROLE_LABELS[member.tier] ?? member.tier}</span>
                    </div>

                    {/* 상태 */}
                    <div className="flex items-center gap-1 md:block">
                      <span className="text-muted-foreground text-xs md:hidden">상태: </span>
                      <StatusBadge status={member.status} />
                    </div>

                    {/* 가입일 */}
                    <div className="flex items-center gap-1 md:block">
                      <span className="text-muted-foreground text-xs md:hidden">가입일: </span>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(member.lastLoginAt)}
                      </span>
                    </div>

                    {/* 상세보기 버튼 */}
                    <div className="flex justify-start md:justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/operator/members/${member.id}`}>상세보기</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 페이지네이션 */}
          {!isLoading && !isError && pagedItems.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, total)} / {total}명
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1}>
                  <ChevronLeft className="size-4" />
                  이전
                </Button>
                <span className="min-w-[60px] text-center text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                >
                  다음
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
