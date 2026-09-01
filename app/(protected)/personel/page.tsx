/**
 * `app/(protected)/personel/page.tsx`
 *
 * ŞantiyePro menu tarafından kullanılan Türkçe URL alias'ı (/personel).
 * Next.js App Router server component olarak anında /personnel'a yönlendirir.
 * Asıl sayfa: app/(protected)/personnel/page.tsx
 */

import { redirect } from 'next/navigation';

export default function PersonelAliasPage(): never {
  redirect('/personnel');
}