'use client';

/**
 * `app/(protected)/account/_components/account-hero.tsx`
 *
 * Sprint 8.2 — Hesap hero / banner kartı.
 *
 * ŞantiyePro `settings-modal/content.tsx` "Settings - Modal" başlığı + "Close"
 * akışı yerine: kullanıcı adı, plan bilgisi ve avatar gösterilir.
 */

import { Crown, Mail, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials } from '@/lib/helpers';

export interface AccountHeroProps {
  plan: 'free' | 'pro' | 'enterprise';
}

const PLAN_LABELS = {
  free: 'Ücretsiz',
  pro: 'Pro',
  enterprise: 'Kurumsal',
} as const;

const PLAN_VARIANTS = {
  free: 'secondary',
  pro: 'warning',
  enterprise: 'success',
} as const;

export function AccountHero({ plan = 'free' }: AccountHeroProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name ?? user?.email ?? 'Kullanıcı';
  const email = user?.email ?? '';
  const initials = getInitials(name) || 'KP';

  return (
    <Card className="overflow-hidden">
      {/* Gradient banner */}
      <div className="h-20 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/5" />
      <CardContent className="-mt-10 flex flex-wrap items-end gap-4 p-6">
        <Avatar className="size-20 border-4 border-background shadow-md">
          {user?.image ? <AvatarImage src={user.image} alt={name} /> : null}
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold text-foreground">
              {name}
            </h1>
            <Badge variant={PLAN_VARIANTS[plan]} className="gap-1">
              <Crown className="size-3" />
              {PLAN_LABELS[plan]}
            </Badge>
          </div>
          {email && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3" />
              {email}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ShieldCheck className="me-1 size-4" />
            Güvenlik durumu
          </Button>
          <Button size="sm">Planı yükselt</Button>
        </div>
      </CardContent>
    </Card>
  );
}