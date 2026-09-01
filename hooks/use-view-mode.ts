'use client';

import * as React from 'react';
import { type ViewMode } from '@/config/types';
import { useMounted } from '@/hooks/use-mounted';

const STORAGE_KEY = 'santiyepro:view-mode';

function readMode(): ViewMode {
  if (typeof window === 'undefined') return 'pro';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'pro' || raw === 'lite') return raw;
  } catch {
    /* ignore */
  }
  return 'pro';
}

function writeMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

function applyModeClass(mode: ViewMode): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (mode === 'lite') {
    html.classList.add('view-mode-lite');
  } else {
    html.classList.remove('view-mode-lite');
  }
  html.dataset['viewMode'] = mode;
}

export interface UseViewModeReturn {
  /** `false` until hydration — SSR-safe consumers should check this. */
  mounted: boolean;
  /** Current mode. */
  mode: ViewMode;
  /** True when mode === 'pro'. */
  isPro: boolean;
  /** True when mode === 'lite'. */
  isLite: boolean;
  /** Switch to a specific mode (persists to localStorage + DOM class). */
  setMode: (mode: ViewMode) => void;
  /** Flip between pro and lite. */
  toggle: () => void;
}

/**
 * Sprint 2 — ŞantiyePro Pro/Lite görünüm modu.
 *
 * Pro: tüm gelişmiş modüller (raporlar, dashboard, AI vs.).
 * Lite: sadeleştirilmiş görünüm (saha personeli için).
 *
 * Persisted in localStorage. `data-view-mode` + `view-mode-lite` class
 * üzerinden Tailwind config genişletmeleri okunabilir.
 */
export function useViewMode(): UseViewModeReturn {
  const mounted = useMounted();
  const [mode, setModeState] = React.useState<ViewMode>('pro');

  React.useEffect(() => {
    const stored = readMode();
    setModeState(stored);
    applyModeClass(stored);
  }, []);

  const setMode = React.useCallback((next: ViewMode) => {
    setModeState(next);
    writeMode(next);
    applyModeClass(next);
  }, []);

  const toggle = React.useCallback(() => {
    setMode(mode === 'pro' ? 'lite' : 'pro');
  }, [mode, setMode]);

  return {
    mounted,
    mode,
    isPro: mounted ? mode === 'pro' : true,
    isLite: mounted ? mode === 'lite' : false,
    setMode,
    toggle,
  };
}