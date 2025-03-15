import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
        search: '',
      },
      {
        hostname: 'unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
