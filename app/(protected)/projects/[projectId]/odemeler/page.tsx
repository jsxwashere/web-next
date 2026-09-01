import { ReceiptText } from 'lucide-react';
import { ProjectPlaceholder } from '../_components/project-placeholder';

export default function ProjectOdemelerPage() {
  return (
    <ProjectPlaceholder
      title="Ödemeler"
      description="Tedarikçi, taşeron ve personel ödemelerinin listesi. Henüz aktif veri kaynağı bağlanmadı."
      icon={ReceiptText}
    />
  );
}