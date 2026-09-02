'use client';

/**
 * `app/(protected)/account/_components/content.tsx`
 *
 * Sprint 8.2 — Hesap hub sayfası içerik kompozisyonu.
 */

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountHero } from '@/app/(protected)/account/_components/account-hero';
import { SettingsHub } from '@/app/(protected)/account/_components/settings-hub';

export function AccountContent() {
  const { t } = useTranslation();
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <AccountHero plan="free" />
      <div>
        <h1 className="text-base font-medium">{t('pages.account.title')}</h1>
        <p className="text-xs text-muted-foreground">
          Hesap ve şirket ayarlarınızı buradan yönetin.
        </p>
      </div>
      <SettingsHub />
    </div>
  );
}