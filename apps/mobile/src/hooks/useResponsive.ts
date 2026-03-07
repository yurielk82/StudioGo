import { useWindowDimensions } from 'react-native';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
} as const;

interface ResponsiveInfo {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * 반응형 브레이크포인트 훅
 * - mobile: < 768 (하단 탭)
 * - tablet: 768~1024 (아이콘 사이드바)
 * - desktop: > 1024 (확장 사이드바)
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= BREAKPOINTS.desktop
      ? 'desktop'
      : width >= BREAKPOINTS.tablet
        ? 'tablet'
        : 'mobile';

  return {
    breakpoint,
    width,
    height,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}
