'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { MENU_SHELL } from '@/config/menu.config';
import { type MenuConfig, type MenuItem } from '@/config/types';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';

interface FlatItem {
  title: string;
  path: string;
}

function flatten(items: MenuConfig, acc: FlatItem[] = []): FlatItem[] {
  for (const item of items) {
    if (item.heading) continue;
    if (item.path && item.title) acc.push({ title: item.title, path: item.path });
    if (item.children) flatten(item.children, acc);
  }
  return acc;
}

export function ShellSearchDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const flat = flatten(MENU_SHELL);

  return (
    <>
      {trigger ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2"
        >
          {trigger}
        </button>
      ) : (
        <Button
          variant="ghost"
          mode="icon"
          shape="circle"
          className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
          onClick={() => setOpen(true)}
          aria-label="Ara"
        >
          <Search className="size-4.5!" />
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Modül, sayfa, menü içinde ara..." />
        <CommandList>
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          <CommandGroup heading="Hızlı erişim">
            {flat.map((item) => (
              <CommandItem
                key={item.path}
                value={`${item.title} ${item.path}`}
                asChild
              >
                <Link href={item.path} onClick={() => setOpen(false)}>
                  <Bell className="opacity-60" />
                  <span>{item.title}</span>
                  <CommandShortcut>{item.path}</CommandShortcut>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Re-export so consumers can build typed lookups
export type { MenuItem };