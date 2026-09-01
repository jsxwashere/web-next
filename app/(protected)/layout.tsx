import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import { ShellLayoutSwitcher } from './_shell-layout-switcher';

/**
 * `(protected)/layout.tsx`
 *
 * Sprint 3 — NextAuth v5 server-side guard.
 *
 * Akış:
 *   1. Sunucu tarafında `auth()` çağrılır (middleware ile uyumlu).
 *   2. Session yoksa `/signin`'e yönlendirilir — middleware'in 403
 *      döndürmesinden **önce** burada yakalanır; UX daha hızlıdır.
 *   3. Layout seçimi (Demo1 ↔ Shell) hâlâ client mount sonrası
 *      `localStorage` flag'iyle belirlenir; Sprint 2 opt-in davranışı
 *      korunur (default = Demo1Layout).
 */
export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  return <ShellLayoutSwitcher>{children}</ShellLayoutSwitcher>;
}