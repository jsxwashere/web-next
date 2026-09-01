import { FirmalarContent } from './content';

/**
 * Sprint 5 — Proje Firmaları (project-scoped).
 *
 * API: GET /api/projects/{projectId}/firms
 */
export default async function ProjectFirmalarPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <FirmalarContent projectId={projectId} />;
}