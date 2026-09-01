import { type LucideIcon } from 'lucide-react';

export interface MenuItem {
  title?: string;
  icon?: LucideIcon;
  path?: string;
  rootPath?: string;
  childrenIndex?: number;
  heading?: string;
  children?: MenuConfig;
  disabled?: boolean;
  collapse?: boolean;
  collapseTitle?: string;
  expandTitle?: string;
  badge?: string;
  separator?: boolean;
}

export type MenuConfig = MenuItem[];

/** A horizontal project-tab. Used by ProjectTabs under /projects/[projectId]/*. */
export interface ProjectTab {
  /** Display label (TR). */
  title: string;
  /** Route segment appended to `/projects/[projectId]/`. */
  segment: string;
  /** Lucide icon. */
  icon: LucideIcon;
  /** Optional badge (count, "Soon", etc.). */
  badge?: string;
  /** When true, the tab is rendered but not clickable. */
  disabled?: boolean;
}

export interface Settings {
  container: 'fixed' | 'fluid';
  layout: string;
  layouts: {
    demo1: {
      sidebarCollapse: boolean;
      sidebarTheme: 'light' | 'dark';
    };
    demo2: {
      headerSticky: boolean;
      headerStickyOffset: number;
    };
    demo5: {
      headerSticky: boolean;
      headerStickyOffset: number;
    };
    demo7: {
      headerSticky: boolean;
      headerStickyOffset: number;
    };
    demo9: {
      headerSticky: boolean;
      headerStickyOffset: number;
    };
    /** Single-sidebar ŞantiyePro shell. Sprint 2. */
    shell: {
      sidebarCollapse: boolean;
      sidebarTheme: 'light' | 'dark';
      projectTabsVisible: boolean;
    };
  };
}

/** Pro/Lite display density + feature visibility. Persisted in localStorage. */
export type ViewMode = 'pro' | 'lite';

/** Theme preset layered on top of next-themes. */
export type AppearancePreset = 'default' | 'contrast' | 'compact';