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
  DashboardRecentActivity,
  DashboardStats,
  Firm,
  PaginatedResponse,
  Personnel,
  Project,
  QueryParams,
  ReceiptItem,
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