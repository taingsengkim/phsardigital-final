"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import {
  useGetCategoriesQuery,
  useGetListingsByCategoryQuery,
} from "@/lib/api/homeApi";
import ProductCard from "../ProductCard";

const CATEGORY_TABS = [
  { id: "womens-fashion", label: "Women's Dresses", slug: "womens-fashion" },
  { id: "health-beauty", label: "Health & Beauty", slug: "health-beauty" },
  { id: "mens-fashion", label: "Men's Wear", slug: "mens-fashion" },
  { id: "electronics", label: "Electronics", slug: "electronics" },
  {
    id: "groceries-essentials",
    label: "Coffee & Food",
    slug: "groceries-essentials",
  },
];

export function WearableSection() {
  /* Tabs come from the live category list so their slugs cannot drift from the
     API's. The hardcoded set had "health-beauty" and "groceries-essentials"
     where the API uses "health-and-beauty" and "groceries-and-essentials", so
     those tabs always queried a slug that does not exist and showed nothing. */
  const { data: categories = [] } = useGetCategoriesQuery();
  const tabs = React.useMemo(() => {
    const bySlug = new Map(
      categories
        .filter((category) => category?.slug)
        .map((category) => [category.slug as string, category]),
    );
    const preferred = CATEGORY_TABS.map((tab) => bySlug.get(tab.slug)).filter(
      Boolean,
    );
    const rest = categories.filter(
      (category) =>
        category?.slug &&
        !CATEGORY_TABS.some((tab) => tab.slug === category.slug),
    );
    const chosen = [...preferred, ...rest].slice(0, 5);
    return chosen.length > 0
      ? chosen.map((category) => ({
          id: category!.slug as string,
          slug: category!.slug as string,
          label: category!.name ?? (category!.slug as string),
        }))
      : CATEGORY_TABS;
  }, [categories]);

  const [selectedTab, setSelectedTab] = React.useState("");
  const activeTab = selectedTab || tabs[0]?.slug || CATEGORY_TABS[0].slug;
  const setActiveTab = setSelectedTab;

  const { data: categoryResponse, isLoading } =
    useGetListingsByCategoryQuery(activeTab, { skip: !activeTab });

  const apiListings =
    categoryResponse?.data || (categoryResponse as any)?.content || [];

  const listings = apiListings || [];

  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 py-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white tracking-tight">
            Popular Categories &amp; Trends
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Explore bestselling apparel, beauty, and lifestyle essentials
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.slug)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.slug
                  ? "bg-[#6C4CD8] text-white shadow-xs"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left Collection Banner + Right Products */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-stretch">
        {/* Left Side Banner */}
        <div className="relative min-h-[300px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#FAF5EE] to-[#EFE7D8] dark:from-zinc-900 dark:to-zinc-800 p-6 flex flex-col justify-between border border-amber-100/60 dark:border-zinc-800 shadow-xs">
          <Image
            src="/picture/product_dress_toile_blue.jpg"
            alt="Category Spotlight"
            fill
            className="object-cover object-top opacity-85 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
              SPOTLIGHT
            </span>
          </div>

          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl font-black text-white leading-tight">
              Artisanal Fashion &amp; Dresses
            </h3>
            <p className="text-xs text-white/80">
              Discover unique hand-picked styles from trusted boutique sellers.
            </p>
            <Link
              href={`/products?category=${activeTab}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#111827] px-4 py-2 text-xs font-bold transition-all hover:bg-[#6C4CD8] hover:text-white"
            >
              <span>View All</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Products Grid */}
        {isLoading && listings.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-xs text-gray-400 gap-2">
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
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 items-stretch"
            >
              {listings.slice(0, 4).map((listing: any, index: number) => (
                <ProductCard
                  key={listing.uuid || listing.id || index}
                  listing={listing}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
