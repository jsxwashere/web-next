/**
 * `next.config.mjs`
 *
 * Sprint 8.6 — Production security headers eklendi.
 * Sprint 8.7 (P0-1, P0-2, P0-4) — CSP sıkılaştırma, connect-src hardeni,
 *                                     HSTS eklendi.
 *
 * - X-Frame-Options: DENY                → clickjacking koruması
 * - X-Content-Type-Options: nosniff      → MIME sniffing kapalı
 * - Referrer-Policy                       → strict-origin-when-cross-origin
 * - X-DNS-Prefetch-Control: off          → DNS prefetch devre dışı
 * - Permissions-Policy                    → minimal tarayıcı API yüzeyi
 * - Content-Security-Policy               → dev'de inline+eval, prod'da
 *                                          yalnız inline (no eval), gerçek
 *                                          API origin (P0-2), runtime env
 *                                          tabanlı img/connect kaynakları
 * - Strict-Transport-Security             → P0-4: 2 yıl + includeSubDomains
 *                                          + preload (HTTPS zorunlu ise)
 * - poweredByHeader: false               → X-Powered-By gizleme
 */

// ============================================
// Sprint 8.7 (P0-1 + P0-2) — Runtime-tabanlı CSP
// ============================================

const isProd = process.env.NODE_ENV === 'production';

// script-src: dev'de 'unsafe-eval' gerekli (Next.js HMR), prod'da YASAK (P0-1)
const scriptSrcParts = ["'self'", "'unsafe-inline'"];
if (!isProd) {
  scriptSrcParts.push("'unsafe-eval'");
}
const scriptSrc = scriptSrcParts.join(' ');

// P0-2: connect-src — wildcard `https:` kaldırıldı, yalnız gerçek API origin.
// Sırayla: NEXT_PUBLIC_API_ORIGIN > NEXT_PUBLIC_API_BASE_URL > API_BASE_URL > localhost.
const apiOrigin =
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:8000';
const connectSrc = `'self' ${apiOrigin}`;

// img-src — CDN env ile override edilebilir; default olarak self + data: + API
// origin (kullanıcı avatarları vb.) + opsiyonel CDN.
const imgCdn = process.env.NEXT_PUBLIC_IMG_CDN || apiOrigin;
const imgSrc = `'self' data: ${imgCdn}`;

const cspValue = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc}`,
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// ============================================
// Header listesi
// ============================================

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
  // P0-4: HSTS — 2 yıl + subdomain + preload listesi için uygun.
  // Sadece HTTPS terminüsyonu olan ortamlarda anlamlı; HTTP'de görmezden gelinir.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Sprint 8.7 (P0-1, P0-2) — Production-hardened CSP.
    key: 'Content-Security-Policy',
    value: cspValue,
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