import { RaporlarContent } from './content';

/**
 * Sprint 5 — Saha Raporları (project-scoped).
 *
 * API: GET /api/projects/{projectId}/site-reports
 */
export default async function ProjectRaporlarPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <RaporlarContent projectId={projectId} />;
}