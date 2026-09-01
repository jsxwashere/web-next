'use client';

/**
 * `app/error.tsx`
 *
 * Sprint 6 — Root error boundary.
 *
 * Next.js App Router root level error boundary. Bu dosya tüm route'larda
 * oluşan beklenmeyen hataları yakalar ve kullanıcıya kurtarma seçenekleri
 * sunar. `app/(protected)/error.tsx` ve `app/(auth)/error.tsx` daha özel
 * boundary'lerdir; bu root boundary fallback olarak çalışır.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production'da error tracking servisine gönder (Sentry, vb.)
    // Şimdilik sadece console'a log.
    console.error('[RootErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bir şeyler ters gitti
          </h1>
          <p className="text-sm text-muted-foreground">
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/70">
              Hata kodu: {error.digest}
            </p>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <Button onClick={reset} variant="primary" size="sm">
            <RefreshCw className="me-1 size-4" />
            Tekrar Dene
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <Home className="me-1 size-4" />
              Ana Sayfa
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
