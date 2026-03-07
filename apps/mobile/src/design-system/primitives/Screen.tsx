import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  /** safe area 패딩 적용 여부 */
  padded?: boolean;
  /** 수평 패딩만 적용 */
  horizontalPadding?: boolean;
}

/**
 * 화면 래퍼 — SafeArea + 기본 배경
 */
export function Screen({
  children,
  className = '',
  padded = true,
  horizontalPadding = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-1 bg-neutral-50 dark:bg-dark-bg ${className}`}
      style={
        padded
          ? {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: horizontalPadding ? Math.max(insets.left, 16) : insets.left,
              paddingRight: horizontalPadding ? Math.max(insets.right, 16) : insets.right,
            }
          : undefined
      }
    >
      {children}
    </View>
  );
}
