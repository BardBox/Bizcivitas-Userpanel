import type { NextConfig } from "next";

// @ts-ignore
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Suppress hydration warnings caused by browser extensions
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors (not recommended, but needed for migration)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors
    ignoreDuringBuilds: true,
  } as any, // Type assertion for Next.js 16 compatibility
  images: {
    unoptimized: true, // Disable Vercel Image Optimization to avoid 402 errors
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "backend.bizcivitas.com",
      },
      {
        protocol: "https",
        hostname: "icon-library.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
