import { LineChart } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectRaporlarPage() {
  return (
    <ProjectPlaceholder
      title="Raporlar"
      description="Genel, finansal ve maliyet analiz raporları."
      icon={LineChart}
    />
  );
}