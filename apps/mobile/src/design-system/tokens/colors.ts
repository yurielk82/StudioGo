/**
 * StudioGo 컬러 토큰 — Liquid Glass 스타일
 * tailwind.config.js와 동기화된 JS 상수 (Reanimated/LinearGradient 등에서 사용)
 */

export const COLORS = {
  // 브랜드
  primary: {
    DEFAULT: '#6C5CE7',
    light: '#A29BFE',
    dark: '#5A4BD1',
    50: '#F3F1FF',
    100: '#E8E5FF',
    200: '#D4CFFF',
    300: '#B4ABFE',
    400: '#9188FC',
    500: '#6C5CE7',
    600: '#5A4BD1',
    700: '#4A3DB5',
    800: '#3D3296',
    900: '#332B78',
  },
  secondary: {
    DEFAULT: '#00D2D3',
    light: '#55EFC4',
    dark: '#00B4B5',
    50: '#E6FFFE',
    500: '#00D2D3',
    700: '#009697',
  },

  // 상태
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF6B6B',
  info: '#74B9FF',

  // Glass 표면
  glass: {
    surface: 'rgba(255,255,255,0.7)',
    elevated: 'rgba(255,255,255,0.9)',
    overlay: 'rgba(0,0,0,0.3)',
    border: 'rgba(255,255,255,0.3)',
  },

  // 다크 표면
  dark: {
    bg: '#0D0D1A',
    surface: 'rgba(30,30,50,0.8)',
    elevated: 'rgba(40,40,65,0.9)',
    border: 'rgba(255,255,255,0.1)',
  },

  // 기본
  white: '#FFFFFF',
  black: '#000000',

  // 중립
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // 외부 브랜드
  kakao: {
    DEFAULT: '#FEE500',
    active: '#E5CF00',
    text: '#391B1B',
  },

  // 그라디언트 프리셋
  gradient: {
    primary: ['#6C5CE7', '#A29BFE'] as const,
    secondary: ['#00D2D3', '#55EFC4'] as const,
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)'] as const,
    darkGlass: ['rgba(30,30,50,0.9)', 'rgba(30,30,50,0.5)'] as const,
  },

  // 예약 상태 컬러
  reservation: {
    PENDING: '#FDCB6E',
    APPROVED: '#00B894',
    REJECTED: '#FF6B6B',
    CANCELLED: '#9E9E9E',
    COMPLETED: '#6C5CE7',
    NO_SHOW: '#FF6B6B',
  },

  // 티어 컬러
  tier: {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    PLATINUM: '#E5E4E2',
    DIAMOND: '#B9F2FF',
  },
} as const;
