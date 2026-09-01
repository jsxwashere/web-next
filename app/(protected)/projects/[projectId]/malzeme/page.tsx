import { BoxIcon } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectMalzemePage() {
  return (
    <ProjectPlaceholder
      title="Malzeme"
      description="Stok durumu, malzeme talepleri ve sevkiyat takibi."
      icon={BoxIcon}
    />
  );
}