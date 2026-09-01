/**
 * `app/(protected)/firmalar/tedarikciler/page.tsx`
 *
 * ŞantiyePro menu tarafından kullanılan Türkçe URL alias'ı
 * (/firmalar/tedarikciler). Asıl sayfa: app/(protected)/firms/page.tsx
 *
 * Sprint 4'te tüm firmalar tek listede; tip filtresi zaten UI'da var.
 */

import { redirect } from 'next/navigation';

export default function TedarikcilerAliasPage(): never {
  redirect('/firms');
}