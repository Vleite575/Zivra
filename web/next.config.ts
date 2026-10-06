import type { NextConfig } from 'next'

// Served by XAMPP's Apache at https://localhost/zivra as a static export (see ../.htaccess).
// `next dev` keeps a proxy to `php artisan serve` instead, since rewrites do not exist in an export.
const basePath = '/zivra'
const API = process.env.API_ORIGIN ?? 'http://127.0.0.1:8000'
const dev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  ...(dev
    ? { rewrites: async () => ['api', 'sanctum', 'storage'].map((p) => ({ source: `/${p}/:path*`, destination: `${API}/${p}/:path*` })) }
    : { output: 'export' as const }),
}

export default nextConfig
