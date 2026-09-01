/**
 * `app/(protected)/firmalar/taseronlar/page.tsx`
 *
 * ŞantiyePro menu tarafından kullanılan Türkçe URL alias'ı
 * (/firmalar/taseronlar). Asıl sayfa: app/(protected)/firms/page.tsx
 */

import { redirect } from 'next/navigation';

export default function TaseronlarAliasPage(): never {
  redirect('/firms');
}