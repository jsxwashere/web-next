'use client';

import { useParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { Container } from '@/components/common/container';

/**
 * Sprint 2 — Proje içi modüller için ortak placeholder.
 * Gerçek sayfalar (transactions, personnel vs.) zaten kendi
 * sayfalarında render olur; bu sadece yeni eklenen/boş olan
 * sekmeler için geçici içerik sağlar.
 */
export interface ProjectPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ProjectPlaceholder({
  title,
  description,
  icon: Icon,
}: ProjectPlaceholderProps) {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId ?? '—';

  return (
    <Container>
      <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
        <div className="size-14 grid place-items-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">
          Proje: <span className="font-mono">{projectId}</span>
        </p>
      </div>
    </Container>
  );
}