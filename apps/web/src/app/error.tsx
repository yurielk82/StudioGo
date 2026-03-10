'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const MAX_MESSAGE_LENGTH = 200;

function truncateMessage(message: string): string {
  if (message.length <= MAX_MESSAGE_LENGTH) return message;
  return `${message.slice(0, MAX_MESSAGE_LENGTH)}…`;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  const displayMessage =
    process.env.NODE_ENV === 'development' && error.message
      ? truncateMessage(error.message)
      : '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="bg-destructive/10 mb-2 flex h-14 w-14 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">문제가 발생했습니다</CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">{displayMessage}</p>
          {error.digest && (
            <p className="text-muted-foreground/60 mt-3 font-mono text-xs">
              오류 코드: {error.digest}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            다시 시도
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/">홈으로</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
