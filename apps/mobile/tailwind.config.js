/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
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
          100: '#B3FFF9',
          200: '#80FFF4',
          300: '#4DFFEF',
          400: '#1AFFEA',
          500: '#00D2D3',
          600: '#00B4B5',
          700: '#009697',
          800: '#007879',
          900: '#005A5B',
        },

        // 시맨틱 표면
        surface: {
          DEFAULT: 'rgba(255,255,255,0.7)',
          glass: 'rgba(255,255,255,0.7)',
          elevated: 'rgba(255,255,255,0.9)',
          overlay: 'rgba(0,0,0,0.3)',
        },

        // 상태
        success: { DEFAULT: '#00B894', light: '#E6FFF7' },
        warning: { DEFAULT: '#FDCB6E', light: '#FFF9E6' },
        error: { DEFAULT: '#FF6B6B', light: '#FFE6E6' },
        info: { DEFAULT: '#74B9FF', light: '#E6F3FF' },

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

        // 다크모드 표면
        dark: {
          bg: '#0D0D1A',
          surface: 'rgba(30,30,50,0.8)',
          elevated: 'rgba(40,40,65,0.9)',
        },
      },

      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
        pretendard: ['Pretendard'],
        inter: ['Inter'],
      },

      fontSize: {
        'display-lg': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'display-md': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'display-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'heading-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '18px', fontWeight: '500' }],
        'label-sm': ['10px', { lineHeight: '14px', fontWeight: '500' }],
        caption: ['11px', { lineHeight: '16px', fontWeight: '400' }],
      },

      borderRadius: {
        'card': '24px',
        'button': '16px',
        'input': '12px',
        'badge': '8px',
        'chip': '20px',
      },

      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },

      boxShadow: {
        'glass': '0 8px 32px rgba(108, 92, 231, 0.1)',
        'glass-lg': '0 16px 48px rgba(108, 92, 231, 0.15)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 12px rgba(108, 92, 231, 0.3)',
      },

      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glassShimmer: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
};
