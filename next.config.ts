import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статическая сборка в папку out/ — её и раздаёт Cloudflare Pages
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
