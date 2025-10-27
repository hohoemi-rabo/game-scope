import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.opencritic.com',
        pathname: '/game/**',
      },
    ],
  },
};

export default nextConfig;
