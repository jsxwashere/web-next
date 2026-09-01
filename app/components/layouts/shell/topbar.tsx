'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Gauge, Menu, Search } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { useViewMode } from '@/hooks/use-view-mode';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShellSearchDialog } from './search-dialog';
import { ShellSidebar } from './sidebar';
import { ShellUserDropdown } from './user-dropdown';

export function ShellTopbar() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const pathname = usePathname();
  const mobileMode = useIsMobile();

  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;

  const { mode, toggle, mounted } = useViewMode();

  useEffect(() => {
    setIsSidebarSheetOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background end-0',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container className="flex justify-between items-stretch lg:gap-4">
        {/* Mobile: hamburger + mini logo */}
        <div className="flex gap-1 lg:hidden items-center gap-2.5">
          <Link href="/dashboard" className="shrink-0">
            <img
              src={toAbsoluteUrl('/media/app/mini-logo.svg')}
              className="h-[25px] w-full"
              alt="ŞantiyePro"
            />
          </Link>
          {mobileMode && (
            <Sheet
              open={isSidebarSheetOpen}
              onOpenChange={setIsSidebarSheetOpen}
            >
              <SheetTrigger asChild>
                <Button variant="ghost" mode="icon" aria-label="Menü">
                  <Menu className="text-muted-foreground/70" />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="p-0 gap-0 w-[275px]"
                side="left"
                close={false}
              >
                <SheetHeader className="p-0 space-y-0" />
                <SheetBody className="p-0 overflow-y-auto">
                  <ShellSidebar />
                </SheetBody>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Sol: görünür başlık / arama */}
        <div className="flex items-center gap-3 grow">
          {!mobileMode && <ShellSearchDialog />}
        </div>

        {/* Sağ: Pro/Lite toggle + bildirim + avatar */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                mode="icon"
                shape="circle"
                className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                onClick={toggle}
                aria-label="Görünüm modu değiştir"
              >
                <Gauge
                  className={cn(
                    'size-4.5!',
                    mounted && mode === 'lite' && 'text-primary',
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {mounted
                ? `Görünüm: ${mode === 'pro' ? 'Pro' : 'Lite'} (değiştir)`
                : 'Görünüm modu'}
            </TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            mode="icon"
            shape="circle"
            className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
            aria-label="Bildirimler"
          >
            <Bell className="size-4.5!" />
          </Button>

          <ShellUserDropdown />
        </div>
      </Container>
    </header>
  );
}

/**
 * Mobile-only shortcut: full search bar.
 * Used inside main content on mobile, not in the topbar (topbar'da search icon yeterli).
 */
export function ShellMobileSearch() {
  return (
    <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-border">
      <Search className="size-4 text-muted-foreground" />
      <div className="grow">
        <ShellSearchDialog
          trigger={
            <span className="text-sm text-muted-foreground">
              Modül, sayfa veya menü içinde ara...
            </span>
          }
        />
      </div>
    </div>
  );
}