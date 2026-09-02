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
};

export default nextConfig;