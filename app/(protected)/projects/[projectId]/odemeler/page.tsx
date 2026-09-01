import { OdemelerContent } from './content';

/**
 * Sprint 5 — Ödemeler (project-scoped).
 *
 * Server component sadece projectId'yi alıp client component'e geçer.
 * API: GET /api/projects/{projectId}/transactions
 */
export default async function ProjectOdemelerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <OdemelerContent projectId={projectId} />;
}