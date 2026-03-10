'use client';

import { LayoutDashboard, Users, CalendarCheck, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">관리자 대시보드</h2>
        <p className="text-muted-foreground mt-1 text-sm">StudioGo 전체 운영 현황을 확인하세요.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="이번 달 예약" value="—" />
        <StatCard icon={Users} label="전체 회원" value="—" />
        <StatCard icon={TrendingUp} label="가동률" value="—" />
        <StatCard icon={LayoutDashboard} label="스튜디오" value="—" />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold">예약 추이 차트</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Phase 2에서 recharts 차트와 함께 구현됩니다.
        </p>
      </div>
    </div>
  );
}
