'use client';

import { useEffect } from 'react';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import { WizardSteps } from '@/components/reservation/WizardSteps';
import { StudioStep } from '@/components/reservation/StudioStep';
import { DateStep } from '@/components/reservation/DateStep';
import { TimeStep } from '@/components/reservation/TimeStep';
import { ServicesStep } from '@/components/reservation/ServicesStep';
import { ConfirmStep } from '@/components/reservation/ConfirmStep';
import { Card, CardContent } from '@/components/ui/card';

const STEP_COMPONENTS = {
  studio: StudioStep,
  date: DateStep,
  time: TimeStep,
  services: ServicesStep,
  confirm: ConfirmStep,
} as const;

export default function NewReservationPage() {
  const { step, reset } = useReservationWizardStore();

  useEffect(() => {
    reset();
  }, [reset]);

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">새 예약</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          스튜디오를 예약하려면 아래 단계를 진행하세요.
        </p>
      </div>

      {/* 스텝 프로그레스 */}
      <Card>
        <CardContent className="py-4">
          <WizardSteps currentStep={step} />
        </CardContent>
      </Card>

      {/* 스텝 컨텐츠 */}
      <Card>
        <CardContent className="py-6">
          <StepComponent />
        </CardContent>
      </Card>
    </div>
  );
}
