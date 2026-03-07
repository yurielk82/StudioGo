import { View } from 'react-native';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export function Divider({ className = '', vertical = false }: DividerProps) {
  return (
    <View
      className={`
        bg-neutral-200 dark:bg-neutral-700
        ${vertical ? 'w-px self-stretch' : 'h-px w-full'}
        ${className}
      `}
    />
  );
}
