import { Banknote } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectTahsilatlarPage() {
  return (
    <ProjectPlaceholder
      title="Tahsilatlar"
      description="Proje kapsamındaki tahsilatlar (hakediş ödemeleri, müşteri çekleri, havale). Henüz aktif veri kaynağı bağlanmadı."
      icon={Banknote}
    />
  );
}