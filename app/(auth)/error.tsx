'use client';

/**
 * `app/(auth)/error.tsx`
 *
 * Sprint 6 — Auth sayfaları (signin, signup, forgot-password, vb.) için
 * error boundary. Protected layout'tan farklı bir görsel sunar; auth
 * sayfaları genelde tek sütun form olduğu için kompakt bir tasarım.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AuthErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Giriş Hatası
          </h1>
          <p className="text-sm text-muted-foreground">
            Oturum açma sırasında bir sorun oluştu. Lütfen tekrar deneyin.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/70">
              Kod: {error.digest}
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button onClick={reset} size="sm" className="w-full">
            <RefreshCw className="me-1 size-4" />
            Tekrar Dene
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/signin">Giriş sayfasına dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
