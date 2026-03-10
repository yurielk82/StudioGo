'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function TopBar({ sidebarCollapsed, onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        'border-border bg-background/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-lg transition-all duration-300 lg:px-6',
        sidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-[240px]',
      )}
    >
      <div className="flex items-center gap-3">
        {/* 모바일 메뉴 토글 */}
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* 알림 */}
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground relative rounded-md p-2 transition-colors"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* 다크모드 토글 */}
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-2 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="테마 변경"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* 프로필 + 로그아웃 */}
        <div className="border-border flex items-center gap-2 border-l pl-3">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
            {user?.nickname?.charAt(0) ?? '?'}
          </div>
          <span className="hidden text-sm font-medium md:block">{user?.nickname}</span>
          <button
            type="button"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-2 transition-colors"
            onClick={() => logout.mutate()}
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const titles: Record<string, string> = {
    member: '홈',
    operator: '대시보드',
    admin: '대시보드',
    reservations: '예약 관리',
    calendar: '캘린더',
    notifications: '알림',
    profile: '프로필',
    members: '회원 관리',
    checkin: '체크인',
    fulfillment: '출고 관리',
    settings: '운영 설정',
    studios: '스튜디오 관리',
    blackouts: '블랙아웃',
    announcements: '공지사항',
    permissions: '권한 관리',
    'feature-flags': '기능 플래그',
    logs: '시스템 로그',
  };

  const lastSegment = segments[segments.length - 1];
  return titles[lastSegment] ?? 'StudioGo';
}
