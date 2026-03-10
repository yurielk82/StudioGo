'use client';

import { Package, Plus, Minus, X } from 'lucide-react';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { useServices } from '@/hooks/useServices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ServicesStep() {
  const {
    services: selected,
    addService,
    removeService,
    updateServiceQuantity,
    nextStep,
    prevStep,
  } = useReservationWizardStore();
  const { data: serviceList, isLoading } = useServices();

  const activeServices = serviceList?.filter((s) => s.isActive) ?? [];

  function isSelected(serviceId: string) {
    return selected.some((s) => s.serviceId === serviceId);
  }

  function getSelected(serviceId: string) {
    return selected.find((s) => s.serviceId === serviceId);
  }

  function toggleService(service: { id: string; name: string }) {
    if (isSelected(service.id)) {
      removeService(service.id);
    } else {
      addService({ serviceId: service.id, serviceName: service.name, quantity: 1, memo: '' });
    }
  }

  function handleMemoChange(serviceId: string, memo: string) {
    const existing = getSelected(serviceId);
    if (existing) {
      addService({ ...existing, memo });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">부가서비스 선택</h3>
        <p className="text-muted-foreground text-sm">필요한 서비스를 선택하세요. (선택사항)</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : activeServices.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          이용 가능한 부가서비스가 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {activeServices.map((service) => {
            const checked = isSelected(service.id);
            const sel = getSelected(service.id);

            return (
              <Card
                key={service.id}
                className={cn('transition-all', checked && 'border-primary ring-primary/20 ring-1')}
              >
                <CardContent className="p-4">
                  {/* 헤더 */}
                  <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => toggleService(service)}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        checked
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {checked ? <X className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-muted-foreground text-xs">{service.description}</p>
                      )}
                    </div>
                    <Badge variant={checked ? 'default' : 'outline'}>
                      {checked ? '선택됨' : '선택'}
                    </Badge>
                  </div>

                  {/* 세부 입력 (선택 시) */}
                  {checked && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {/* 수량 */}
                      {service.requiresQuantity && sel && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">수량:</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateServiceQuantity(service.id, Math.max(1, sel.quantity - 1))
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {sel.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateServiceQuantity(service.id, sel.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* 메모 */}
                      {service.requiresMemo && (
                        <div>
                          <Input
                            placeholder="요청사항을 입력하세요"
                            value={sel?.memo ?? ''}
                            onChange={(e) => handleMemoChange(service.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-primary text-center text-sm font-medium">
          {selected.length}개 서비스 선택됨
        </p>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={prevStep}>
          이전
        </Button>
        <Button onClick={nextStep}>{selected.length > 0 ? '다음' : '건너뛰기'}</Button>
      </div>
    </div>
  );
}
