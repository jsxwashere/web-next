'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
  session?: Session | null;
}

/**
 * `providers/auth-provider.tsx`
 *
 * NextAuth v5 (Auth.js) — SessionProvider sarmalayıcısı.
 *
 * Notlar:
 *  - `SessionProvider` v4 ve v5'te aynı paketten gelir
 *    (`next-auth/react`); v5'te ek `basePath` prop'una gerek yoktur.
 *  - Server component'ler `auth()` kullanır, client component'ler
 *    `useSession()` kullanır — ikisi de aynı JWT üzerinden beslenir.
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>{children}</SessionProvider>
  );
}