import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // Chuyển từ "http" sang "https"
        hostname: "api.binrestaurant.io.vn", // Thay IP cũ bằng tên miền backend
        pathname: "/**", // Giữ nguyên để tải tất cả các đường dẫn con
      },
      {
        hostname: "unsplash.com", // Giữ nếu bạn vẫn dùng hình ảnh từ đây
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;