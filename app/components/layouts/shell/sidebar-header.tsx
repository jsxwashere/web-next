'use client';

import Link from 'next/link';
import { ChevronFirst, HardHat } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';

/**
 * Sprint 9 — ŞantiyePro shell sidebar header.
 * Logo + collapse toggle (Metronic demo1 standardı).
 *
 * Collapsed durumda sadece mini-logo ikonu gösterilir;
 * expanded durumda mini-logo + "ŞantiyePro" yazısı görünür.
 */
export function SidebarHeader() {
  const { settings, storeOption } = useSettings();
  const collapsed = settings.layouts.shell.sidebarCollapse;

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0 h-[60px]">
      <Link href="/dashboard" className="flex items-center gap-2">
        {collapsed ? (
          <HardHat className="size-6 text-primary" aria-hidden="true" />
        ) : (
          <>
            <img
              src={toAbsoluteUrl('/media/app/mini-logo.svg')}
              className="h-[22px] max-w-none dark:hidden"
              alt="ŞantiyePro"
            />
            <img
              src={toAbsoluteUrl('/media/app/mini-logo.svg')}
              className="h-[22px] max-w-none hidden dark:inline-block"
              alt="ŞantiyePro"
            />
            <span className="font-semibold text-sm text-foreground">
              ŞantiyePro
            </span>
          </>
        )}
      </Link>
      <Button
        onClick={() =>
          storeOption('layouts.shell.sidebarCollapse', !collapsed)
        }
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(
          'size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4',
          collapsed && 'ltr:rotate-180 rtl:rotate-180',
        )}
        aria-label="Yan menüyü aç/kapat"
      >
        <ChevronFirst className="size-4!" aria-hidden="true" />
      </Button>
    </div>
  );
}