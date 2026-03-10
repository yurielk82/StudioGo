'use client';

import { ClipboardList, Users, ScanLine, PackageCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

export default function OperatorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">운영자 대시보드</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          오늘의 스튜디오 운영 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="오늘 예약" value="—" />
        <StatCard icon={ScanLine} label="체크인 대기" value="—" />
        <StatCard icon={Users} label="활성 회원" value="—" />
        <StatCard icon={PackageCheck} label="출고 대기" value="—" />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold">최근 예약</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Phase 2에서 DataTable과 함께 구현됩니다.
        </p>
      </div>
    </div>
  );
}
