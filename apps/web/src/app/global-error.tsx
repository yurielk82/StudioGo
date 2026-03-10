'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[GlobalErrorBoundary]', error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#ededed',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: '1rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          {/* 경고 아이콘 (SVG — lucide 불가, globals.css 미로드) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto 1.5rem' }}
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            심각한 오류가 발생했습니다
          </h1>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#a1a1aa',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            페이지를 불러오는 중 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#71717a',
                fontFamily: 'monospace',
                marginBottom: '1.5rem',
              }}
            >
              오류 코드: {error.digest}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: '1px solid #3f3f46',
                backgroundColor: 'transparent',
                color: '#ededed',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              홈으로
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
