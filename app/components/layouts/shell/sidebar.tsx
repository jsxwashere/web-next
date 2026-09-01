'use client';

import { JSX, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronFirst } from 'lucide-react';
import { MENU_SHELL } from '@/config/menu.config';
import { type MenuConfig, type MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { Button } from '@/components/ui/button';
import { SidebarHeader } from './sidebar-header';

export function ShellSidebar() {
  const { settings, storeOption } = useSettings();
  const pathname = usePathname();

  const collapsed = settings.layouts.shell.sidebarCollapse;

  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  const classNames: AccordionMenuClassNames = {
    root: 'lg:ps-1 space-y-3',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenu = (items: MenuConfig): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.heading) return buildHeading(item, index);
      if (item.disabled) return buildDisabled(item, index);
      return buildRoot(item, index);
    });
  };

  const buildHeading = (item: MenuItem, index: number): JSX.Element => (
    <AccordionMenuLabel key={`heading-${index}`}>
      {item.heading}
    </AccordionMenuLabel>
  );

  const buildDisabled = (item: MenuItem, index: number): JSX.Element => (
    <AccordionMenuItem
      key={`disabled-${index}`}
      value={`disabled-${index}`}
      className="text-sm font-medium opacity-50 cursor-not-allowed"
    >
      {item.icon && <item.icon data-slot="accordion-menu-icon" />}
      <span data-slot="accordion-menu-title">{item.title}</span>
    </AccordionMenuItem>
  );

  const buildRoot = (item: MenuItem, index: number): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub key={`sub-${index}`} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className="text-sm font-medium">
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {item.children.map((child, i) => (
                <AccordionMenuItem
                  key={`child-${i}`}
                  value={child.path || `child-${i}`}
                  className="text-[13px]"
                >
                  <Link href={child.path || '#'}>{child.title}</Link>
                </AccordionMenuItem>
              ))}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    }
    return (
      <AccordionMenuItem
        key={`item-${index}`}
        value={item.path || ''}
        className="text-sm font-medium"
      >
        <Link
          href={item.path || '#'}
          className="flex items-center justify-between grow gap-2"
        >
          {item.icon && <item.icon data-slot="accordion-menu-icon" />}
          <span data-slot="accordion-menu-title">{item.title}</span>
        </Link>
      </AccordionMenuItem>
    );
  };

  return (
    <div
      className={cn(
        'sidebar bg-background lg:border-e lg:border-border lg:fixed lg:top-0 lg:bottom-0 lg:z-15 lg:flex flex-col items-stretch shrink-0 transition-[width] duration-200',
        collapsed ? 'lg:w-[68px]' : 'lg:w-(--sidebar-default-width)',
        settings.layouts.shell.sidebarTheme === 'dark' && 'dark',
      )}
    >
      <SidebarHeader />
      <div className="overflow-hidden">
        <div
          className={cn(
            collapsed ? 'w-[68px]' : 'w-(--sidebar-default-width)',
          )}
        >
          <div className="kt-scrollable-y-hover flex grow shrink-0 py-5 px-5 lg:max-h-[calc(100vh-5.5rem)]">
            <AccordionMenu
              selectedValue={pathname}
              matchPath={matchPath}
              type="single"
              collapsible
              classNames={classNames}
            >
              {buildMenu(MENU_SHELL)}
            </AccordionMenu>
          </div>
        </div>
      </div>
      {/* Quick toggle (mirror of SidebarHeader button) — also surfaced here for accessibility */}
      <Button
        size="sm"
        mode="icon"
        variant="outline"
        onClick={() =>
          storeOption('layouts.shell.sidebarCollapse', !collapsed)
        }
        className="hidden lg:inline-flex size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4"
        aria-label="Yan menüyü aç/kapat"
      >
        <ChevronFirst
          className={cn('size-4!', collapsed && 'ltr:rotate-180 rtl:rotate-180')}
        />
      </Button>
    </div>
  );
}