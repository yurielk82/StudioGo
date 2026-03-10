import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-border bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* 로고 + 설명 */}
          <div>
            <Link href="/" className="text-primary text-lg font-bold">
              StudioGo
            </Link>
            <p className="text-muted-foreground mt-1 text-sm">
              의류 창고 기반 라이브커머스 스튜디오 예약 플랫폼
            </p>
          </div>

          {/* 링크 */}
          <div className="text-muted-foreground flex gap-6 text-sm">
            <a href="#" className="hover:text-foreground transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              개인정보처리방침
            </a>
            <a
              href="mailto:support@studiogo.kr"
              className="hover:text-foreground transition-colors"
            >
              문의
            </a>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-8 border-t pt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} StudioGo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
