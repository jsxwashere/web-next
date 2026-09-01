import { TahsilatlarContent } from './content';

/**
 * Sprint 5 — Tahsilatlar (project-scoped).
 *
 * Server component sadece projectId'yi alıp client component'e geçer.
 * API: GET /api/collections?project_id={projectId}
 */
export default async function ProjectTahsilatlarPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <TahsilatlarContent projectId={projectId} />;
}