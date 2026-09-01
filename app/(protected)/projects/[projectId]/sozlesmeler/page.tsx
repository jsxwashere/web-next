import { SozlesmelerContent } from './content';

/**
 * Sprint 5 — Sözleşmeler (project-scoped).
 *
 * API: GET /api/projects/{projectId}/contracts
 */
export default async function ProjectSozlesmelerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <SozlesmelerContent projectId={projectId} />;
}