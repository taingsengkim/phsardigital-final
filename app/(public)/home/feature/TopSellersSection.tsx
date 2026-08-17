"use client";

import { motion } from "framer-motion";
import { mockSellers } from "../seller-mock";
import { SellerProfileCard } from "@/app/(public)/home/SellerProfileCard";
import { SectionHeader } from "../SectionHeader";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/**
 * Stays mock-only per the project notes — there's no public browse-sellers
 * endpoint on the backend yet. See lib/api/homeApi.ts's getTopSellers
 * (unused) and lib/types/seller.ts for what's ready whenever that ships.
 */
export function TopSellersSection() {
  return (
    <section className="bg-[#F1EFFA]/60 py-8">
      <div className="mx-auto max-w-7xl space-y-5 px-4">
        <SectionHeader title="Top Sellers" />
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {mockSellers.map((seller) => (
            <motion.div key={seller.id} variants={item}>
              <SellerProfileCard seller={seller} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
