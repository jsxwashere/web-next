'use client';

import { ReactNode } from 'react';
import { useAuthApi } from '@/hooks/use-auth-api';
import { ModulesProvider } from '@/providers/modules-provider';
import { ShellLayout } from '../components/layouts/shell/layout';

/**
 * Protected layout (auth zorunlu).
 *
 * Sadece ŞantiyePro `ShellLayout` kullanır. Metronic demo `Demo1Layout`
 * ve ilgili demo menü config'leri (MENU_MEGA, MENU_HELP, MENU_SIDEBAR_*
 * vb.) kullanımdan kaldırıldı — referans için `archive/metronic-demo/`
 * altında tutuluyor (gerekirse bakılabilir).
 *
 * ECC P0-01 — ModulesProvider decoupling:
 *   `StoreClientProvider` sadece authenticated shell layout'a ihtiyaç
 *   duyar. Sign-in ve diğer public route'lar bu provider'a bağlı değildir;
 *   bu yüzden protected layout altına taşındı (root'tan değil).
 *
 * İlk render hydration uyumu: sadece ShellLayout mount'lanır, Demo1Layout
 * artık hiç yüklenmediği için hydration mismatch riski yok.
 */
export function ShellLayoutSwitcher({ children }: { children: ReactNode }) {
  // Axios client'ı aktif NextAuth session'ına bağla (Sprint 3)
  useAuthApi();

  return (
    <ModulesProvider>
      <ShellLayout>{children}</ShellLayout>
    </ModulesProvider>
  );
}
