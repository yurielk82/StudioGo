import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 미들웨어 — 보호 라우트 1차 방어선
 * 실제 인증 검증은 AuthGuard 클라이언트에서 수행
 */
export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('studiogo_access_token')?.value ??
    request.headers.get('authorization')?.split(' ')[1];

  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith('/member') ||
    pathname.startsWith('/operator') ||
    pathname.startsWith('/admin');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/member/:path*', '/operator/:path*', '/admin/:path*'],
};
