import { View } from 'react-native';
import { StyledText } from '@/design-system';
import { COLORS } from '@/design-system';

type WizardStep = 'studio' | 'date' | 'time' | 'services' | 'confirm';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'studio', label: '스튜디오' },
  { key: 'date', label: '날짜' },
  { key: 'time', label: '시간' },
  { key: 'services', label: '서비스' },
  { key: 'confirm', label: '확인' },
];

interface WizardProgressProps {
  currentStep: WizardStep;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <View className="flex-row items-center justify-between px-2 mb-6">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <View key={step.key} className="flex-1 items-center">
            {/* 스텝 번호 원 */}
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                isActive
                  ? 'bg-primary'
                  : isCompleted
                    ? 'bg-primary-light'
                    : 'bg-neutral-200'
              }`}
            >
              <StyledText
                variant="label-md"
                className={isActive || isCompleted ? 'text-white' : 'text-neutral-500'}
              >
                {String(index + 1)}
              </StyledText>
            </View>

            {/* 라벨 */}
            <StyledText
              variant="label-sm"
              className={isActive ? 'text-primary' : 'text-neutral-400'}
            >
              {step.label}
            </StyledText>

            {/* 연결선 (마지막 제외) */}
            {index < STEPS.length - 1 && (
              <View
                className="absolute top-4 left-1/2 w-full h-0.5"
                style={{
                  backgroundColor: isCompleted
                    ? COLORS.primary.light
                    : COLORS.neutral[200],
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
