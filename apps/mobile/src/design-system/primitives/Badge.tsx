import { View } from 'react-native';
import { StyledText } from './Text';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
  /** 점(dot) 스타일 (텍스트 없이 작은 원) */
  dot?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary' },
  secondary: { bg: 'bg-secondary-50', text: 'text-secondary-700' },
  success: { bg: 'bg-success-light', text: 'text-success' },
  warning: { bg: 'bg-warning-light', text: 'text-yellow-700' },
  error: { bg: 'bg-error-light', text: 'text-error' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
};

export function Badge({ children, variant = 'primary', className = '', dot = false }: BadgeProps) {
  const style = VARIANT_STYLES[variant];

  if (dot) {
    return <View className={`w-2 h-2 rounded-full ${style.bg} ${className}`} />;
  }

  return (
    <View className={`rounded-badge px-2 py-0.5 ${style.bg} ${className}`}>
      <StyledText variant="label-sm" className={style.text}>
        {children}
      </StyledText>
    </View>
  );
}
