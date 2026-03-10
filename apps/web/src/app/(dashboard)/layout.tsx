'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 사이드바: 모바일에서는 오버레이로, 데스크톱에서는 고정 */}
      <div className={cn('lg:block', mobileOpen ? 'block' : 'hidden')}>
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-[240px]',
        )}
      >
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
