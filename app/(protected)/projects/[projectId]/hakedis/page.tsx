import { ClipboardList } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectHakedisPage() {
  return (
    <ProjectPlaceholder
      title="Hakediş"
      description="Hakediş dönemleri, onay bekleyen kayıtlar ve metraj raporları."
      icon={ClipboardList}
    />
  );
}