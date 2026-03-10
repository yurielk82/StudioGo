import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-primary text-6xl font-bold">404</h1>
      <p className="text-muted-foreground text-lg">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
