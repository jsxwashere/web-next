/**
 * `lib/api/client.ts`
 *
 * ŞantiyePro frontend → Laravel backend JWT-authenticated fetch client.
 *
 * **Tasarım kararı:** axios projede kurulu olmadığı için (`axios`
 * package.json'da yok) standart `fetch` üzerine inşa edildi. Aynı
 * davranışı (Bearer header + 401 refresh interceptor + in-flight
 * coalescing) korur; ileride `npm install axios` ile birlikte
 * `api.delete()`/`api.put()` gibi kısayollar eklenebilir.
 *
 * Davranış:
 *   1. Her istekte `Authorization: Bearer <accessToken>` başlığı otomatik
 *      eklenir (NextAuth session.user.accessToken'dan).
 *   2. 401 yanıtı gelirse:
 *      a) refresh_token ile `/api/auth/jwt-refresh` çağrılır
 *      b) başarılıysa orijinal istek tekrarlanır (tek seferlik retry)
 *      c) başarısızsa NextAuth session'ı temizlenir + `/signin`'e
 *         yönlendirilir.
 *   3. Birden fazla eşzamanlı 401 → tek refresh (in-flight coalescing).
 *
 * Token kaynağı:
 *   `useSession()` (client component) veya `auth()` (server component)
 *   üzerinden gelir. Bu helper **client-side** kullanım içindir —
 *   server component'lerde doğrudan `auth()` + native fetch tercih edin.
 *
 * Mevcut `lib/api.ts` (apiFetch) dokunulmamıştır; o, server-side
 * relative path prefix'leme için hâlâ kullanılıyor.
 */

const LARAVEL_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Refresh sonucu — sadece erişim token'ı. `refreshToken` artık
 * client'a hiçbir şekilde ulaşmaz (ECC P0-3); server-side JWT
 * cookie'de tutulur ve `jwt` callback tarafından kullanılır.
 */
export interface SessionLike {
  accessToken?: string;
  accessTokenExpires?: number;
}

/**
 * **ECC P0-3 — singleton pattern.**
 *
 * React StrictMode (dev) bileşenleri mount → unmount → mount yapar.
 * Module-level `let` değişkenleri HMR ile resetlenebilir ve StrictMode
 * double-mount sırasında overwrite edilirse session kaybolabilir.
 * `globalThis.__santiyeproApiClient` tek bir mutable kasa görevi görür.
 */
interface ApiClientGlobals {
  tokenProvider?: () => SessionLike | null;
  refreshHandler?: () => Promise<SessionLike | null>;
  onAuthFailure?: () => void;
  refreshInFlight?: Promise<SessionLike | null>;
}

const G = (
  typeof globalThis !== 'undefined' ? globalThis : ({} as unknown)
) as {
  __santiyeproApiClient?: ApiClientGlobals;
};
if (!G.__santiyeproApiClient) G.__santiyeproApiClient = {};

export function configureAuthClient(
  cfg: Required<
    Pick<ApiClientGlobals, 'tokenProvider' | 'refreshHandler' | 'onAuthFailure'>
  >,
): void {
  Object.assign(G.__santiyeproApiClient!, cfg);
}

/**
 * Test/cleanup için konfig'i sıfırla. StrictMode unmount'ta çağrılır.
 */
export function resetAuthClient(): void {
  G.__santiyeproApiClient = {};
}

/** Default fallback — provider mount edilmeden çağrılırsa no-op. */
const defaultAuthFailure = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/signin';
  }
};

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  /** JSON body — verilirse otomatik stringify + Content-Type eklenir */
  body?: unknown;
  /** Bu isteğe özel token override (örn. test) */
  accessToken?: string;
  /** Retry sayısı (default: 1) — 401'de kaç kez tekrar denensin */
  maxRetries?: number;
  /** Query string parametreleri (string|number|boolean|undefined). undefined/boş elemanlar atlanır. */
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

/** Build ?key=value&... query string, skipping undefined / empty. */
function buildQueryString(
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Laravel'a authenticated fetch çağrısı yapar. 401 yakalanırsa
 * refresh dener, başarısız olursa `/signin`'e yönlendirir.
 */
export async function apiFetchAuthed<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    body,
    accessToken: tokenOverride,
    maxRetries = 1,
    params,
    ...rest
  } = options;

  const init: RequestInit & { _retry?: boolean } = { ...rest };

  // Body serialization
  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers = {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      };
    }
  }

  // Query string + base URL prepend
  const qs = buildQueryString(params);
  const url = path.startsWith('http')
    ? `${path}${qs}`
    : `${LARAVEL_BASE}${path.startsWith('/') ? path : `/${path}`}${qs}`;

  // Bearer header — provider singleton üzerinden okunur
  const token =
    tokenOverride ?? G.__santiyeproApiClient!.tokenProvider?.()?.accessToken;
  if (token) {
    init.headers = {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    };
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    throw new ApiError(
      0,
      err instanceof Error ? err.message : 'Network error',
      null,
    );
  }

  // 401 → refresh dene (singleton coalescing — race window YOK)
  if (response.status === 401 && !init._retry && maxRetries > 0) {
    init._retry = true;

    const refreshHandler = G.__santiyeproApiClient!.refreshHandler;
    const onAuthFailure =
      G.__santiyeproApiClient!.onAuthFailure ?? defaultAuthFailure;

    if (!refreshHandler) {
      // Provider mount edilmemişse fallback: signin'e yönlendir
      onAuthFailure();
      throw new ApiError(401, 'Authentication failed', null);
    }

    const newSession = await tryRefresh(refreshHandler);

    if (!newSession?.accessToken) {
      onAuthFailure();
      throw new ApiError(401, 'Authentication failed', null);
    }

    init.headers = {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${newSession.accessToken}`,
    };

    try {
      response = await fetch(url, init);
    } catch (err) {
      throw new ApiError(
        0,
        err instanceof Error ? err.message : 'Network error',
        null,
      );
    }
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // ignore — bazı 5xx'ler JSON döndürmez
    }
    throw new ApiError(
      response.status,
      `Request failed (${response.status})`,
      payload,
    );
  }

  // Boş body (örn. 204) için null dön
  if (response.status === 204) {
    return null as T;
  }

  // JSON parse — başarısızsa text olarak dön
  try {
    return (await response.json()) as T;
  } catch {
    return (await response.text()) as unknown as T;
  }
}

/**
 * **ECC P0-3 — refresh coalescing (race-free).**
 *
 * Promise'ı `await`'ten ÖNCE singleton'a yazıyoruz; birden fazla eşzamanlı
 * 401 aynı refresh promise'ını paylaşır. Promise sonlandığında slot temizlenir.
 *
 * Race window fix:
 *   ÖNCE: `if (refreshInFlight) await; else { refreshInFlight = handler() }` →
 *         iki eşzamanlı 401 ikinci `await`'e girmeden `refreshInFlight`'i
 *         görmeyebilir ve ikinci bir refresh tetiklenirdi.
 *   SONRA: `refreshInFlight = handler()` her zaman ÖNCE atanır; sonraki
 *          çağrılar aynı promise'ı paylaşır.
 */
async function tryRefresh(
  handler: () => Promise<SessionLike | null>,
): Promise<SessionLike | null> {
  if (G.__santiyeproApiClient!.refreshInFlight) {
    return G.__santiyeproApiClient!.refreshInFlight;
  }

  const promise = handler().finally(() => {
    G.__santiyeproApiClient!.refreshInFlight = undefined;
  });

  G.__santiyeproApiClient!.refreshInFlight = promise;
  return promise;
}

/**
 * HTTP method kısayolları (axios benzeri API).
 */
export const api = {
  get: <T = unknown>(path: string, options?: ApiOptions) =>
    apiFetchAuthed<T>(path, { ...options, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetchAuthed<T>(path, { ...options, method: 'POST', body }),
  put: <T = unknown>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetchAuthed<T>(path, { ...options, method: 'PUT', body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetchAuthed<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T = unknown>(path: string, options?: ApiOptions) =>
    apiFetchAuthed<T>(path, { ...options, method: 'DELETE' }),
};
