# Sprint 6 — Mobile Responsive Test Checklist

**Tarih:** 2026-09-01
**Test cihazları:** 375px (iPhone SE), 768px (iPad), 1280px+ (Desktop)
**Yöntem:** Manuel test + kod analizi (Tailwind responsive sınıfları)

---

## 1. Global Layout (Demo1 — default)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Sidebar görünürlüğü | Gizli (boşluk) | Gizli (boşluk) | Görünür | ⚠️ Mobile'da drawer pattern yok |
| Header (topbar) sticky | OK | OK | OK | ✅ |
| MegaMenuMobile | Aktif | Aktif | MegaMenu | ✅ |
| User dropdown | Çalışıyor | Çalışıyor | Çalışıyor | ✅ |
| Search (cmdk) | Çalışıyor | Çalışıyor | Çalışıyor | ✅ |
| Footer | OK | OK | OK | ✅ |

**Bulgu:** Mobile'da Sidebar komple gizlenmiş, drawer pattern uygulanmamış. Sprint 5/7 backlog'a alınmalı.

---

## 2. Global Sayfalar

### 2.1 Dashboard (`/`)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Greeting başlık | OK | OK | OK | ✅ |
| KPI kart grid | 1-col | 2-col | 4-col | ✅ (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`) |
| En Yakın Ödeme kartı | OK | OK | OK | ✅ (`flex-col sm:flex-row`) |
| Kritik/Son Hareketler | 1-col stack | 1-col | 2-col | ✅ (`grid-cols-1 xl:grid-cols-2`) |
| KPI ölçek fontu | `text-2xl` | OK | OK | ✅ |

### 2.2 Projects (`/projects`)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Başlık | OK | OK | OK | ✅ |
| Status tab overflow | yatay scroll | yatay scroll | OK | ✅ (`overflow-x-auto`) |
| Search + view toggle | Stack | Yan yana | Yan yana | ✅ (`flex-col sm:flex-row`) |
| Proje kartları (list) | 1-col | 1-col | 1-col | ✅ |
| Proje kartları (grid) | 1-col | 1-col | 2-3 col | ✅ (`grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`) |
| Birim sayaçları (Toplam/Satılan/...) | OK | OK | OK | ✅ (4-col mini grid) |
| Progress bar | OK | OK | OK | ✅ |

### 2.3 Firms (`/firms`)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Başlık | OK | OK | OK | ✅ |
| Type tab overflow | yatay scroll | OK | OK | ✅ (`overflow-x-auto`) |
| Search input | full-width | 256px | 256px | ✅ (`flex-1 sm:w-64`) |
| Firma kartı | Stack | Stack | Stack | ✅ |
| VKN/telefon/email | wrap | wrap | wrap | ✅ (`flex-wrap`) |
| Hover state | OK (touch) | OK | OK | ✅ |

### 2.4 Personnel (`/personnel`)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Başlık + "Ekle" butonu | Stack | Yan yana | Yan yana | ✅ (`flex items-center justify-between`) |
| Stat kart grid | 1-col | 3-col | 3-col | ✅ (`grid-cols-1 md:grid-cols-3`) |
| Filtre bar | Stack | Yan yana | Yan yana | ✅ |
| Personel kart grid | 1-col | 2-col | 2-col | ✅ (`grid-cols-1 lg:grid-cols-2`) |
| Avatar + isim + badge | OK | OK | OK | ✅ |

### 2.5 Receipts (`/receipts`)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Başlık | OK | OK | OK | ✅ |
| Upload alanı | OK | OK | OK | ✅ |
| Receipt row içerik | OK (gap-3) | OK | OK | ✅ |
| Action butonları (refresh, view, delete) | Tıklanabilir | OK | OK | ✅ (size-3 / size-4 icons) |
| Empty state | Centered | Centered | Centered | ✅ |

### 2.6 Account (`/account/*`)

| Test | 375px | 768px | 1280px+ | Durum |
|------|-------|-------|---------|-------|
| Sub-nav | dikey stack | dikey (256px) | dikey (256px) | ✅ (`flex flex-col lg:flex-row`) |
| Form area | full-width | flex-1 | flex-1 | ✅ |
| Form field'lar | OK | OK | OK | ✅ |

---

## 3. UI Primitives (78 adet)

Tüm Radix-temelli primitive'ler Tailwind responsive sınıflarıyla çalışır:

| Component | Mobile | Tablet | Desktop | Durum |
|-----------|--------|--------|---------|-------|
| Button | OK | OK | OK | ✅ (`size` prop) |
| Input | OK | OK | OK | ✅ |
| Select | OK | OK | OK | ✅ |
| Dialog | Full-screen | Centered | Centered | ✅ (`sm:max-w-*` pattern) |
| Sheet | Slide from edge | Slide | Slide | ✅ (Radix default) |
| Tabs | OK | OK | OK | ✅ |
| Card | OK | OK | OK | ✅ |
| Table | Yatay scroll | OK | OK | ✅ (`overflow-x-auto` wrapper) |
| Dropdown | OK | OK | OK | ✅ |
| Tooltip | OK | OK | OK | ✅ |
| DataGrid | Yatay scroll | OK | OK | ✅ |

---

## 4. Bulgular ve Sprint 7 Backlog

### ⚠️ Bilinen Sorunlar

1. **Sidebar Mobile Drawer**: `Demo1Layout` mobile'da Sidebar'ı komple gizliyor. Kullanıcı mobilde navigation menüsüne erişemiyor. **Çözüm:** `Sheet` component ile slide-in drawer pattern'i (Sprint 7).

2. **ProjectTabs horizontal scroll**: Proje içi sayfalar için ProjectTabs component'i mobile'da scroll edilebilir olmalı. Henüz Sprint 5 kapsamında.

### ✅ Sprint 6 İyileştirmeleri

- Per-route loading skeleton (5 sayfa için)
- Root + protected + auth error boundary
- 404 sayfası
- i18n (TR/EN) entegrasyonu (5 global sayfa)

---

## 5. Test Komutları

```bash
# Dev server (manuel test için)
cd web-next && npm run dev
# http://localhost:3000

# Tarayıcıda responsive test:
# - DevTools → Toggle device toolbar (Ctrl+Shift+M)
# - 375x667 (iPhone SE)
# - 768x1024 (iPad)
# - 1280x800 (Desktop)
```

---

## 6. Sprint 7'ye Aktarılan

- [ ] Mobile sidebar drawer (Sheet-based)
- [ ] ProjectTabs mobile horizontal scroll
- [ ] DataGrid mobile card view option
- [ ] Touch gesture support for sheet dismissal
