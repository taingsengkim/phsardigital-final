"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { mockFeaturedListings } from "../listing-mock";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { cn } from "@/lib/utils";
import { useGetListingsQuery } from "@/lib/api/homeApi";

const TABS = ["Featured Products", "Best Selling", "Latest Products"] as const;
type Tab = (typeof TABS)[number];

export function RecommendedSection() {
  const [activeTab, setActiveTab] = React.useState<Tab>("Featured Products");
  const { data: listingsResponse, isLoading } = useGetListingsQuery();

  const apiListings = listingsResponse?.data || (listingsResponse as any)?.content || [];
  const listings = apiListings.length > 0 ? apiListings : mockFeaturedListings;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
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
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
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
