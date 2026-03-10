import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'StudioGo — 라이브커머스 스튜디오 예약',
    template: '%s | StudioGo',
  },
  description: '의류 창고 기반 전문 촬영 스튜디오. 예약부터 출고까지 한 번에.',
  keywords: ['라이브커머스', '스튜디오 예약', '촬영 스튜디오', '의류 창고', '라이브 방송'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'StudioGo',
    title: 'StudioGo — 라이브커머스 스튜디오 예약',
    description: '의류 창고 기반 전문 촬영 스튜디오. 예약부터 출고까지 한 번에.',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: 'StudioGo — 라이브커머스 스튜디오 예약',
    description: '의류 창고 기반 전문 촬영 스튜디오. 예약부터 출고까지 한 번에.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
