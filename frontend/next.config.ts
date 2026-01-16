import type { NextConfig } from "next";

const nextConfig: NextConfig = {
//  eslint: {
//    ignoreDuringBuilds: true, // ✅ Ignore les erreurs ESLint pendant le build
//  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;

