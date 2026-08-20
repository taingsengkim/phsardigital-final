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
      {
<<<<<<< HEAD
        // Phsar Digital API
        protocol: "https",
        hostname: "phsardigital.quizzy.it.com",
      },
      {
        // MinIO object storage — where product images are actually hosted
        protocol: "http",
        hostname: "51.79.146.203",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
=======
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
>>>>>>> origin/main
      },
    ],
  },
};

export default nextConfig;