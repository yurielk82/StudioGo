/**
 * 타이포그래피 토큰 — Pretendard (한국어) + Inter (영문)
 * RN StyleSheet에서 직접 사용. NativeWind className 사용 시 tailwind.config.js 참조.
 */
import { Platform, TextStyle } from 'react-native';

const FONT_FAMILY = Platform.select({
  ios: 'Pretendard',
  android: 'Pretendard',
  web: 'Pretendard, Inter, system-ui, sans-serif',
}) as string;

type TypographyVariant =
  | 'displayLg'
  | 'displayMd'
  | 'displaySm'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'labelLg'
  | 'labelMd'
  | 'labelSm'
  | 'caption';

export const TYPOGRAPHY: Record<TypographyVariant, TextStyle> = {
  displayLg: {
    fontFamily: FONT_FAMILY,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
  },
  displayMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  },
  displaySm: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  headingLg: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  headingMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  headingSm: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLg: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodySm: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  labelLg: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelMd: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  labelSm: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
};
