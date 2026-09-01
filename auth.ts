/**
 * `auth.ts`
 *
 * NextAuth v5 (Auth.js) full instance — node runtime'da çalışır.
 *
 * **Not:** Şu an kurulu paket `next-auth@4.24.11` (v4). Sprint 4'te
 * `npm install next-auth@5.0.0-beta` ile v5'e geçilecek; bu dosya
 * o noktada `import NextAuth from 'next-auth'` çağrısını aynen
 * kullanmaya devam edecek (v5 API uyumlu).
 *
 * Edge middleware ile paylaşılan kısım `auth.config.ts`'ten gelir;
 * burada yalnızca:
 *   1. Credentials provider'ın `authorize()` callback'i (Laravel'a HTTP)
 *   2. `auth()` / `signIn` / `signOut` / `handlers` export'ları
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import './lib/auth/types'; // Tip modülü augmentation'ı yükle

const LARAVEL_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000';

interface LaravelLoginOk {
  success: true;
  data: {
    member: {
      account_id: number | string;
      name: string | null;
      email: string | null;
      phone?: string | null;
      view_mode?: string | null;
    };
    permissions: string[];
    role_key: string | null;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface LaravelLoginErr {
  success?: false;
  message: string;
  errors?: Record<string, string[]>;
}

type LaravelLoginResponse = LaravelLoginOk | LaravelLoginErr;

interface AuthorizeUser {
  id: string;
  email: string;
  name: string;
  status: string;
  image?: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  roleKey: string | null;
  permissions: string[];
  member: LaravelLoginOk['data']['member'];
}

/**
 * Backend `JwtAuthController::login` payload'ından gelen user objesini
 * NextAuth User şemasına map'ler.
 */
async function authorizeLaravel(
  credentials: Partial<Record<'email' | 'password', unknown>> | undefined,
): Promise<AuthorizeUser | null> {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const email = String(credentials.email).trim();
  const password = String(credentials.password);

  let response: Response;
  try {
    response = await fetch(`${LARAVEL_BASE}/api/auth/jwt-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    throw new Error('auth.network');
  }

  let payload: LaravelLoginResponse | null = null;
  try {
    payload = (await response.json()) as LaravelLoginResponse;
  } catch {
    throw new Error('auth.bad_response');
  }

  if (!response.ok || !('access_token' in payload) || !payload.success) {
    const msg = payload && 'message' in payload ? payload.message : 'auth.failed';
    throw new Error(msg ?? 'auth.failed');
  }

  const ok = payload as LaravelLoginOk;

  // v4 User tipi `status` zorunlu; Sprint 4 v5'e geçişte kaldırılacak.
  const user: AuthorizeUser = {
    id: String(ok.data.member.account_id),
    email: ok.data.member.email ?? email,
    name: ok.data.member.name ?? email,
    status: 'ACTIVE',
    image: undefined,

    // Custom claims (types.ts augmentation ile tipli)
    accessToken: ok.access_token,
    refreshToken: ok.refresh_token,
    accessTokenExpires: Math.floor(Date.now() / 1000) + ok.expires_in,
    roleKey: ok.data.role_key ?? null,
    permissions: ok.data.permissions ?? [],
    member: ok.data.member,
  };
  return user;
}

const providersWithAuthorize = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: authorizeLaravel,
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: providersWithAuthorize,
});