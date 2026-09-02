'use client';

import { ReactNode, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { ShellFooter } from './footer';
import { ShellSidebar } from './sidebar';
import { ShellTopbar } from './topbar';

export interface ShellLayoutProps {
  children: ReactNode;
}

/**
 * Sprint 9 — ŞantiyePro shell layout (Metronic demo1 standardı).
 *
 * Yapı (desktop):
 *   ┌──────────┬────────────────────────────────────┐
 *   │ Sidebar  │ Header (top, fixed)                 │
 *   │ (sabit)  ├────────────────────────────────────┤
 *   │         │ Wrapper (padding-inline-start =     │
 *   │  primary│   sidebar genişliği — CSS'ten gelir) │
 *   │ + 2nd   │                                    │
 *   │         │  <main> children (kartlar)         │
 *   │         │                                    │
 *   │         ├────────────────────────────────────┤
 *   │         │ Footer                             │
 *   └──────────┴────────────────────────────────────┘
 *
 * Sidebar ve wrapper hizalaması `css/demos/demo1.css` içindeki `.shell.*`
 * kurallarıyla yönetilir — `settings.layouts.shell.sidebarCollapse` body
 * class'ına yansıtılır ve CSS `--sidebar-width` değişkenini değiştirir.
 *
 * Body class'ları: `shell sidebar-fixed header-fixed` (+ opsiyonel
 * `sidebar-collapse`, `layout-initialized`).
 */
export function ShellLayout({ children }: ShellLayoutProps) {
  const isMobile = useIsMobile();
  const { settings, setOption } = useSettings();

  useEffect(() => {
    const bodyClass = document.body.classList;

    if (settings.layouts.shell.sidebarCollapse) {
      bodyClass.add('sidebar-collapse');
    } else {
      bodyClass.remove('sidebar-collapse');
    }
  }, [settings]);

  useEffect(() => {
    setOption('layout', 'shell');
  }, [setOption]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    bodyClass.add('shell');
    bodyClass.add('sidebar-fixed');
    bodyClass.add('header-fixed');

    const timer = setTimeout(() => {
      bodyClass.add('layout-initialized');
    }, 1000);

    return () => {
      bodyClass.remove('shell');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
      bodyClass.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {!isMobile && <ShellSidebar />}

      <div className="wrapper flex grow flex-col">
        <ShellTopbar />

        <main className="grow pt-[60px]" role="content">
          {children}
        </main>

        <ShellFooter />
      </div>
    </>
  );
}