import { Cog } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectAyarlarPage() {
  return (
    <ProjectPlaceholder
      title="Proje Ayarları"
      description="Proje bilgileri, ekip üyelikleri ve modül tercihleri."
      icon={Cog}
    />
  );
}