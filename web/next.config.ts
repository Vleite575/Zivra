import type { NextConfig } from 'next'

const API = process.env.API_ORIGIN ?? 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return ['api', 'sanctum', 'storage'].map((p) => ({ source: `/${p}/:path*`, destination: `${API}/${p}/:path*` }))
  },
}

export default nextConfig
