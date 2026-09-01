'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';
import { type AppearancePreset } from '@/config/types';

const STORAGE_KEY = 'santiyepro:appearance-preset';
const VALID_PRESETS: AppearancePreset[] = ['default', 'contrast', 'compact'];

function readPreset(): AppearancePreset {
  if (typeof window === 'undefined') return 'default';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (VALID_PRESETS as string[]).includes(raw)) {
      return raw as AppearancePreset;
    }
  } catch {
    /* ignore — localStorage unavailable */
  }
  return 'default';
}

function writePreset(preset: AppearancePreset): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, preset);
  } catch {
    /* ignore */
  }
}

function applyPresetClass(preset: AppearancePreset): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  VALID_PRESETS.forEach((p) => {
    if (p !== 'default') {
      html.classList.remove(`appearance-${p}`);
    }
  });
  if (preset !== 'default') {
    html.classList.add(`appearance-${preset}`);
  }
  html.dataset['appearance'] = preset;
}

export interface UseAppearanceReturn {
  /** `false` until client mount → safe for SSR. */
  mounted: boolean;
  /** Dark/Light/System from next-themes. */
  theme: string | undefined;
  /** Currently resolved theme ('dark' | 'light'). */
  resolvedTheme: string | undefined;
  /** Setter for next-themes ('dark' | 'light' | 'system'). */
  setTheme: (theme: string) => void;
  /** Convenience: dark mode boolean. */
  isDark: boolean;
  /** Active preset (default | contrast | compact). */
  preset: AppearancePreset;
  /** Change preset + persist to localStorage. */
  setPreset: (preset: AppearancePreset) => void;
  /** Toggle dark/light shortcut. */
  toggleTheme: () => void;
}

/**
 * ŞantiyePro tema + görünüm ayarları.
 *
 * - Dark/Light: next-themes ile (`html.dark` class'ı).
 * - Preset: 'default' | 'contrast' | 'compact' → `html.appearance-*` data attribute.
 *   Tailwind config `.appearance-contrast` ve `.appearance-compact` varyantları
 *   ile genişletilebilir.
 * - SSR-safe: `mounted` flag'i hydration mismatch'i önler.
 */
export function useAppearance(): UseAppearanceReturn {
  const mounted = useMounted();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [preset, setPresetState] = React.useState<AppearancePreset>('default');

  // İlk mount'ta localStorage'dan oku ve DOM'a uygula.
  React.useEffect(() => {
    const stored = readPreset();
    setPresetState(stored);
    applyPresetClass(stored);
  }, []);

  const setPresetAndPersist = React.useCallback((next: AppearancePreset) => {
    setPresetState(next);
    writePreset(next);
    applyPresetClass(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    // resolvedTheme ilk render'da undefined olabilir, theme'yi fallback olarak kullan
    const current = resolvedTheme ?? theme ?? 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, theme, setTheme]);

  return {
    mounted,
    theme,
    resolvedTheme,
    setTheme,
    isDark: mounted ? resolvedTheme === 'dark' : false,
    preset,
    setPreset: setPresetAndPersist,
    toggleTheme,
  };
}