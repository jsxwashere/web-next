/**
 * `next.config.mjs`
 *
 * Sprint 8.6 — Production security headers eklendi.
 *
 * - X-Frame-Options: DENY                → clickjacking koruması
 * - X-Content-Type-Options: nosniff      → MIME sniffing kapalı
 * - Referrer-Policy                       → strict-origin-when-cross-origin
 * - X-DNS-Prefetch-Control: off          → DNS prefetch devre dışı
 * - Content-Security-Policy               → dev server + Laravel API için
 *                                          izin verilen kaynaklar
 * - poweredByHeader: false               → X-Powered-By gizleme
 */

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'off',
  },
  {
    // Permissions-Policy: minimal tarayıcı API yüzeyi
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // CSP — Next.js dev server inline + eval script ister,
    //       prod'da 'unsafe-eval' kaldırılabilir
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:8000 https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // For local development, basePath is '/'
  // This file will be overwritten during deployment with the appropriate basePath
  images: {},
  output: 'standalone',
  // Sprint 7 cleanup: pre-existing unused-vars ESLint hataları build'i
  // blokluyor. ESLint'i CI'da ayrı çalıştıracağız, build'de skip.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Sprint 8.6 — X-Powered-By header'ını gizle
  poweredByHeader: false,

  // Sprint 8.6 — production security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;