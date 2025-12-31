/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@coderef-dashboard/core'],
    turbo: {
      resolveAlias: {
        // Exclude Electron and Node.js modules from browser bundles
        // This prevents Turbopack from bundling these for client components
        electron: false,
        '@electron/remote': false,
        // Also exclude the Electron adapter itself
        '@coderef-dashboard/core/src/filesystem/electron': false,
      },
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
  },
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
