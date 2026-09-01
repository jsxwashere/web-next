import { HakedisContent } from './content';

/**
 * Sprint 5 — Hakediş (project-scoped).
 *
 * API: GET /api/projects/{projectId}/entitlements
 */
export default async function ProjectHakedisPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <HakedisContent projectId={projectId} />;
}