import { LayoutDashboard } from 'lucide-react';
import { ProjectPlaceholder } from './_components/project-placeholder';

export default function ProjectOverviewPage() {
  return (
    <ProjectPlaceholder
      title="Proje Genel Bakış"
      description="Bu sayfa projenin üst düzey özetini gösterecek: bütçe, hakediş oranı, aktif personel, bekleyen ödemeler ve son hareketler."
      icon={LayoutDashboard}
    />
  );
}