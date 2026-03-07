import { Text, TextProps } from 'react-native';
import { forwardRef } from 'react';

type TextVariant =
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'label-lg'
  | 'label-md'
  | 'label-sm'
  | 'caption';

interface StyledTextProps extends TextProps {
  variant?: TextVariant;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_CLASS: Record<TextVariant, string> = {
  'display-lg': 'text-display-lg',
  'display-md': 'text-display-md',
  'display-sm': 'text-display-sm',
  'heading-lg': 'text-heading-lg',
  'heading-md': 'text-heading-md',
  'heading-sm': 'text-heading-sm',
  'body-lg': 'text-body-lg',
  'body-md': 'text-body-md',
  'body-sm': 'text-body-sm',
  'label-lg': 'text-label-lg',
  'label-md': 'text-label-md',
  'label-sm': 'text-label-sm',
  caption: 'text-caption',
};

/**
 * 디자인 시스템 Text — variant prop 또는 className으로 스타일 지정
 */
export const StyledText = forwardRef<Text, StyledTextProps>(function StyledText(
  { variant = 'body-md', className = '', children, ...props },
  ref,
) {
  return (
    <Text
      ref={ref}
      className={`font-sans text-neutral-900 dark:text-neutral-50 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
});
