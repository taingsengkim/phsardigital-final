"use client";

import { motion } from "framer-motion";
import { Loader2, Store } from "lucide-react";
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
  const { data: sellers = [], isLoading } = useGetTopSellersQuery();

  return (
    <section className="bg-[#F1EFFA]/60 py-8 font-sans">
      <div className="mx-auto max-w-[1240px] space-y-5 px-6">
        <SectionHeader title="Top Sellers" />

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-500 gap-2">
            <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
            Loading sellers...
          </div>
        ) : sellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center border border-[#EDEBF3]">
            <Store className="size-10 text-[#6C4CD8]/50 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No top sellers yet</p>
            <p className="text-xs text-gray-400 mt-1">Top sellers will be displayed here as store sales increase.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {sellers.map((seller: any, index: number) => (
              <motion.div key={seller.id || seller.uuid || seller.sellerId || index} variants={item}>
                <SellerProfileCard seller={seller} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
