import { MalzemeContent } from './content';

/**
 * Sprint 5 — Malzeme (project-scoped).
 *
 * API: GET /api/projects/{projectId}/materials
 */
export default async function ProjectMalzemePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <MalzemeContent projectId={projectId} />;
}