import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "backend.bizcivitas.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  // Performance optimizations
  compress: true,
  // Optimize page loads
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Keep pages in memory for 60s
    pagesBufferLength: 5, // Buffer 5 pages
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-hot-toast",
      "@reduxjs/toolkit",
      "react-redux",
      "react-infinite-scroll-component",
      "react-hook-form",
      "dompurify",
    ],
    // Enable modern bundling
    esmExternals: true,
    // Enable turbo for faster builds
    turbo: {
      loaders: {},
      resolveAlias: {},
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Static page generation optimization
  generateBuildId: async () => {
    // Use timestamp for build ID to ensure fresh deploys
    return `build-${Date.now()}`;
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // Separate vendor chunks for better caching
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name(module: any) {
              // Get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1];
              return packageName
                ? `vendor-${packageName.replace("@", "")}`
                : "vendors";
            },
          },
          // Common chunks across pages
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: -20,
            reuseExistingChunk: true,
          },
          // Separate React vendors
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "react-vendor",
            priority: 10,
          },
          // Redux and state management
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
            name: "redux-vendor",
            priority: 9,
          },
        },
      };

      // Minimize bundle size
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Speed up builds with caching
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    };

    return config;
  },
};

export default nextConfig;
