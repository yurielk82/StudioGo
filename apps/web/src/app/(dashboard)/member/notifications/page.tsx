'use client';

import { useState, useCallback } from 'react';
import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Star,
  AlertTriangle,
  Info,
  Radio,
  UserCheck,
} from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ─── 타입 ──────────────────────────────────────────────────────────────────

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

// ─── 상수 ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// 알림 타입별 아이콘 + 색상 매핑
const NOTIFICATION_TYPE_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  RESERVATION_APPROVED: {
    icon: CalendarCheck,
    className: 'text-green-600 dark:text-green-400',
  },
  RESERVATION_REJECTED: {
    icon: CalendarCheck,
    className: 'text-destructive',
  },
  RESERVATION_REQUESTED: {
    icon: CalendarCheck,
    className: 'text-blue-600 dark:text-blue-400',
  },
  RESERVATION_CANCELLED_BY_MEMBER: {
    icon: CalendarCheck,
    className: 'text-muted-foreground',
  },
  RESERVATION_CANCELLED_BY_OPERATOR: {
    icon: CalendarCheck,
    className: 'text-orange-600 dark:text-orange-400',
  },
  BROADCAST_REMINDER: {
    icon: Radio,
    className: 'text-blue-600 dark:text-blue-400',
  },
  BROADCAST_START: {
    icon: Radio,
    className: 'text-green-600 dark:text-green-400',
  },
  BROADCAST_END: {
    icon: Radio,
    className: 'text-muted-foreground',
  },
  TIER_UPGRADED: {
    icon: Star,
    className: 'text-yellow-600 dark:text-yellow-400',
  },
  TIER_DOWNGRADED: {
    icon: Star,
    className: 'text-orange-600 dark:text-orange-400',
  },
  NO_SHOW: {
    icon: AlertTriangle,
    className: 'text-destructive',
  },
  MEMBER_APPROVED: {
    icon: UserCheck,
    className: 'text-green-600 dark:text-green-400',
  },
  MEMBER_REGISTERED: {
    icon: UserCheck,
    className: 'text-blue-600 dark:text-blue-400',
  },
  SCHEDULE_CHANGED: {
    icon: CalendarCheck,
    className: 'text-orange-600 dark:text-orange-400',
  },
};

const FALLBACK_NOTIFICATION_CONFIG: {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
} = {
  icon: Info,
  className: 'text-muted-foreground',
};

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

/**
 * ISO 날짜 문자열을 상대 시간 텍스트로 변환
 * 예: "3분 전", "2시간 전", "3일 전"
 */
function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return '방금 전';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}주 전`;

  // 오래된 날짜는 날짜 형식으로 표시
  return isoString.substring(0, 10).replace(/-/g, '.');
}

function getNotificationConfig(type: string) {
  return NOTIFICATION_TYPE_CONFIG[type] ?? FALLBACK_NOTIFICATION_CONFIG;
}

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-4 rounded-xl border p-4">
          <div className="bg-muted size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 w-1/3 rounded" />
            <div className="bg-muted h-3 w-2/3 rounded" />
            <div className="bg-muted h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BellOff className="text-muted-foreground/40 mb-4 size-12" />
      <p className="text-foreground text-base font-medium">새로운 알림이 없습니다</p>
      <p className="text-muted-foreground mt-1 text-sm">
        예약, 방송, 티어 변경 알림이 여기에 표시됩니다.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="text-destructive mb-4 size-10" />
      <p className="font-medium">알림을 불러오지 못했습니다.</p>
      <p className="text-muted-foreground mt-1 text-sm">
        네트워크 연결을 확인하고 새로고침해 주세요.
      </p>
    </div>
  );
}

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  isPending: boolean;
}

function NotificationItem({ notification, onMarkAsRead, isPending }: NotificationItemProps) {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const handleClick = useCallback(() => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, notification.isRead, onMarkAsRead]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || notification.isRead}
      className={[
        'w-full rounded-xl border text-left transition-colors',
        // 읽지 않은 알림: 파란 테두리 + 연파란 배경
        notification.isRead
          ? 'bg-card hover:bg-accent/30 border-border'
          : 'border-l-4 border-l-blue-500 bg-blue-50/60 dark:bg-blue-950/20',
        'disabled:cursor-default',
      ].join(' ')}
    >
      <div className="flex items-start gap-4 p-4">
        {/* 타입 아이콘 */}
        <div
          className={[
            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full',
            notification.isRead ? 'bg-muted' : 'bg-blue-100 dark:bg-blue-900/30',
          ].join(' ')}
        >
          <Icon className={`size-5 ${config.className}`} />
        </div>

        {/* 내용 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={[
                'text-sm leading-snug',
                notification.isRead ? 'font-normal' : 'font-semibold',
              ].join(' ')}
            >
              {notification.title}
            </p>
            {!notification.isRead && (
              <span
                className="mt-1 size-2 shrink-0 rounded-full bg-blue-500"
                aria-label="읽지 않음"
              />
            )}
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
            {notification.body}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function MemberNotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useNotifications(page);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const items: AppNotification[] = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const unreadCount = items.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead.mutate(id);
    },
    [markAsRead],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Bell className="size-6" />
            알림
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            예약, 방송, 티어 변경 등 주요 알림을 확인합니다.
          </p>
        </div>

        {/* 모두 읽음 버튼 */}
        {hasUnread && !isLoading && !isError && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="shrink-0 self-start"
          >
            <CheckCheck className="size-4" />
            {markAllAsRead.isPending ? '처리 중...' : '모두 읽음'}
          </Button>
        )}
      </div>

      {/* 읽지 않은 알림 수 표시 */}
      {!isLoading && !isError && hasUnread && (
        <p className="text-muted-foreground text-sm">
          읽지 않은 알림{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">{unreadCount}개</span>
        </p>
      )}

      {/* 알림 목록 */}
      <Card>
        <CardContent className="py-4">
          {isLoading ? (
            <NotificationSkeleton />
          ) : isError ? (
            <ErrorState />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  isPending={markAsRead.isPending}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {!isLoading && !isError && items.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                총 <span className="text-foreground font-semibold">{total}</span>개 알림
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
