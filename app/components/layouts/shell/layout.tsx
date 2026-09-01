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
 * Sprint 2 — ŞantiyePro ana layout.
 *
 * Yapı:
 *   ┌─────────┬──────────────────────────────┐
 *   │ Sidebar │ Topbar (sticky)              │
 *   │ (tek)   ├──────────────────────────────┤
 *   │         │                              │
 *   │         │  <main> children             │
 *   │         │                              │
 *   │         ├──────────────────────────────┤
 *   │         │ Footer                       │
 *   └─────────┴──────────────────────────────┘
 *
 * - Sidebar tek katmanlı — proje-içi modüller `<ProjectTabs />` ile gösterilir.
 * - Topbar sticky, scroll'da border ekler.
 * - `settings.layouts.shell.*` state kullanır (SettingsProvider).
 * - Body class'ları: `shell sidebar-fixed header-fixed`.
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

      <div
        className="wrapper flex grow flex-col"
        style={{
          paddingLeft: isMobile
            ? 0
            : settings.layouts.shell.sidebarCollapse
              ? 68
              : undefined, // default sidebar width comes from CSS var
        }}
      >
        <ShellTopbar />

        <main className="grow pt-[60px]" role="content">
          {children}
        </main>

        <ShellFooter />
      </div>
    </>
  );
}