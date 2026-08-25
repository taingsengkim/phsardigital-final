"use client";

import { motion } from "framer-motion";
import { HOME_BAND_INNER } from "../section";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { SellerProfileCard } from "@/app/(public)/home/SellerProfileCard";
import { SectionHeader } from "../SectionHeader";
import { useGetTopSellersQuery } from "@/lib/api/homeApi";

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

  const sellers = apiSellers || [];

  return (
    <section className="bg-[#F1EFFA]/60 py-8 font-sans dark:bg-zinc-950/40 sm:py-10">
      <div className={cn(HOME_BAND_INNER, "space-y-6")}>
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
