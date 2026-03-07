import { Pressable, ActivityIndicator, View } from 'react-native';
import { forwardRef } from 'react';
import { StyledText } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-dark',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-secondary active:bg-secondary-dark',
    text: 'text-white',
  },
  outline: {
    container: 'border-2 border-primary bg-transparent active:bg-primary-50',
    text: 'text-primary',
  },
  ghost: {
    container: 'bg-transparent active:bg-neutral-100',
    text: 'text-neutral-700 dark:text-neutral-200',
  },
  danger: {
    container: 'bg-error active:bg-red-600',
    text: 'text-white',
  },
};

const SIZE_STYLES: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'h-9 px-3', text: 'text-label-md' },
  md: { container: 'h-12 px-5', text: 'text-label-lg' },
  lg: { container: 'h-14 px-6', text: 'text-body-lg font-semibold' },
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconRight,
    className = '',
    fullWidth = false,
  },
  ref,
) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center rounded-button
        ${variantStyle.container}
        ${sizeStyle.container}
        ${isDisabled ? 'opacity-50' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#6C5CE7' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          {typeof children === 'string' ? (
            <StyledText className={`${variantStyle.text} ${sizeStyle.text}`}>
              {children}
            </StyledText>
          ) : (
            children
          )}
          {iconRight && <View className="ml-2">{iconRight}</View>}
        </>
      )}
    </Pressable>
  );
});
