'use client';

import { CalendarCheck, TrendingUp, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

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

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">{description}</p>
    </div>
  );
}
