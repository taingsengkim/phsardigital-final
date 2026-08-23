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
    tagline: "Cambodia's #1 Premium Smartphone & Gadgets Hub offering the latest tech.",
    avatar_url: "/picture/pic1.jpg",
    logoUri: "/picture/pic1.jpg",
    coverUrl: "/picture/seller_cover_electronics.jpg",
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
    tagline: "Elegant Fashion & Contemporary Apparel for the modern wardrobe.",
    avatar_url: "/picture/pic4.jpg",
    logoUri: "/picture/pic4.jpg",
    coverUrl: "/picture/seller_cover_fashion.jpg",
    rating: 4.8,
    review_count: 380,
    product_count: 124,
    verified: true,
  },
  {
    id: 3,
    sellerId: "soma-coffee",
    slug: "soma-coffee",
    name: "SOMA Coffee",
    businessName: "SOMA Coffee",
    tagline: "Specialty Roasted Cambodian Coffee Beans sourced directly from farmers.",
    avatar_url: "/picture/pic5.jpg",
    logoUri: "/picture/pic5.jpg",
    coverUrl: "/picture/seller_cover_coffee.jpg",
    rating: 4.9,
    review_count: 240,
    product_count: 45,
    verified: true,
  },
  {
    id: 4,
    sellerId: "lor-vengroth",
    slug: "lor-vengroth",
    name: "Lor Vengroth",
    businessName: "Lor Vengroth",
    tagline: "Custom Vehicles & High Performance Auto Parts for enthusiasts.",
    avatar_url: "/picture/pic7.jpg",
    logoUri: "/picture/pic7.jpg",
    coverUrl: "/picture/seller_cover_auto.jpg",
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
    <section className="bg-[#F1EFFA]/60 dark:bg-zinc-950/40 py-10 font-sans">
      <div className="mx-auto max-w-[1380px] space-y-6 px-4 sm:px-6">
        <SectionHeader title="Top Sellers" href="/stores" />

        {isLoading && sellers.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500 gap-2">
            <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
            Loading sellers...
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch"
          >
            {sellers.map((seller: any, index: number) => (
              <motion.div
                key={seller.id || seller.uuid || seller.sellerId || seller.slug || index}
                variants={item}
                className="h-full"
              >
                <SellerProfileCard seller={seller} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
