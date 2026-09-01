import NextAuth from 'next-auth';
import authOptions from './auth-options';

/**
 * `app/api/auth/[...nextauth]/route.ts`
 *
 * **Geriye dönük uyumluluk shim'i** — NextAuth v4 (installed package)
 * route handler. `/auth.ts` (v5) henüz production'da kullanılmıyor;
 * Sprint 4'te `next-auth@beta` upgrade'i ile birlikte bu dosya
 * `export const { GET, POST } = handlers;` formuna geçirilecek.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };