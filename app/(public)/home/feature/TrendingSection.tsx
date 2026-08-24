"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Star,
  ShoppingBag,
  Plus,
} from "lucide-react";
import {
  useGetBestSellingListingsQuery,
  useGetListingsQuery,
} from "@/lib/api/homeApi";
import ProductCard from "../ProductCard";

const FALLBACK_TRENDING = [
  {
    uuid: "t-1",
    title: "French Toile De Jouy Blue Vintage Puff Sleeve Mini Dress",
    slug: "french-toile-blue-porcelain-vintage-mini-dress",
    fullPrice: 72,
    discountPrice: 52,
    sellerProfile: { businessName: "Dance skirts" },
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    thumbnailUri: { uri: "/picture/product_dress_toile_blue.jpg" },
    averageRating: 4.9,
    reviewCount: 38,
    isFavorite: false,
  },
  {
    uuid: "t-2",
    title: "Beige Floral Sweetheart Neckline Midi Dress with Leg Slit",
    slug: "beige-floral-slit-sweetheart-midi-dress",
    fullPrice: 85,
    discountPrice: 58,
    sellerProfile: { businessName: "Fashion By Srey" },
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    thumbnailUri: { uri: "/picture/product_dress_beige_slit.jpg" },
    averageRating: 4.8,
    reviewCount: 42,
    isFavorite: true,
  },
  {
    uuid: "t-3",
    title: "Aura Botanical Restoring Serum & Night Moisture Cream",
    slug: "aura-botanical-restoring-serum",
    fullPrice: 95,
    discountPrice: 65,
    sellerProfile: { businessName: "Aura Naturals" },
    category: { name: "Health & Beauty", slug: "health-beauty" },
    thumbnailUri: { uri: "/picture/hero_natural_care.jpg" },
    averageRating: 5.0,
    reviewCount: 56,
    isFavorite: false,
  },
  {
    uuid: "t-4",
    title: "Minimalist Essential Nasal Inhaler & Lifestyle Case",
    slug: "minimalist-nasal-inhaler-case",
    fullPrice: 35,
    discountPrice: 24,
    sellerProfile: { businessName: "Aura Naturals" },
    category: { name: "Health & Beauty", slug: "health-beauty" },
    thumbnailUri: { uri: "/picture/hero_inhaler_promo.jpg" },
    averageRating: 4.7,
    reviewCount: 18,
    isFavorite: false,
  },
];

export function TrendingSection() {
  const { data: topRatedResponse } = useGetBestSellingListingsQuery();

  const apiListings =
    topRatedResponse?.data || (topRatedResponse as any)?.content || [];

  const listings = apiListings ? apiListings.slice(0, 4) : [];

  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 py-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white tracking-tight">
            Trending Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Top rated items shoppers are loving this week
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#6C4CD8] dark:text-[#A78BFA] hover:underline"
        >
          <span>Show all</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-stretch">
        {/* Collection Promo Banner (Left) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative min-h-[320px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#E7EEF8] to-[#D5E3F4] dark:from-zinc-900 dark:to-zinc-800 p-6 flex flex-col justify-between shadow-sm border border-slate-200/60 dark:border-zinc-800"
        >
          <Image
            src="/picture/product_dress_blue_floral.jpg"
            alt="Summer Collection"
            fill
            className="object-cover object-top opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
              NEW ARRIVALS
            </span>
          </div>

          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl font-black text-white leading-tight">
              Summer Elegance Collection
            </h3>
            <p className="text-xs text-white/80 line-clamp-2">
              Discover timeless floral dresses, natural skincare, and premium
              artisanal essentials.
            </p>
            <Link
              href="/products?category=womens-fashion"
              className="inline-flex items-center gap-2 rounded-full bg-white text-[#111827] px-5 py-2.5 text-xs font-bold transition-all hover:bg-[#6C4CD8] hover:text-white"
            >
              <span>Explore Now</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Product Cards Grid (Right) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
          {listings.map((item: any, idx: number) => (
            <ProductCard key={item.uuid || item.id || idx} listing={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
