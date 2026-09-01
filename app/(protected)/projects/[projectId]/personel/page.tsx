import { Users } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectPersonelPage() {
  return (
    <ProjectPlaceholder
      title="Personel"
      description="Bu projede görev alan personel, mesai ve puantaj kayıtları."
      icon={Users}
    />
  );
}