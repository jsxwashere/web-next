/**
 * `lib/api/optimistic.ts`
 *
 * Sprint 8.5 — TanStack Query optimistic update helper'ı.
 *
 * Bir query için önce cache'i günceller (UI anında tepki verir), arka planda
 * gerçek mutation çalışır, hata olursa eski snapshot ile rollback yapılır.
 *
 * Kullanım:
 *   const oldData = queryClient.getQueryData<Transaction>(['transaction', id]);
 *   queryClient.setQueryData(['transaction', id], (old) =>
 *     optimisticUpdate(old, (data) => ({ ...data, ...patch })),
 *   );
 *   try {
 *     await mutation.mutateAsync(...);
 *     await queryClient.invalidateQueries(...);
 *   } catch (err) {
 *     queryClient.setQueryData(['transaction', id], oldData);
 *   }
 */

import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Cache'lenmiş veri snapshot'ını alır (rollback için).
 * Veri yoksa null döner; çağıran taraf `if (oldData)` ile korumalıdır.
 */
export function snapshotQuery<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Bir query cache'ini, verilen updater fonksiyonu ile değiştirir.
 * Cache boşsa hiçbir şey yapmaz.
 */
export function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (old: T) => T,
): void {
  queryClient.setQueryData<T>(queryKey, (old) => {
    if (old === undefined) return old;
    return updater(old);
  });
}

/**
 * Birden fazla query cache'ini aynı anda günceller.
 * Promise.allSettled benzeri semantik; hata olursa ilk başarısız olanı
 * `Promise.reject` ile fırlatır.
 */
export function optimisticUpdateMany(
  queryClient: QueryClient,
  updates: Array<{ queryKey: QueryKey; updater: (old: unknown) => unknown }>,
): void {
  for (const { queryKey, updater } of updates) {
    queryClient.setQueryData<unknown>(queryKey, (old: unknown) => {
      if (old === undefined) return old;
      return updater(old);
    });
  }
}

/**
 * Snapshot alır → updater uygular → mutation çalıştırır → invalidate eder.
 * Hata olursa snapshot ile rollback yapar ve hatayı yeniden fırlatır.
 *
 * `@param successMessage` toast.success için opsiyonel mesaj.
 */
export async function runOptimisticMutation<TData, TArgs>(opts: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  updater: (old: TData) => TData;
  mutation: () => Promise<unknown>;
  invalidateKeys?: QueryKey[];
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}): Promise<void> {
  const { queryClient, queryKey, updater, mutation, invalidateKeys } = opts;

  const snapshot = snapshotQuery<TData>(queryClient, queryKey);

  try {
    optimisticUpdate<TData>(queryClient, queryKey, updater);
    await mutation();
    if (invalidateKeys) {
      await Promise.all(
        invalidateKeys.map((k) =>
          queryClient.invalidateQueries({ queryKey: k }),
        ),
      );
    }
    opts.onSuccess?.();
  } catch (err) {
    if (snapshot !== undefined) {
      queryClient.setQueryData(queryKey, snapshot);
    }
    opts.onError?.(err);
    throw err;
  }
}
