import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      },
    ];
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      /* allow all http images (MinIO, local dev) */
      {
        protocol: "http",
        hostname: "**",
      },
      /* allow all https images (API, Unsplash, CDNs) */
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
