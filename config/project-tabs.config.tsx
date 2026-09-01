import {
  Banknote,
  Building2,
  ClipboardList,
  Cog,
  FileText,
  LayoutDashboard,
  LineChart,
  Package,
  PencilRuler,
  ReceiptText,
  Users,
} from 'lucide-react';
import { type ProjectTab } from './types';

/**
 * Sprint 2 — project-level horizontal tabs.
 *
 * Rendered under `/projects/[projectId]/<segment>` via
 * `app/(protected)/projects/[projectId]/layout.tsx` → `<ProjectTabs />`.
 *
 * ŞantiyePro modules: Genel, Tahsilatlar, Ödemeler, Sözleşmeler,
 * Personel, Malzeme, Raporlar. "Ayarlar" eklenmiştir (admin).
 * Sprint 5: Çizimler eklendi.
 */
export const PROJECT_TABS: ProjectTab[] = [
  {
    title: 'Genel',
    segment: '',
    icon: LayoutDashboard,
  },
  {
    title: 'Tahsilatlar',
    segment: 'tahsilatlar',
    icon: Banknote,
  },
  {
    title: 'Ödemeler',
    segment: 'odemeler',
    icon: ReceiptText,
  },
  {
    title: 'Sözleşmeler',
    segment: 'sozlesmeler',
    icon: FileText,
  },
  {
    title: 'Personel',
    segment: 'personel',
    icon: Users,
  },
  {
    title: 'Firmalar',
    segment: 'firmalar',
    icon: Building2,
  },
  {
    title: 'Malzeme',
    segment: 'malzeme',
    icon: Package,
  },
  {
    title: 'Hakediş',
    segment: 'hakedis',
    icon: ClipboardList,
  },
  {
    title: 'Raporlar',
    segment: 'raporlar',
    icon: LineChart,
  },
  {
    title: 'Çizimler',
    segment: 'cizimler',
    icon: PencilRuler,
  },
  {
    title: 'Ayarlar',
    segment: 'ayarlar',
    icon: Cog,
  },
];

/** Resolve the tab whose `segment` matches the deepest route segment. */
export function matchProjectTab(segments: string[]): ProjectTab | undefined {
  const last = segments[segments.length - 1];
  return PROJECT_TABS.find((tab) => tab.segment === last);
}