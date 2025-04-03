import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "103.140.249.51",
        port: "4000",
        pathname: "/**",
        search: "",
      },
      {
        hostname: "unsplash.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
