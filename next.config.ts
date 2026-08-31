import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      },
      {
        source: "/seller-dashboard",
        destination: "/seller-dashboard/home",
        permanent: false,
      },
    ];
  },
  reactCompiler: true,
  images: {
    /* Uploads land at modest sizes (many product photos are ~450-550px
       squares), so squeeze the most out of them: AVIF first — it holds detail
       far better than WebP at the same byte budget — and allow a 90-quality
       tier for the hero and product cards. Next 16 rejects any `quality` not
       listed here, so both tiers have to be declared. */
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
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
       { protocol: 'https',
         hostname: 'files.quizzy.it.com', pathname: '/**' },                                                                                                               
    ],
  },
};

export default nextConfig;
