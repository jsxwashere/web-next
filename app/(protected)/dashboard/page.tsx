/**
 * `app/(protected)/dashboard/page.tsx`
 *
 * ŞantiyePro menu tarafından kullanılan URL alias'ı (/dashboard).
 * Asıl sayfa: app/(protected)/page.tsx (kök /)
 */

import { redirect } from 'next/navigation';

export default function DashboardAliasPage(): never {
  redirect('/');
}