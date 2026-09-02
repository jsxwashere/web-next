/**
 * `app/(protected)/account/page.tsx`
 *
 * Sprint 8.2 — Hesap Ayarları hub sayfası.
 *
 * ŞantiyePro kullanıcısının abonelik, profil, bildirim, tema, kategoriler,
 * ödeme kaynakları, iş kalemi şablonları, alt kullanıcılar ve destek
 * ayarlarına tek noktadan erişim sağlar.
 *
 * Sprint 8.2'de hub, kullanıcı hero banner'ı + 12 ayar kartından oluşur.
 * Modalin yerine dedicated sayfa tercih edildi (daha hızlı, daha iyi SEO).
 */

import { AccountContent } from './_components/content';

export default function AccountHubPage() {
  return <AccountContent />;
}