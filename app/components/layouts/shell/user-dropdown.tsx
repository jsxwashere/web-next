'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { I18N_LANGUAGES, Language } from '@/i18n/config';
import {
  CircleUser,
  Contrast,
  CreditCard,
  Eye,
  Gauge,
  LogOut,
  MonitorCog,
  Moon,
  Settings,
  Sparkles,
  Sun,
  UserCog,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/providers/i18n-provider';
import { useViewMode } from '@/hooks/use-view-mode';
import { type AppearancePreset, type ViewMode } from '@/config/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

const PRESET_LABELS: Record<AppearancePreset, string> = {
  default: 'Varsayılan',
  contrast: 'Yüksek Kontrast',
  compact: 'Sıkışık',
};

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  pro: 'Pro',
  lite: 'Lite',
};

export function ShellUserDropdown({ trigger }: { trigger?: ReactNode }) {
  const { data: session } = useSession();
  const { changeLanguage, language } = useLanguage();
  const appearanceApi = useAppearance();
  const viewModeApi = useViewMode();

  const handleLanguage = (lang: Language): void => {
    changeLanguage(lang.code);
  };

  const handleThemeToggle = (checked: boolean): void => {
    appearanceApi.setTheme(checked ? 'dark' : 'light');
  };

  const avatarSrc =
    (session?.user as { image?: string } | undefined)?.image ??
    '/media/avatars/300-2.png';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-full ring-2 ring-green-500/40 hover:ring-green-500/80 transition"
            aria-label="Kullanıcı menüsünü aç"
          >
            <Avatar className="size-9">
              <AvatarImage src={toAbsoluteUrl(avatarSrc)} alt={session?.user?.name ?? ''} />
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-9 border border-border">
              <AvatarImage src={toAbsoluteUrl(avatarSrc)} alt={session?.user?.name ?? ''} />
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                href="/settings/profile"
                className="text-sm text-foreground hover:text-primary font-semibold leading-tight"
              >
                {session?.user?.name ?? 'Kullanıcı'}
              </Link>
              <span className="text-xs text-muted-foreground">
                {session?.user?.email ?? ''}
              </span>
            </div>
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            Pro
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="flex items-center gap-2">
            <CircleUser />
            Profilim
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <UserCog />
            Hesap ayarları
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings/billing" className="flex items-center gap-2">
            <CreditCard />
            Abonelik
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Görünüm alt menüsü */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Eye />
            Görünüm
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Preset
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={appearanceApi.preset}
              onValueChange={(value) => {
                appearanceApi.setPreset(value as AppearancePreset);
              }}
            >
              {(Object.keys(PRESET_LABELS) as AppearancePreset[]).map((p) => (
                <DropdownMenuRadioItem
                  key={p}
                  value={p}
                  className="flex items-center gap-2"
                >
                  {p === 'default' ? (
                    <Sparkles />
                  ) : p === 'contrast' ? (
                    <Contrast />
                  ) : (
                    <MonitorCog />
                  )}
                  <span>{PRESET_LABELS[p]}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Görünüm modu
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={viewModeApi.mode}
              onValueChange={(value) => {
                viewModeApi.setMode(value as ViewMode);
              }}
            >
              {(Object.keys(VIEW_MODE_LABELS) as ViewMode[]).map((m) => (
                <DropdownMenuRadioItem
                  key={m}
                  value={m}
                  className="flex items-center gap-2"
                >
                  <Gauge />
                  <span>{VIEW_MODE_LABELS[m]}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Dil */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <span aria-hidden>🌐</span>
            <span>Dil</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={language.code}
              onValueChange={(value) => {
                const selected = I18N_LANGUAGES.find(
                  (lang) => lang.code === value,
                );
                if (selected) handleLanguage(selected);
              }}
            >
              {I18N_LANGUAGES.map((item) => (
                <DropdownMenuRadioItem
                  key={item.code}
                  value={item.code}
                  className="flex items-center gap-2"
                >
                  <img
                    src={item.flag}
                    className="w-4 h-4 rounded-full"
                    alt={item.name}
                  />
                  <span>{item.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Dark mode toggle */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          {appearanceApi.isDark ? (
            <Sun />
          ) : (
            <Moon />
          )}
          <div className="flex items-center gap-2 justify-between grow">
            Karanlık mod
            <Switch
              size="sm"
              checked={appearanceApi.isDark}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings />
            Ayarlar
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive focus:text-destructive"
          onSelect={() => signOut({ callbackUrl: '/signin' })}
        >
          <LogOut />
          Çıkış yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}