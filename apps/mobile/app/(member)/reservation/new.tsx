import { ScrollView } from 'react-native';
import { useEffect } from 'react';
import { Screen } from '@/design-system';
import { useReservationWizardStore } from '@/stores/reservation-wizard-store';
import {
  WizardProgress,
  StudioSelectStep,
  DateSelectStep,
  TimeSelectStep,
  ServicesStep,
  ConfirmStep,
} from '@/features/reservation/components';

const STEP_COMPONENTS = {
  studio: StudioSelectStep,
  date: DateSelectStep,
  time: TimeSelectStep,
  services: ServicesStep,
  confirm: ConfirmStep,
} as const;

/**
 * 예약 위자드 — 5단계 멀티스텝 폼
 */
export default function NewReservationScreen() {
  const { step, reset } = useReservationWizardStore();

  // 화면 진입 시 위자드 초기화
  useEffect(() => {
    reset();
  }, []);

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <WizardProgress currentStep={step} />
        <StepComponent />
      </ScrollView>
    </Screen>
  );
}
