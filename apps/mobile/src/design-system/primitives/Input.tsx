import { TextInput, View, TextInputProps } from 'react-native';
import { forwardRef, useState } from 'react';
import { StyledText } from './Text';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}

/**
 * 디자인 시스템 Input — label, error, hint 포함
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    icon,
    iconRight,
    className = '',
    inputClassName = '',
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error
    ? 'border-error'
    : isFocused
      ? 'border-primary'
      : 'border-neutral-300 dark:border-neutral-600';

  return (
    <View className={className}>
      {label && (
        <StyledText variant="label-md" className="mb-1.5 text-neutral-700 dark:text-neutral-300">
          {label}
        </StyledText>
      )}

      <View
        className={`
          flex-row items-center rounded-input border-2 bg-white
          dark:bg-dark-surface px-3 h-12
          ${borderClass}
        `}
      >
        {icon && <View className="mr-2">{icon}</View>}

        <TextInput
          ref={ref}
          className={`flex-1 text-body-md text-neutral-900 dark:text-neutral-50 ${inputClassName}`}
          placeholderTextColor="#9E9E9E"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {iconRight && <View className="ml-2">{iconRight}</View>}
      </View>

      {error && (
        <StyledText variant="caption" className="mt-1 text-error">
          {error}
        </StyledText>
      )}
      {hint && !error && (
        <StyledText variant="caption" className="mt-1 text-neutral-500">
          {hint}
        </StyledText>
      )}
    </View>
  );
});
