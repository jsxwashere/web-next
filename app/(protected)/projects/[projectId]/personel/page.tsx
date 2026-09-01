import { PersonelContent } from './content';

/**
 * Sprint 5 — Proje Personel (project-scoped).
 *
 * API: GET /api/projects/{projectId}/personnel
 */
export default async function ProjectPersonelPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <PersonelContent projectId={projectId} />;
}