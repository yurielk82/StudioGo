import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { STEP_ORDER } from '@/stores/reservation-wizard-store';
import type { WizardStep } from '@/stores/reservation-wizard-store';

const STEP_LABELS: Record<WizardStep, string> = {
  studio: '스튜디오',
  date: '날짜',
  time: '시간',
  services: '서비스',
  confirm: '확인',
};

const STEPS = STEP_ORDER.map((key) => ({ key, label: STEP_LABELS[key] }));

interface WizardStepsProps {
  currentStep: WizardStep;
}

export function WizardSteps({ currentStep }: WizardStepsProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between gap-2">
      {STEPS.map(({ key, label }, index) => {
        const isDone = index < currentIndex;
        const isCurrent = key === currentStep;

        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
            {/* 동그라미 + 연결선 */}
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={cn('h-0.5 flex-1', isDone || isCurrent ? 'bg-primary' : 'bg-muted')}
                />
              )}
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isDone && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-primary/30 ring-4',
                  !isDone && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1', isDone ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
            <span
              className={cn(
                'text-xs',
                isCurrent ? 'text-primary font-medium' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
