import { ProjectPlaceholder } from '../_components/project-placeholder';
import { Cog } from 'lucide-react';

/**
 * Sprint 5 — Proje Ayarları placeholder.
 *
 * Settings sayfası Sprint 6'da proje düzenleme formu (isim, tip, bütçe, KDV,
 * ekip üyeleri) ile doldurulacak. Şimdilik placeholder.
 */
export default function ProjectAyarlarPage() {
  return (
    <ProjectPlaceholder
      title="Proje Ayarları"
      description="Proje bilgileri, ekip üyelikleri ve modül tercihleri. Sprint 6'da proje düzenleme formu ile doldurulacak."
      icon={Cog}
    />
  );
}