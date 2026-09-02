'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useAuthApi } from '@/hooks/use-auth-api';
import { ModulesProvider } from '@/providers/modules-provider';
import { Demo1Layout } from '../components/layouts/demo1/layout';
import { ShellLayout } from '../components/layouts/shell/layout';

/**
 * `app/(protected)/_shell-layout-switcher.tsx`
 *
 * Sprint 2'den gelen opt-in davranışı korur:
 *   `localStorage['santiyepro:layout-shell'] === '1'` → ShellLayout
 *   aksi hâlde → Demo1Layout (default)
 *
 * Hydration uyumu için ilk render'da `<ScreenLoader />` döndürür,
 * mount sonrasında gerçek layout seçilir — bu sayede SSR/CSR
 * markup eşleşmesi bozulmaz (Demo1 ↔ Shell farklı DOM üretebilir).
 *
 * **ECC P0-01 — ModulesProvider decoupling:**
 *   `StoreClientProvider` / `StoreClientWrapper` yalnızca authenticated
 *   shell layout'a ihtiyaç duyar; sign-in ve diğer public route'lar
 *   bu provider'lara bağlı değildir. Bu yüzden protected layout
 *   altına taşındı (önceden `app/layout.tsx` root'undaydı).
 */
export function ShellLayoutSwitcher({ children }: { children: ReactNode }) {
  // Axios client'ı aktif NextAuth session'ına bağla (Sprint 3)
  useAuthApi();

  const [useShell, setUseShell] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    try {
      setUseShell(
        window.localStorage.getItem('santiyepro:layout-shell') === '1',
      );
    } catch {
      setUseShell(false);
    }
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <ScreenLoader />;
  }

  return (
    <ModulesProvider>
      {useShell ? (
        <ShellLayout>{children}</ShellLayout>
      ) : (
        <Demo1Layout>{children}</Demo1Layout>
      )}
    </ModulesProvider>
  );
}