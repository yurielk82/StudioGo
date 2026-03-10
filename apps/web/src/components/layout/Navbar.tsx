'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '#features', label: '서비스 소개' },
  { href: '#how-it-works', label: '이용 방법' },
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'border-border bg-background/80 border-b backdrop-blur-lg' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href="/" className="text-primary text-xl font-bold">
          StudioGo
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="bg-kakao text-kakao-text hover:bg-kakao-active rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            카카오로 시작하기
          </Link>
        </div>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isOpen && (
        <div className="border-border bg-background/95 border-t backdrop-blur-lg md:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:bg-accent hover:text-foreground block rounded-lg px-3 py-2 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="bg-kakao text-kakao-text hover:bg-kakao-active mt-2 block rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              카카오로 시작하기
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
