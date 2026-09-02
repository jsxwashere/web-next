/**
 * `app/(protected)/projects/new/page.tsx`
 *
 * Sprint 7 — Yeni proje oluşturma sihirbazı (server component shell).
 *
 * Server-side auth guard (parent `(protected)/layout.tsx`) session yoksa
 * `/signin`'e yönlendirir; burada ek bir kontrol gerekmez.
 *
 * Mantık tamamen `NewProjectWizardContent` (client component) içinde —
 * form state, multi-step navigation, validasyon, mutation.
 */

import type { Metadata } from 'next';
import { NewProjectWizardContent } from './content';

export const metadata: Metadata = {
  title: 'Yeni Proje',
};

export default function NewProjectPage() {
  return <NewProjectWizardContent />;
}