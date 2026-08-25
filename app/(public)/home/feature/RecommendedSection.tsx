"use client";

import * as React from "react";
import { HOME_SECTION } from "../section";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURATED_PRODUCTS } from "@/lib/curated-products";
import { useGetListingsQuery } from "@/lib/api/homeApi";
import ProductCard from "../ProductCard";

const TABS = [
  "Best Selling",
  "Latest Arrivals",
  "Hot Deals",
] as const;
type Tab = (typeof TABS)[number];

export function RecommendedSection() {
  const [activeTab, setActiveTab] = React.useState<Tab>("Best Selling");
  const { data: listingsResponse, isLoading } = useGetListingsQuery();

  const apiListings =
    listingsResponse?.data || (listingsResponse as any)?.content || [];

  const rawListings =
    apiListings && apiListings.length > 0 ? apiListings : CURATED_PRODUCTS;

  // Filter listings based on active tab
  const filteredListings = React.useMemo(() => {
    const list = [...rawListings];

    if (activeTab === "Best Selling") {
      return list
        .sort((a: any, b: any) => {
          const ratingA = a.averageRating ?? 0;
          const ratingB = b.averageRating ?? 0;
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }
          const reviewsA = a.reviewCount ?? 0;
          const reviewsB = b.reviewCount ?? 0;
          if (reviewsB !== reviewsA) {
            return reviewsB - reviewsA;
          }
          const soldA = a.sold ?? 0;
          const soldB = b.sold ?? 0;
          return soldB - soldA;
        })
        .slice(0, 25);
    }

    if (activeTab === "Latest Arrivals") {
      return list
        .sort((a: any, b: any) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 25);
    }

    if (activeTab === "Hot Deals") {
      return list
        .filter((p: any) => {
          const full = p.fullPrice ?? p.price;
          const disc = p.discountPrice;
          return disc && full && full > disc;
        })
        .sort((a: any, b: any) => {
          const fullA = a.fullPrice ?? a.price ?? 0;
          const discA = a.discountPrice ?? fullA;
          const pctA = fullA > 0 ? ((fullA - discA) / fullA) * 100 : 0;

          const fullB = b.fullPrice ?? b.price ?? 0;
          const discB = b.discountPrice ?? fullB;
          const pctB = fullB > 0 ? ((fullB - discB) / fullB) * 100 : 0;

          return pctB - pctA;
        })
        .slice(0, 25);
    }

    return list.slice(0, 25);
  }, [rawListings, activeTab]);

  return (
    <section className={HOME_SECTION}>
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CD8]/10 px-3.5 py-1 text-xs font-bold text-[#6C4CD8] dark:text-[#A78BFA] uppercase tracking-wider">
          <Sparkles className="size-3.5" />
          <span>DAILY DISCOVER</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
          Recommended For You
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
          Handpicked top products tailored to your preferences and seasonal
          trends
        </p>

        {/* Tab Pills */}
        <div className="mt-6 inline-flex flex-wrap justify-center gap-2.5 p-2 rounded-full bg-gray-100 dark:bg-zinc-800/80 border border-gray-200/60 dark:border-zinc-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative rounded-full px-6 py-2.5 text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer",
                activeTab === tab
                  ? "bg-[#6C4CD8] text-white shadow-sm"
                  : "text-gray-700 dark:text-zinc-300 hover:text-[#111827] dark:hover:text-white",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading && filteredListings.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500 gap-2">
          <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
          Loading marketplace items...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {filteredListings.map((listing: any, index: number) => (
              <ProductCard
                key={listing.uuid || listing.id || index}
                listing={listing}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* View All Button */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-800 border-2 border-[#6C4CD8] px-7 py-3 text-sm sm:text-base font-bold text-[#6C4CD8] dark:text-[#A78BFA] hover:bg-[#6C4CD8] hover:text-white dark:hover:bg-[#6C4CD8] dark:hover:text-white transition-all shadow-xs"
        >
          <span>Explore All Products</span>
        </Link>
      </div>
    </section>
  );
}
