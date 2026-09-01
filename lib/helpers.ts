/**
 * `lib/helpers.ts`
 *
 * Sprint 4 — ŞantiyePro için ortak helper'lar.
 *
 * Mevcut Web Next `lib/helpers.ts`'i (date/format) korunur; üzerine
 * ŞantiyePro'dan gelen Türkçe date + amount helper'ları eklenir.
 */

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================
// THROTTLE / DEBOUNCE
// ============================================

export const throttle = (
  func: (...args: unknown[]) => void,
  limit: number,
): ((...args: unknown[]) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function (this: unknown, ...args: unknown[]) {
    if (lastRan === null) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (lastFunc !== null) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(
        () => {
          if (Date.now() - (lastRan as number) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - (lastRan as number)),
      );
    }
  };
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// ============================================
// ID / INIT
// ============================================

export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function getInitials(
  name: string | null | undefined,
  count?: number,
): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase());

  return count && count > 0
    ? initials.slice(0, count).join('')
    : initials.join('');
}

// ============================================
// URL
// ============================================

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  if (baseUrl && baseUrl !== '/') {
    return process.env.NEXT_PUBLIC_BASE_PATH + pathname;
  } else {
    return pathname;
  }
}

// ============================================
// TIME
// ============================================

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600)
    return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 604800)
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  if (diff < 31536000)
    return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;

  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
}

// ============================================
// DATE (Türkçe locale — date-fns ile)
// ============================================

/** Geçersiz tarihleri null olarak işle (date-fns parse hata fırlatır). */
function toValidDateOrNull(
  input: Date | string | number | null | undefined,
): Date | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 1 Eylül 2026 (uzun) */
export function formatDateTr(
  input: Date | string | number | null | undefined,
): string {
  const date = toValidDateOrNull(input);
  return date ? format(date, 'd MMMM yyyy', { locale: tr }) : '—';
}

/** 1 Eyl 2026 (kısa) */
export function formatShortDate(
  input: Date | string | number | null | undefined,
): string {
  const date = toValidDateOrNull(input);
  return date ? format(date, 'd MMM yyyy', { locale: tr }) : '—';
}

/** Bugünün tarihi YYYY-MM-DD */
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ============================================
// PARA / SAYI
// ============================================

/** ₺1.234,56 */
export function formatAmount(
  amount: number | string | null | undefined,
  currency: string = 'TRY',
): string {
  const num = Number(amount ?? 0);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Türkçe sayı formatı: 1.234 (binlik ayraç nokta) */
export function formatNumber(value: number | string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('tr-TR').format(num);
}

// ============================================
// STORAGE / FILE URL
// ============================================

/** Private dosya URL'leri auth'lı download route'undan servis edilir. */
export function storageUrl(image?: string | null): string {
  if (!image) return '';
  if (image.startsWith('http') || image.startsWith('/api/files/')) {
    return image;
  }
  return `/api/files/${image}`;
}

// ============================================
// ENUM HELPER
// ============================================

/** Enum value'sundan etiket döndürür; bulamazsa value'yu döner. */
export function getEnumLabel<T extends Record<string, string>>(
  value: string | null | undefined,
  labels: Record<T[keyof T], string>,
): string {
  if (!value) return '—';
  return (labels as Record<string, string>)[value] ?? value;
}

// ============================================
// TELEFON
// ============================================

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
  if (digits.length <= 7)
    return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
}

// ============================================
// MEVCUT FORMAT FONKSİYONLARI (korunur)
// ============================================

export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}