'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { APP_SETTINGS } from '@/config/settings.config';
import { Settings } from '@/config/types';

type Path = string;

type SettingsContextType = {
  getOption: <T = unknown>(path: Path) => T;
  setOption: <T = unknown>(path: Path, value: T) => void;
  storeOption: <T = unknown>(path: Path, value: T) => void;
  settings: Settings;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const LOCAL_STORAGE_PREFIX = 'app_settings_';

// Utility to safely access localStorage
const isBrowser = () => typeof window !== 'undefined';

// Type guard: narrow an unknown to a plain object so we can walk its keys.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getFromPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (isRecord(acc)) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

function setToPath(obj: Settings, path: string, value: unknown): Settings {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) return obj;

  // Walk the dotted path inside a mutable clone.
  const root = { ...(obj as unknown as Record<string, unknown>) } as Record<string, unknown>;
  let cursor = root;
  for (const key of keys) {
    const next = cursor[key];
    if (isRecord(next)) {
      // Detach from the original to keep this branch mutable.
      cursor[key] = { ...next };
    } else {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[lastKey] = value;
  return root as unknown as Settings;
}

function storeLeaf(path: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}${path}`,
      JSON.stringify(value),
    );
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

function getLeafFromStorage(path: string): unknown {
  if (!isBrowser()) return undefined;
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${path}`);
    return item ? JSON.parse(item) : undefined;
  } catch (err) {
    console.error('LocalStorage read error:', err);
    return undefined;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(
    structuredClone(APP_SETTINGS),
  );

  // Load settings from localStorage after mount
  useEffect(() => {
    if (!isBrowser()) return;

    const init = structuredClone(APP_SETTINGS);
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LOCAL_STORAGE_PREFIX))
      .forEach((key) => {
        const path = key.replace(LOCAL_STORAGE_PREFIX, '');
        const value = getLeafFromStorage(path);
        if (value !== undefined) {
          setToPath(init, path, value);
        }
      });
    setSettings(init);
  }, []); // Empty dependency array to run once on mount

  const getOption = useCallback(
    <T,>(path: string): T => {
      return getFromPath(settings, path) as T;
    },
    [settings],
  );

  const setOption = useCallback(<T,>(path: string, value: T) => {
    setSettings((prev) => setToPath(prev, path, value));
  }, []);

  const storeOption = useCallback(<T,>(path: string, value: T) => {
    setSettings((prev) => {
      const newSettings = setToPath(prev, path, value);
      storeLeaf(path, value);
      return newSettings;
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ getOption, setOption, storeOption, settings }),
    [getOption, setOption, storeOption, settings],
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};
