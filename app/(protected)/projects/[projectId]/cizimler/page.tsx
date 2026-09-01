import { DrawingsContent } from './content';

/**
 * Sprint 5 — Çizimler (project-scoped).
 *
 * Server component sadece projectId'yi alıp client component'e geçer.
 * Veri çekimi client component içinde `useProjectDrawings` hook'u ile
 * `/api/projects/{projectId}/drawings` endpoint'inden yapılır.
 *
 * API: GET /api/projects/{projectId}/drawings
 */
export default async function ProjectCizimlerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <DrawingsContent projectId={projectId} />;
}