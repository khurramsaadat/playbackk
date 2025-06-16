/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Ensure static files are served correctly
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  // Disable server components since we're doing static export
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          }
        ]
      }
    ];
  },
  // Ensure static files are served correctly
  async rewrites() {
    return [
      {
        source: '/video-cutter/:path*',
        destination: '/video-cutter/:path*'
      }
    ];
  },
  webpack: (config) => {
    config.resolve.alias.fs = false;
    config.resolve.alias.path = false;
    config.resolve.alias.crypto = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  }
};

module.exports = nextConfig; 