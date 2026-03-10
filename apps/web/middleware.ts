import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 미들웨어 — 보호 라우트 1차 방어선 (빠른 리다이렉트)
 *
 * 토큰은 localStorage에 저장되어 SSR에서 접근 불가.
 * 실제 인증 검증은 클라이언트 AuthGuard에서 수행.
 * 이 미들웨어는 SSR 단계에서 정적 페이지를 통과시키는 역할만 담당.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/member/:path*', '/operator/:path*', '/admin/:path*'],
};
