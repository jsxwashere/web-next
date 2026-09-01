/**
 * `app/not-found.tsx`
 *
 * Sprint 6 — 404 sayfası (Next.js default'unu override eder).
 *
 * Kullanıcının aradığı sayfa bulunamadığında gösterilir. Tüm route
 * gruplarını kapsar (auth + protected).
 */

import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestion className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            404 — Sayfa Bulunamadı
          </h1>
          <p className="text-sm text-muted-foreground">
            Aradığınız sayfa kaldırılmış, taşınmış veya hiç var olmamış olabilir.
          </p>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/">
            <Home className="me-1 size-4" />
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>
    </div>
  );
}
