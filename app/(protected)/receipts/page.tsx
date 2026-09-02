/**
 * `app/(protected)/receipts/page.tsx`
 *
 * Sprint 8.2 — Dekont Okuma (AI receipt reader).
 *
 * ŞantiyePro `resources/js/pages/receipts/index.tsx` davranışı korunur:
 *   - Dosya yükleme (multi-file upload, AI okuma)
 *   - Bekleyen/tamamlanan toggle
 *   - Liste: durum badge, karşı taraf, kayıt türü, tutar, aksiyonlar
 *   - Yeniden oku / Sil / İncele (drawer)
 *
 * Sprint 8.2 eklemeleri:
 *   - 4 KPI istatistik kartı (toplam/işlenmiş/okunuyor/başarısız)
 *   - Filtre barı (durum sekmeleri + arama)
 *   - ReceiptReviewDrawer (AI extracted alanlar)
 *
 * API: GET /api/receipts, POST /api/receipts (upload),
 *      POST /api/receipts/{id}/re-extract, DELETE /api/receipts/{id}
 *
 * Onay/Red akışı (POST /receipts/{id}/accept & /reject) Sprint 8.3'te
 * ayrı bir form olarak eklenecek.
 */

import { ReceiptsContent } from './_components/content';

export default function ReceiptsPage() {
  // "Yeni Dekont" mevcut Sprint 6.5 akışıyla aynı — upload kartını
  // scrollIntoView ile sayfanın başına götürür. Modal yerine inline akış.
  return <ReceiptsContent onOpenNewReceipt={() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }} />;
}