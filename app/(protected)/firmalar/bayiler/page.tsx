/**
 * `app/(protected)/firmalar/bayiler/page.tsx`
 *
 * ŞantiyePro menu tarafından kullanılan Türkçe URL alias'ı
 * (/firmalar/bayiler). Asıl sayfa: app/(protected)/firms/page.tsx
 */

import { redirect } from 'next/navigation';

export default function BayilerAliasPage(): never {
  redirect('/firms');
}