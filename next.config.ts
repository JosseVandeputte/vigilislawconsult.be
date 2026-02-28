import type { NextConfig } from "next";

// Enable static export only when building for FTP deployment.
// Usage: STATIC_EXPORT=true npm run build
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
