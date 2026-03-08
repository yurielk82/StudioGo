import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  /** safe area 패딩 적용 여부 */
  padded?: boolean;
  /** 수평 패딩만 적용 */
  horizontalPadding?: boolean;
  /** 태블릿/PC에서 콘텐츠 너비 제한 + 중앙 정렬 */
  centered?: boolean;
}

/**
 * 화면 래퍼 — SafeArea + 기본 배경
 * centered=true: 운영자/관리자용 — 태블릿/PC에서 max-w-5xl 제한
 */
export function Screen({
  children,
  className = '',
  padded = true,
  horizontalPadding = true,
  centered = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const content = centered ? (
    <View className="mx-auto w-full max-w-5xl flex-1 lg:px-8">{children}</View>
  ) : (
    children
  );

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
      {content}
    </View>
  );
}
