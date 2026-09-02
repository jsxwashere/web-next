'use client';

/**
 * `app/(protected)/account/_components/settings-hub.tsx`
 *
 * Sprint 8.2 — 12 ayar kartından oluşan hub grid.
 *
 * ŞantiyePro `account/home/settings-modal/content.tsx` Davranışı:
 *   - Sol sidebar (desktop) + scrollspy içerik
 *   - Her bir ayar bölümü için kart component'i (basic-settings, auth-email…)
 *
 * Sprint 8.2'de:
 *   - Modalin yerine dedicated hub sayfası (daha hızlı)
 *   - 12 ayar kartı 4 gruba bölünür (Hesap / Bildirim / İş Akışı / Ekip)
 *   - Her kart: ikon, başlık, açıklama, "Yönet" CTA
 *   - Aktif kart vurgulanır (TODO: ileride client-side section)
 */

import Link from 'next/link';
import {
  Bell,
  Building2,
  CreditCard,
  HelpCircle,
  KeyRound,
  Layout,
  PaintBucket,
  Settings as SettingsIcon,
  Shield,
  Tag,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SettingCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** Sprint 8.2: yakında gelecek sayfalar için. */
  disabled?: boolean;
}

interface SettingGroup {
  heading: string;
  description?: string;
  items: SettingCard[];
}

const SETTINGS_GROUPS: SettingGroup[] = [
  {
    heading: 'Hesap',
    description: 'Kişisel bilgileriniz ve erişim ayarları.',
    items: [
      {
        title: 'Profil',
        description: 'Ad, e-posta, telefon bilgilerinizi güncelleyin.',
        href: '/account/home/user-profile',
        icon: SettingsIcon,
      },
      {
        title: 'Şirket Profili',
        description: 'Şirketinize ait genel bilgiler ve marka.',
        href: '/account/home/company-profile',
        icon: Building2,
        disabled: true,
      },
      {
        title: 'Abonelik',
        description: 'Planınızı yükseltin veya fatura bilgilerine erişin.',
        href: '/account/home/settings-enterprise',
        icon: CreditCard,
      },
      {
        title: 'Güvenlik',
        description: 'Şifre, 2FA ve oturum yönetimi.',
        href: '/account/security/overview',
        icon: Shield,
      },
    ],
  },
  {
    heading: 'Bildirimler & Görünüm',
    description: 'Bildirim tercihleri ve görsel ayarlar.',
    items: [
      {
        title: 'Bildirimler',
        description: 'Hangi olaylar için bildirim alacağınızı seçin.',
        href: '/account/notifications',
        icon: Bell,
      },
      {
        title: 'Tema',
        description: 'Açık, koyu veya sistem teması tercihi.',
        href: '/account/appearance',
        icon: PaintBucket,
      },
      {
        title: 'Görünüm Modu',
        description: 'Pro / Lite arasında geçiş yapın.',
        href: '/account/appearance',
        icon: Layout,
        disabled: true,
      },
    ],
  },
  {
    heading: 'İş Akışı',
    description: 'Veri ve süreç ayarları.',
    items: [
      {
        title: 'Kategoriler',
        description: 'Gelir/gider kategorilerinizi yönetin.',
        href: '/settings/categories',
        icon: Tag,
      },
      {
        title: 'Ödeme Kaynakları',
        description: 'Banka hesapları, kasa ve kartlarınız.',
        href: '/settings/payment-sources',
        icon: Wallet,
      },
      {
        title: 'İş Kalemi Şablonları',
        description: 'Projelerde hızlı iş kalemi ekleme.',
        href: '/settings/job-templates',
        icon: Wrench,
      },
      {
        title: 'API Anahtarları',
        description: 'Geliştirici entegrasyonları için anahtar.',
        href: '/account/api-keys',
        icon: KeyRound,
      },
    ],
  },
  {
    heading: 'Ekip & Destek',
    description: 'Ekip yönetimi ve yardım.',
    items: [
      {
        title: 'Alt Kullanıcılar',
        description: 'Ekip üyeleri ve yetkileri.',
        href: '/settings/sub-users',
        icon: Users,
      },
      {
        title: 'Destek',
        description: 'Destek talepleriniz ve SSS.',
        href: '/settings/support',
        icon: HelpCircle,
      },
    ],
  },
];

export function SettingsHub() {
  return (
    <div className="flex flex-col gap-6">
      {SETTINGS_GROUPS.map((group) => (
        <section key={group.heading} className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {group.heading}
            </h2>
            {group.description && (
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <SettingCardLink key={item.title} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SettingCardLink({ item }: { item: SettingCard }) {
  const Icon = item.icon;
  const inner = (
    <Card
      className={cn(
        'group h-full transition-colors hover:bg-muted/40',
        item.disabled && 'opacity-60',
      )}
    >
      <CardContent className="flex h-full items-start gap-3 p-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.title}
            </p>
            {item.badge && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {item.badge}
              </span>
            )}
            {item.disabled && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Yakında
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </p>
          <p className="mt-2 text-xs font-medium text-primary group-hover:underline">
            {item.disabled ? 'Bildirim al' : 'Yönet →'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (item.disabled) {
    return (
      <div
        className="block focus-visible:outline-none"
        aria-disabled="true"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      {inner}
    </Link>
  );
}