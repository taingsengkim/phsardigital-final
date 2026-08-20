"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SellerProfileCard } from "@/app/(public)/home/SellerProfileCard";
import { SectionHeader } from "../SectionHeader";
import { useGetTopSellersQuery } from "@/lib/api/homeApi";

const FALLBACK_TOP_SELLERS = [
  {
    id: 1,
    sellerId: "storee-corner",
    slug: "storee-corner",
    name: "Storee Corner",
    businessName: "Storee Corner",
    tagline: "Cambodia's #1 Premium Smartphone & Gadgets Hub",
    avatar_url: "/picture/pic1.jpg",
    logoUri: "/picture/pic1.jpg",
    coverUrl: "/picture/pic2.jpg",
    rating: 4.9,
    review_count: 520,
    product_count: 190,
    verified: true,
  },
  {
    id: 2,
    sellerId: "dance-skirts",
    slug: "dance-skirts",
    name: "Dance skirts",
    businessName: "Dance skirts",
    tagline: "Elegant Fashion & Contemporary Apparel",
    avatar_url: "/picture/pic4.jpg",
    logoUri: "/picture/pic4.jpg",
    coverUrl: "/picture/pic3.jpg",
    rating: 4.8,
    review_count: 380,
    product_count: 190,
    verified: true,
  },
  {
    id: 3,
    sellerId: "soma-coffee",
    slug: "soma-coffee",
    name: "SOMA Coffee & Roastery",
    businessName: "SOMA Coffee & Roastery",
    tagline: "Specialty Roasted Cambodian Coffee Beans",
    avatar_url: "/picture/pic5.jpg",
    logoUri: "/picture/pic5.jpg",
    coverUrl: "/picture/pic6.jpg",
    rating: 4.9,
    review_count: 240,
    product_count: 45,
    verified: true,
  },
  {
    id: 4,
    sellerId: "lor-vengroth",
    slug: "lor-vengroth",
    name: "Lor Vengroth Official",
    businessName: "Lor Vengroth Official",
    tagline: "Custom Vehicles & High Performance Auto Parts",
    avatar_url: "/picture/pic7.jpg",
    logoUri: "/picture/pic7.jpg",
    coverUrl: "/picture/pic1.jpg",
    rating: 4.7,
    review_count: 160,
    product_count: 82,
    verified: true,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function TopSellersSection() {
  const { data: apiSellers = [], isLoading } = useGetTopSellersQuery();

  const sellers = apiSellers && apiSellers.length > 0 ? apiSellers : FALLBACK_TOP_SELLERS;

  return (
    <section className="bg-[#F1EFFA]/60 py-8 font-sans">
      <div className="mx-auto max-w-[1240px] space-y-5 px-6">
        <SectionHeader title="Top Sellers" href="/stores" />

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-500 gap-2">
            <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
            Loading sellers...
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4 items-stretch"
          >
            {sellers.map((seller: any, index: number) => (
              <motion.div key={seller.id || seller.uuid || seller.sellerId || seller.slug || index} variants={item} className="h-full">
                <SellerProfileCard seller={seller} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
