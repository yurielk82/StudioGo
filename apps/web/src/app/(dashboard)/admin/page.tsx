'use client';

import { LayoutDashboard, Users, CalendarCheck, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">관리자 대시보드</h2>
        <p className="text-muted-foreground mt-1 text-sm">StudioGo 전체 운영 현황을 확인하세요.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard icon={CalendarCheck} label="이번 달 예약" value="—" />
        <DashboardCard icon={Users} label="전체 회원" value="—" />
        <DashboardCard icon={TrendingUp} label="가동률" value="—" />
        <DashboardCard icon={LayoutDashboard} label="스튜디오" value="—" />
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

function DashboardCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
