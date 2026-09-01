'use client';

/**
 * `app/(protected)/error.tsx`
 *
 * Sprint 6 — Protected area (auth'lu sayfalar) için error boundary.
 *
 * Dashboard, Projects, Firms vb. tüm korumalı sayfalarda oluşan hatalar
 * burada yakalanır. Auth layout'unu (sidebar, topbar) koruyarak sadece
 * içerik alanını sıfırlama seçeneği sunar.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ProtectedErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bu bölüm yüklenemedi
          </h1>
          <p className="text-sm text-muted-foreground">
            Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyebilir veya
            ana sayfaya dönebilirsiniz.
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
