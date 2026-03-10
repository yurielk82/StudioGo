'use client';

import { CalendarCheck, TrendingUp, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { StatCard } from '@/components/dashboard/StatCard';

export default function MemberHomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">안녕하세요, {user?.nickname ?? '셀러'}님</h2>
        <p className="text-muted-foreground mt-1 text-sm">오늘의 스튜디오 현황을 확인하세요.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarCheck} label="이번 달 예약" value="—" description="예약 건수" />
        <StatCard icon={TrendingUp} label="이번 달 방송" value="—" description="완료된 방송" />
        <StatCard
          icon={Star}
          label="현재 등급"
          value={user?.tier ?? '—'}
          description="멤버십 티어"
        />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold">다음 예약</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          예약된 일정이 없습니다. 새 예약을 만들어 보세요.
        </p>
      </div>
    </div>
  );
}
