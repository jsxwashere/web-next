import { FileText } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectSozlesmelerPage() {
  return (
    <ProjectPlaceholder
      title="Sözleşmeler"
      description="Ana yüklenici sözleşmesi, alt yüklenici sözleşmeleri ve ek protokoller. Henüz aktif veri kaynağı bağlanmadı."
      icon={FileText}
    />
  );
}