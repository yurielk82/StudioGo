'use client';

import { useFeatureFlags, useToggleFeatureFlag } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function FeatureFlagsPage() {
  const { data: flags, isLoading } = useFeatureFlags();
  const toggleFlag = useToggleFeatureFlag();

  function handleToggle(id: string, currentEnabled: boolean) {
    toggleFlag.mutate({ id, enabled: !currentEnabled });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">기능 플래그 관리</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          기능별 활성화 여부를 실시간으로 제어합니다.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="bg-muted h-5 w-40 rounded" />
                <div className="bg-muted mt-1 h-4 w-64 rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!flags || flags.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">등록된 기능 플래그가 없습니다.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && flags && flags.length > 0 && (
        <div className="flex flex-col gap-3">
          {flags.map((flag) => (
            <Card
              key={flag.id}
              className={
                flag.enabled
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-muted-foreground/30 border-l-4'
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <CardTitle className="text-base">{flag.key}</CardTitle>
                    {flag.description && <CardDescription>{flag.description}</CardDescription>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Label
                      htmlFor={`flag-${flag.id}`}
                      className={
                        flag.enabled
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }
                    >
                      {flag.enabled ? '활성화' : '비활성화'}
                    </Label>
                    <Switch
                      id={`flag-${flag.id}`}
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag.id, flag.enabled)}
                      disabled={toggleFlag.isPending}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
