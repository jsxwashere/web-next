/**
 * `app/(protected)/account/page.tsx`
 *
 * Sprint 4 — Hesap Ayarları hub sayfası.
 *
 * ŞantiyePro kullanıcısının abonelik, profil, bildirim, tema, kategoriler,
 * ödeme kaynakları, iş kalemi şablonları, alt kullanıcılar ve destek
 * ayarlarına tek noktadan erişim sağlar.
 *
 * Sprint 4'te sadece navigation hub yayında; alt sayfalar Sprint 5'te.
 */

'use client';

import Link from 'next/link';
import {
  Bell,
  CreditCard,
  HelpCircle,
  KeyRound,
  ListChecks,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

interface SettingLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const SETTINGS_GROUPS: { heading: string; items: SettingLink[] }[] = [
  {
    heading: 'Hesap',
    items: [
      {
        title: 'Profil',
        description: 'Ad, e-posta, telefon bilgilerinizi güncelleyin.',
        href: '/settings/profile',
        icon: SettingsIcon,
      },
      {
        title: 'Abonelik',
        description: 'Planınızı yükseltin veya fatura bilgilerinize erişin.',
        href: '/settings/subscription',
        icon: CreditCard,
      },
    ],
  },
  {
    heading: 'Bildirimler & Görünüm',
    items: [
      {
        title: 'Bildirimler',
        description: 'Hangi olaylar için bildirim alacağınızı seçin.',
        href: '/settings/notifications',
        icon: Bell,
      },
      {
        title: 'Tema',
        description: 'Açık, koyu veya sistem teması tercihi.',
        href: '/settings/theme',
        icon: PaintBucket,
      },
    ],
  },
  {
    heading: 'İş Akışı',
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
    ],
  },
  {
    heading: 'Ekip & Destek',
    items: [
      {
        title: 'Alt Kullanıcılar',
        description: 'Ekip üyeleri ve yetkileri.',
        href: '/settings/sub-members',
        icon: Users,
      },
      {
        title: 'Güvenlik',
        description: 'Şifre, 2FA ve oturum yönetimi.',
        href: '/settings/security',
        icon: Shield,
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

export default function AccountHubPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Başlık */}
      <div>
        <h1 className="text-base font-medium">Hesap</h1>
        <p className="text-xs text-muted-foreground">
          {session?.user?.name
            ? `Merhaba ${session.user.name}, hesap ve şirket ayarlarınızı buradan yönetin.`
            : 'Hesap ve şirket ayarlarınızı buradan yönetin.'}
        </p>
      </div>

      {/* Gruplar */}
      {SETTINGS_GROUPS.map((group) => (
        <section key={group.heading} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {group.heading}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}