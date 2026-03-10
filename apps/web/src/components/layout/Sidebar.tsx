'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Bell,
  User,
  LayoutDashboard,
  ClipboardList,
  Users,
  ScanLine,
  PackageCheck,
  Settings,
  Building2,
  CalendarOff,
  Megaphone,
  Shield,
  ToggleLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@contracts/enums';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MEMBER_NAV: NavItem[] = [
  { href: '/member', label: '홈', icon: Home },
  { href: '/member/reservations', label: '예약', icon: ClipboardList },
  { href: '/member/calendar', label: '캘린더', icon: Calendar },
  { href: '/member/notifications', label: '알림', icon: Bell },
  { href: '/member/profile', label: '프로필', icon: User },
];

const OPERATOR_NAV: NavItem[] = [
  { href: '/operator', label: '대시보드', icon: LayoutDashboard },
  { href: '/operator/reservations', label: '예약 관리', icon: ClipboardList },
  { href: '/operator/members', label: '회원 관리', icon: Users },
  { href: '/operator/checkin', label: '체크인', icon: ScanLine },
  { href: '/operator/fulfillment', label: '출고 관리', icon: PackageCheck },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/settings', label: '운영 설정', icon: Settings },
  { href: '/admin/studios', label: '스튜디오 관리', icon: Building2 },
  { href: '/admin/blackouts', label: '블랙아웃', icon: CalendarOff },
  { href: '/admin/announcements', label: '공지사항', icon: Megaphone },
  { href: '/admin/permissions', label: '권한 관리', icon: Shield },
  { href: '/admin/feature-flags', label: '기능 플래그', icon: ToggleLeft },
  { href: '/admin/logs', label: '시스템 로그', icon: FileText },
];

function getNavItems(role: UserRole | null | undefined): NavItem[] {
  switch (role) {
    case 'OPERATOR':
      return OPERATOR_NAV;
    case 'ADMIN':
      return ADMIN_NAV;
    default:
      return MEMBER_NAV;
  }
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navItems = getNavItems(user?.role);

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-300',
        isCollapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      {/* 로고 */}
      <div className="border-sidebar-border flex h-16 items-center border-b px-4">
        {!isCollapsed && (
          <Link href="/" className="text-sidebar-primary text-lg font-bold">
            StudioGo
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-1.5 transition-colors',
            isCollapsed ? 'mx-auto' : 'ml-auto',
          )}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/member' &&
              item.href !== '/operator' &&
              item.href !== '/admin' &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                isCollapsed && 'justify-center px-0',
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 사용자 정보 */}
      {user && (
        <div className="border-sidebar-border border-t p-3">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {user.nickname?.charAt(0) ?? '?'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sidebar-foreground truncate text-sm font-medium">
                  {user.nickname}
                </p>
                <p className="text-sidebar-foreground/60 text-xs">{getRoleLabel(user.role)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

function getRoleLabel(role: UserRole | null | undefined): string {
  switch (role) {
    case 'OPERATOR':
      return '운영자';
    case 'ADMIN':
      return '관리자';
    default:
      return '셀러';
  }
}
