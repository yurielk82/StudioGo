'use client';

import { Building2 } from 'lucide-react';
import { useStudios } from '@/hooks/useAdmin';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StudioStep() {
  const { studioId, setStudio, nextStep } = useReservationWizardStore();
  const { data: studios, isLoading } = useStudios();

  const activeStudios = studios?.filter((s) => s.isActive) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">스튜디오 선택</h3>
        <p className="text-muted-foreground text-sm">사용할 스튜디오를 선택하세요.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : activeStudios.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          이용 가능한 스튜디오가 없습니다.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeStudios.map((studio) => (
            <Card
              key={studio.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                studioId === studio.id && 'border-primary ring-primary/20 ring-2',
              )}
              onClick={() => setStudio(studio.id, studio.name)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{studio.name}</p>
                  <p className="text-muted-foreground text-xs">수용 인원 {studio.capacity}명</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={nextStep} disabled={!studioId}>
          다음
        </Button>
      </div>
    </div>
  );
}
