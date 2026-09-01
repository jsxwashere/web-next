import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/common/container';

export default function ProjectsIndexPage() {
  return (
    <Container>
      <div className="flex flex-col gap-4 py-8">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <h1 className="text-xl font-semibold">Projeler</h1>
        </div>

        <p className="text-sm text-muted-foreground max-w-prose">
          Tüm projelerin listesi. Bir projeye girerek modüllerine (tahsilat,
          ödeme, hakediş, malzeme vb.) erişebilirsiniz.
        </p>

        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Gerçek proje listesi API bağlandıktan sonra burada görüntülenecek.
          Şimdilik örnek bir proje sayfasına geçebilirsiniz:
        </div>

        <div>
          <Link
            href="/projects/demo-1"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Building2 className="size-4" />
            Demo proje (demo-1) →
          </Link>
        </div>
      </div>
    </Container>
  );
}