/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@coderef-dashboard/core'],
  },
  // Turbopack configuration for Next.js 16+
  // Note: Turbopack handles module resolution differently than webpack
  // The electron-loader.ts uses Function() constructor to prevent static analysis
  turbopack: {},
  // Webpack config (for --webpack mode or production builds)
  webpack: (config, { isServer }) => {
    // Exclude Electron and Node.js built-ins from client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        path: false,
        electron: false,
        '@electron/remote': false,
      };

      // Prevent webpack from trying to bundle these modules
      config.externals = config.externals || [];
      config.externals.push({
        electron: 'commonjs electron',
        '@electron/remote': 'commonjs @electron/remote',
      });
    }

    return config;
  },
  headers: async () => {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
