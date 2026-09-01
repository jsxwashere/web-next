/**
 * `app/(protected)/settings/page.tsx`
 *
 * ŞantiyePro menu tarafından kullanılan Türkçe URL alias'ı (/settings).
 * Asıl sayfa: app/(protected)/account/page.tsx
 *
 * Sprint 4'te Hesap hub'ı tek noktadır; tüm alt sayfalar Sprint 5'te.
 */

import { redirect } from 'next/navigation';

export default function SettingsAliasPage(): never {
  redirect('/account');
}