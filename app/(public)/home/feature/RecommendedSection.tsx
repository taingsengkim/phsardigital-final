"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { cn } from "@/lib/utils";
import { useGetListingsQuery } from "@/lib/api/homeApi";

const TABS = ["Featured Products", "Best Selling", "Latest Products"] as const;
type Tab = (typeof TABS)[number];

export function RecommendedSection() {
  const [activeTab, setActiveTab] = React.useState<Tab>("Featured Products");
  const { data: listingsResponse, isLoading } = useGetListingsQuery();

  const listings = listingsResponse?.data || (listingsResponse as any)?.content || [];

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-10 font-sans">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[#1A1330] sm:text-3xl">Recommended For You</h2>
        <div className="mt-4 inline-flex gap-6 border-b border-[#EDEBF3]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                activeTab === tab ? "text-[#6C4CD8] font-bold" : "text-[#8B85A0] hover:text-[#241F35]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.span
                  layoutId="recommended-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#6C4CD8]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <SectionHeader title={activeTab} className="mb-4" />

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-gray-500 gap-2">
          <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
          Loading products...
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center border border-[#EDEBF3]">
          <Package className="size-10 text-[#6C4CD8]/50 mb-2" />
          <p className="text-sm font-semibold text-gray-700">No products available yet</p>
          <p className="text-xs text-gray-400 mt-1">Products added by sellers will be displayed here.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"
          >
            {listings.map((listing: any, index: number) => (
              <ProductCard
                key={listing.uuid || listing.id || index}
                listing={listing}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
