/**
 * `hooks/use-santiyepro-api.ts`
 *
 * Sprint 4 — ŞantiyePro global sayfa veri hook'ları.
 *
 * TanStack Query ile `lib/api/client.ts` üzerinden Laravel'a istek atar.
 * Her hook tek bir domain için CRUD/list/filter kapsamını içerir.
 *
 * Notlar:
 *   - Hook'lar `useAuthApi()` çağrısına bağımlıdır (parent layout mount eder).
 *   - Filtre parametreleri QueryParams tipinde, API'ye querystring olarak geçer.
 *   - Hata durumunda `error` (ApiError) döner — UI tarafında empty/error state gösterilir.
 */

'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api, ApiError } from '@/lib/api/client';
import type {
  ApiResponse,
  Collection,
  Contract,
  DashboardRecentActivity,
  DashboardStats,
  Drawing,
  Entitlement,
  Firm,
  Material,
  PaginatedResponse,
  Personnel,
  Project,
  ProjectContractsResponse,
  ProjectEntitlementsResponse,
  ProjectSiteReportsResponse,
  ProjectTransactionsResponse,
  QueryParams,
  ReceiptItem,
  SiteReport,
  Transaction,
} from '@/lib/api/types';

const LARAVEL_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000';

/** Multipart upload — `api` helper'ı FormData destekler ama explicit header set gerekir. */
async function uploadReceipts(
  files: File[],
  accessToken: string | undefined,
): Promise<{ data: { items: ReceiptItem[] } }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('file[]', file);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${LARAVEL_BASE}/api/receipts/`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(res.status, `Upload failed (${res.status})`, payload);
  }

  return (await res.json()) as { data: { items: ReceiptItem[] } };
}

// ============================================
// PROJELER
// ============================================

type ProjectsResponse = PaginatedResponse<Project>;

export function useProjects(
  params: QueryParams = {},
): UseQueryResult<ProjectsResponse, Error> {
  return useQuery<ProjectsResponse, Error>({
    queryKey: ['projects', params],
    queryFn: () =>
      api.get<ProjectsResponse>('/projects', {
        params: { per_page: 100, ...params },
      }) as Promise<ProjectsResponse>,
  });
}

/**
 * Yeni proje oluşturma mutation'ı.
 * Sprint 7 — wizard için eklendi.
 *
 * Payload: ŞantiyePro `171gpwffoviaf.js` :1209-1231 ile uyumlu
 * (bkz. `.tmp-crawl/sp-deep/projeler-sihirbazi.md` [api]).
 *
 * Başarıda ilgili sorgular invalidate edilir; çağıran taraf
 * `onSuccess` callback'i ile yönlendirme yapabilir.
 */
export function useCreateProject(): UseMutationResult<
  { data: Project },
  Error,
  Record<string, unknown>
> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Project }, Error, Record<string, unknown>>({
    mutationFn: (body) => api.post<{ data: Project }>('/projects', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Sprint 8.3b — Tek proje fetch.
 * Hero component ve proje bağlamı sayfaları için kullanılır.
 * Laravel: GET /api/projects/{id}
 */
export function useProject(
  projectId: string,
): UseQueryResult<{ data: Project }, Error> {
  return useQuery<{ data: Project }, Error>({
    queryKey: ['project', projectId],
    queryFn: () =>
      api.get<{ data: Project }>(`/projects/${projectId}`) as Promise<{
        data: Project;
      }>,
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// FİRMALAR
// ============================================

type FirmsResponse = PaginatedResponse<Firm>;

export function useFirms(
  params: QueryParams = {},
): UseQueryResult<FirmsResponse, Error> {
  return useQuery<FirmsResponse, Error>({
    queryKey: ['firms', params],
    queryFn: () =>
      api.get<FirmsResponse>('/firms', {
        params: { per_page: 100, ...params },
      }) as Promise<FirmsResponse>,
  });
}

/**
 * Yeni firma oluşturma mutation'ı.
 * Sprint 6.5 — new-firm-sheet için eklendi.
 */
export function useCreateFirm(): UseMutationResult<
  { data: Firm },
  Error,
  Record<string, unknown>
> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Firm }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: Firm }>(`/firms`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['firms'] });
      void queryClient.invalidateQueries({ queryKey: ['project-firms'] });
    },
  });
}

// ============================================
// PERSONEL
// ============================================

type PersonnelResponse = PaginatedResponse<Personnel>;

export function usePersonnel(
  params: QueryParams = {},
): UseQueryResult<PersonnelResponse, Error> {
  return useQuery<PersonnelResponse, Error>({
    queryKey: ['personnel', params],
    queryFn: () =>
      api.get<PersonnelResponse>('/personnel', {
        params: { per_page: 100, ...params },
      }) as Promise<PersonnelResponse>,
    staleTime: 0,
  });
}

export function useTogglePersonnelStatus(): UseMutationResult<
  Personnel,
  Error,
  { id: string; status: string }
> {
  const queryClient = useQueryClient();
  return useMutation<Personnel, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) =>
      api.put<Personnel>(`/personnel/${id}`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnel'] });
    },
  });
}

/**
 * Yeni personel oluşturma mutation'ı.
 * Sprint 6.5 — new-personnel-sheet için eklendi.
 */
export function useCreatePersonnel(): UseMutationResult<
  { data: Personnel },
  Error,
  Record<string, unknown>
> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Personnel }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: Personnel }>(`/personnel`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnel'] });
      void queryClient.invalidateQueries({ queryKey: ['project-personnel'] });
    },
  });
}

// ============================================
// DEKONTLAR
// ============================================

type ReceiptsResponse = ApiResponse<ReceiptItem[]>;

export function useReceipts(): UseQueryResult<ReceiptsResponse, Error> {
  return useQuery<ReceiptsResponse, Error>({
    queryKey: ['receipts', 'list'],
    queryFn: () =>
      api.get<ReceiptsResponse>('/receipts/') as Promise<ReceiptsResponse>,
    staleTime: 0,
  });
}

export function useDeleteReceipt(): UseMutationResult<
  unknown,
  Error,
  { id: string }
> {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: string }>({
    mutationFn: ({ id }) => api.delete(`/receipts/${id}/`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receipts', 'list'] });
    },
  });
}

export function useReExtractReceipt(): UseMutationResult<
  unknown,
  Error,
  { id: string }
> {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: string }>({
    mutationFn: ({ id }) => api.post(`/receipts/${id}/re-extract`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receipts', 'list'] });
    },
  });
}

export function useUploadReceipts(): UseMutationResult<
  { data: { items: ReceiptItem[] } },
  Error,
  { files: File[] }
> {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken =
    session && 'accessToken' in session.user
      ? (session.user as unknown as { accessToken?: string }).accessToken
      : undefined;
  return useMutation<{ data: { items: ReceiptItem[] } }, Error, { files: File[] }>({
    mutationFn: ({ files }) => uploadReceipts(files, accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receipts', 'list'] });
    },
  });
}

// ============================================
// DASHBOARD
// ============================================

type DashboardStatsResponse = { stats: DashboardStats };

export function useDashboardStats(): UseQueryResult<
  DashboardStatsResponse,
  Error
> {
  return useQuery<DashboardStatsResponse, Error>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () =>
      api.get<DashboardStatsResponse>('/dashboard/stats') as Promise<DashboardStatsResponse>,
  });
}

type DashboardActivityResponse = { activities: DashboardRecentActivity[] };

export function useRecentActivity(
  limit: number = 10,
): UseQueryResult<DashboardActivityResponse, Error> {
  return useQuery<DashboardActivityResponse, Error>({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () =>
      api.get<DashboardActivityResponse>('/dashboard/recent-activity', {
        params: { limit },
      }) as Promise<DashboardActivityResponse>,
  });
}

// ============================================
// PROJE KAPSAMINDAKİ ENDPOINTLER
// ============================================

// --- TAHSİLATLAR (Collections) — global list, project_id query ile

export type CollectionsResponse = PaginatedResponse<Collection>;

export function useProjectCollections(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<CollectionsResponse, Error> {
  return useQuery<CollectionsResponse, Error>({
    queryKey: ['project-collections', projectId, params],
    queryFn: () =>
      api.get<CollectionsResponse>('/collections', {
        params: { project_id: projectId, per_page: 100, ...params },
      }) as Promise<CollectionsResponse>,
    enabled: Boolean(projectId),
  });
}

// --- TRANSACTIONS (birleşik gelir/gider)

export function useProjectTransactions(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectTransactionsResponse, Error> {
  return useQuery<ProjectTransactionsResponse, Error>({
    queryKey: ['project-transactions', projectId, params],
    queryFn: () =>
      api.get<ProjectTransactionsResponse>(
        `/projects/${projectId}/transactions`,
        { params: { per_page: 25, ...params } },
      ) as Promise<ProjectTransactionsResponse>,
    enabled: Boolean(projectId),
  });
}

export function useCreateTransaction(
  projectId: string,
): UseMutationResult<unknown, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post(`/transactions`, {
        ...body,
        project_id: projectId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['project-transactions', projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['project-collections', projectId],
      });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// --- PROJENİN FİRMALARI

type ProjectFirmsResponse = PaginatedResponse<Firm>;

export function useProjectFirms(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectFirmsResponse, Error> {
  return useQuery<ProjectFirmsResponse, Error>({
    queryKey: ['project-firms', projectId, params],
    queryFn: () =>
      api.get<ProjectFirmsResponse>(`/projects/${projectId}/firms`, {
        params: { per_page: 100, ...params },
      }) as Promise<ProjectFirmsResponse>,
    enabled: Boolean(projectId),
  });
}

// --- SÖZLEŞMELER (Contracts)

export function useProjectContracts(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectContractsResponse, Error> {
  return useQuery<ProjectContractsResponse, Error>({
    queryKey: ['project-contracts', projectId, params],
    queryFn: () =>
      api.get<ProjectContractsResponse>(
        `/projects/${projectId}/contracts`,
        { params: { per_page: 25, ...params } },
      ) as Promise<ProjectContractsResponse>,
    enabled: Boolean(projectId),
  });
}

/**
 * Yeni sözleşme oluşturma mutation'ı.
 * Sprint 6.5 — new-contract-sheet için eklendi.
 * Payload içinde `project_id` otomatik enjekte edilir.
 */
export function useCreateContract(
  projectId: string,
): UseMutationResult<{ data: Contract }, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Contract }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: Contract }>(`/contracts`, {
        ...body,
        project_id: projectId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['project-contracts', projectId],
      });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// --- MALZEMELER (Materials)

type ProjectMaterialsResponse = PaginatedResponse<Material>;

export function useProjectMaterials(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectMaterialsResponse, Error> {
  return useQuery<ProjectMaterialsResponse, Error>({
    queryKey: ['project-materials', projectId, params],
    queryFn: () =>
      api.get<ProjectMaterialsResponse>(
        `/projects/${projectId}/materials`,
        { params: { per_page: 25, ...params } },
      ) as Promise<ProjectMaterialsResponse>,
    enabled: Boolean(projectId),
  });
}

/**
 * Yeni malzeme oluşturma mutation'ı.
 * Sprint 6.5 — new-material-sheet için eklendi.
 */
export function useCreateMaterial(
  projectId: string,
): UseMutationResult<{ data: Material }, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Material }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: Material }>(`/materials`, {
        ...body,
        project_id: projectId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['project-materials', projectId],
      });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// --- HAKEDİŞLER (Entitlements)

export function useProjectEntitlements(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectEntitlementsResponse, Error> {
  return useQuery<ProjectEntitlementsResponse, Error>({
    queryKey: ['project-entitlements', projectId, params],
    queryFn: () =>
      api.get<ProjectEntitlementsResponse>(
        `/projects/${projectId}/entitlements`,
        { params: { per_page: 25, ...params } },
      ) as Promise<ProjectEntitlementsResponse>,
    enabled: Boolean(projectId),
  });
}

/**
 * Yeni hakediş oluşturma mutation'ı.
 * Sprint 6.5 — new-entitlement-sheet için eklendi.
 */
export function useCreateEntitlement(
  projectId: string,
): UseMutationResult<{ data: Entitlement }, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Entitlement }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: Entitlement }>(`/entitlements`, {
        ...body,
        project_id: projectId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['project-entitlements', projectId],
      });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// --- SAHA RAPORLARI (Site Reports)

export function useProjectSiteReports(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectSiteReportsResponse, Error> {
  return useQuery<ProjectSiteReportsResponse, Error>({
    queryKey: ['project-site-reports', projectId, params],
    queryFn: () =>
      api.get<ProjectSiteReportsResponse>(
        `/projects/${projectId}/site-reports`,
        { params: { per_page: 25, ...params } },
      ) as Promise<ProjectSiteReportsResponse>,
    enabled: Boolean(projectId),
  });
}

export function useCreateSiteReport(
  projectId: string,
): UseMutationResult<{ data: SiteReport }, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<{ data: SiteReport }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: SiteReport }>(`/site-reports`, {
        ...body,
        project: projectId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['project-site-reports', projectId],
      });
    },
  });
}

// --- ÇİZİMLER (Drawings)

type ProjectDrawingsResponse = PaginatedResponse<Drawing>;

export function useProjectDrawings(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectDrawingsResponse, Error> {
  return useQuery<ProjectDrawingsResponse, Error>({
    queryKey: ['project-drawings', projectId, params],
    queryFn: () =>
      api.get<ProjectDrawingsResponse>(`/projects/${projectId}/drawings`, {
        params: { per_page: 50, ...params },
      }) as Promise<ProjectDrawingsResponse>,
    enabled: Boolean(projectId),
  });
}

/**
 * Yeni çizim oluşturma mutation'ı (multipart upload).
 * Sprint 6.5 — new-drawing-sheet için eklendi.
 */
export function useCreateDrawing(
  projectId: string,
): UseMutationResult<{ data: Drawing }, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<{ data: Drawing }, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      api.post<{ data: Drawing }>(`/drawings`, {
        ...body,
        project_id: projectId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['project-drawings', projectId],
      });
    },
  });
}

// --- PROJENİN PERSONELLERİ

type ProjectPersonnelResponse = PaginatedResponse<Personnel>;

export function useProjectPersonnel(
  projectId: string,
  params: QueryParams = {},
): UseQueryResult<ProjectPersonnelResponse, Error> {
  return useQuery<ProjectPersonnelResponse, Error>({
    queryKey: ['project-personnel', projectId, params],
    queryFn: () =>
      api.get<ProjectPersonnelResponse>(`/projects/${projectId}/personnel`, {
        params: { per_page: 100, ...params },
      }) as Promise<ProjectPersonnelResponse>,
    enabled: Boolean(projectId),
  });
}

// --- Transactions tablosunda tüm liste erişimi (sortable)

// Type re-export for ergonomic consumers
export type { Transaction };

// ============================================
// HAVA DURUMU (Weather) — Sprint 8.1
// ============================================

export type WeatherData = {
  weather: string;
  temperature_min_c: number | null;
  temperature_max_c: number | null;
};

/**
 * Proje konumuna göre belirli bir günün hava durumu.
 * Laravel: GET /api/weather?project_id=&date=
 * ŞantiyePro `lib/api.ts:weatherApi.getWeather` ile uyumlu.
 */
export function useProjectWeather(
  projectId: string,
  date: string,
): UseQueryResult<{ data: WeatherData }, Error> {
  return useQuery<{ data: WeatherData }, Error>({
    queryKey: ['weather', projectId, date],
    queryFn: () =>
      api.get<{ data: WeatherData }>('/weather', {
        params: { project_id: projectId, date },
      }) as Promise<{ data: WeatherData }>,
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 30, // 30 dakika cache
  });
}

// ============================================
// DEVAM (Attendance) — Sprint 8.1
// ============================================

type AttendanceResponse = PaginatedResponse<unknown>;

/**
 * Belirli bir gün için tüm projelerdeki devam kayıtları.
 * Laravel: GET /api/attendance?date=
 */
export function useTodayAttendance(
  date: string,
  params: QueryParams = {},
): UseQueryResult<AttendanceResponse, Error> {
  return useQuery<AttendanceResponse, Error>({
    queryKey: ['today-attendance', date, params],
    queryFn: () =>
      api.get<AttendanceResponse>('/attendance', {
        params: { date, per_page: 500, ...params },
      }) as Promise<AttendanceResponse>,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
}

// ============================================
// PROJE İSTATİSTİKLERİ — Sprint 8.1
// ============================================

/**
 * Proje özet sayıları (personel/firma/sözleşme sayısı).
 * Laravel: GET /api/projects/{id}/stats
 * ŞantiyePro'da her kart için ayrı istek atılıyor — burada
 * çoklu çağrıyı kolaylaştırmak için batch pattern kullanılır.
 */
export type ProjectStats = {
  personnel_count: number;
  firm_count: number;
  contract_count: number;
};

export function useProjectStats(
  projectId: string,
): UseQueryResult<{ data: ProjectStats }, Error> {
  return useQuery<{ data: ProjectStats }, Error>({
    queryKey: ['project-stats', projectId],
    queryFn: () =>
      api.get<{ data: ProjectStats }>(
        `/projects/${projectId}/stats`,
      ) as Promise<{ data: ProjectStats }>,
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
  });
}