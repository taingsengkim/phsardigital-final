"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Star, ShoppingBag, Heart } from "lucide-react";
import { useGetFeaturedListingsQuery } from "@/lib/api/homeApi";

interface FlashDealItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  storeName?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  thumbnails?: string[];
}

const FEATURED_DEAL: FlashDealItem = {
  id: "flash-featured-1",
  slug: "vintage-floral-cottagecore-corset-mini-dress",
  title: "Vintage Floral Cottagecore Corset Lace-Up Mini Dress with Puff Sleeves",
  category: "Women's Fashion",
  storeName: "Dance skirts",
  originalPrice: 65,
  salePrice: 45,
  discountPercent: 30,
  rating: 4.9,
  reviewCount: 48,
  badge: "Hot Deal",
  image: "/picture/product_dress_blue_floral.jpg",
  thumbnails: [
    "/picture/product_dress_blue_floral.jpg",
    "/picture/product_dress_beige_slit.jpg",
    "/picture/product_dress_toile_blue.jpg",
  ],
};

const FLASH_ITEMS: FlashDealItem[] = [
  {
    id: "flash-item-2",
    slug: "french-toile-blue-porcelain-vintage-mini-dress",
    title: "French Toile De Jouy Blue Vintage Puff Sleeve Mini Dress",
    category: "Women's Fashion",
    storeName: "Dance skirts",
    originalPrice: 72,
    salePrice: 52,
    discountPercent: 28,
    rating: 4.9,
    reviewCount: 32,
    badge: "New",
    image: "/picture/product_dress_toile_blue.jpg",
  },
  {
    id: "flash-item-3",
    slug: "beige-floral-slit-sweetheart-midi-dress",
    title: "Beige Floral Sweetheart Neckline Midi Dress with High Leg Slit",
    category: "Women's Fashion",
    storeName: "Fashion By Srey",
    originalPrice: 85,
    salePrice: 58,
    discountPercent: 32,
    rating: 4.8,
    reviewCount: 29,
    badge: "Popular",
    image: "/picture/product_dress_beige_slit.jpg",
  },
  {
    id: "flash-item-4",
    slug: "luxury-organic-botanical-facial-serum",
    title: "Luxury Organic Botanical Hydrating Facial Essence & Serum Set",
    category: "Health & Beauty",
    storeName: "Aura Naturals",
    originalPrice: 110,
    salePrice: 75,
    discountPercent: 31,
    rating: 5.0,
    reviewCount: 64,
    badge: "Limited",
    image: "/picture/hero_natural_care.jpg",
  },
  {
    id: "flash-item-5",
    slug: "premium-aquamarine-skincare-moisturizer",
    title: "Aquamarine Deep Moisture Restoring Face Oil & Night Cream",
    category: "Health & Beauty",
    storeName: "Storee Corner",
    originalPrice: 95,
    salePrice: 62,
    discountPercent: 35,
    rating: 4.7,
    reviewCount: 19,
    badge: "Sale",
    image: "/picture/hero_slide_summer_sale.jpg",
  },
];

export function FlashDealsSection() {
  const [activeThumb, setActiveThumb] = React.useState(0);
  const [savedItems, setSavedItems] = React.useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = React.useState({
    days: "01",
    hours: "08",
    minutes: "45",
    seconds: "22",
  });

  const { data: featuredResponse } = useGetFeaturedListingsQuery();

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Simple countdown timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let sec = parseInt(prev.seconds, 10) - 1;
        let min = parseInt(prev.minutes, 10);
        let hr = parseInt(prev.hours, 10);

        if (sec < 0) {
          sec = 59;
          min -= 1;
        }
        if (min < 0) {
          min = 59;
          hr -= 1;
        }
        if (hr < 0) {
          hr = 23;
        }

        return {
          days: prev.days,
          hours: String(hr).padStart(2, "0"),
          minutes: String(min).padStart(2, "0"),
          seconds: String(sec).padStart(2, "0"),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const featuredImg =
    FEATURED_DEAL.thumbnails && FEATURED_DEAL.thumbnails[activeThumb]
      ? FEATURED_DEAL.thumbnails[activeThumb]
      : FEATURED_DEAL.image;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-5 font-sans">
      {/* Section Header with Countdown Timer (Picture 3 style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white tracking-tight">
            Today&apos;s Best Deals
          </h2>
          <span className="rounded-full bg-[#FFF0F3] dark:bg-pink-950/40 text-[#FF3B69] dark:text-pink-400 border border-[#FFD0DB] dark:border-pink-900/50 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 uppercase tracking-wider">
            FLASH SALE
          </span>
        </div>

        {/* Live Countdown Box */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-zinc-400">
            <Clock className="size-3.5 text-[#6C4CD8]" />
            <span className="hidden sm:inline">Hurry Up!! Offer Ends In:</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-white">
            <span className="bg-[#111827] dark:bg-zinc-800 px-2 py-0.5 rounded-md shadow-xs">
              {timeLeft.days} <span className="text-[10px] text-gray-400 font-normal">d</span>
            </span>
            <span className="text-gray-400 font-bold">:</span>
            <span className="bg-[#111827] dark:bg-zinc-800 px-2 py-0.5 rounded-md shadow-xs">
              {timeLeft.hours} <span className="text-[10px] text-gray-400 font-normal">h</span>
            </span>
            <span className="text-gray-400 font-bold">:</span>
            <span className="bg-[#111827] dark:bg-zinc-800 px-2 py-0.5 rounded-md shadow-xs">
              {timeLeft.minutes} <span className="text-[10px] text-gray-400 font-normal">m</span>
            </span>
            <span className="text-gray-400 font-bold">:</span>
            <span className="bg-[#6C4CD8] px-2 py-0.5 rounded-md shadow-xs text-white">
              {timeLeft.seconds} <span className="text-[10px] text-purple-200 font-normal">s</span>
            </span>
          </div>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#6C4CD8] dark:text-[#A78BFA] hover:underline ml-2"
          >
            <span>Show all</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Large Standalone Featured Card (Left) + Smaller Compact Regular Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr] gap-3.5 sm:gap-4 items-start">
        
        {/* ================= LEFT: LARGE STANDALONE FEATURED FLASH CARD ================= */}
        <div className="relative flex flex-col justify-between rounded-2xl border border-[#EDEBF3] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
          <div className="space-y-3.5">
            {/* Top Badges */}
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#E8F8F0] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-bold text-xs px-3 py-0.5">
                {FEATURED_DEAL.badge}
              </span>
              <span className="rounded-full bg-[#FF3366] text-white font-extrabold text-xs px-2.5 py-0.5 shadow-xs">
                -{FEATURED_DEAL.discountPercent}%
              </span>
            </div>

            {/* Main Featured Image - Large and Prominent */}
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-800">
              <Image
                src={featuredImg}
                alt={FEATURED_DEAL.title}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Gallery Thumbnail Row */}
            {FEATURED_DEAL.thumbnails && (
              <div className="flex items-center gap-2 pt-0.5">
                {FEATURED_DEAL.thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveThumb(idx)}
                    className={`relative size-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeThumb === idx
                        ? "border-[#6C4CD8] scale-105 shadow-xs"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={thumb} alt="thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-[#6C4CD8] dark:text-[#A78BFA] uppercase tracking-wider">
                {FEATURED_DEAL.category}
              </span>
              <Link href={`/products/${FEATURED_DEAL.slug}`}>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#111827] dark:text-white line-clamp-2 hover:text-[#6C4CD8] transition-colors leading-snug">
                  {FEATURED_DEAL.title}
                </h3>
              </Link>
              
              {/* Rating */}
              <div className="flex items-center gap-1 text-xs pt-0.5">
                <div className="flex items-center text-amber-400">
                  <Star className="size-3.5 fill-[#F5B301] text-[#F5B301]" />
                  <span className="font-bold ml-1 text-[#111827] dark:text-white">{FEATURED_DEAL.rating}</span>
                </div>
                <span className="text-gray-400 text-xs">({FEATURED_DEAL.reviewCount} Reviews)</span>
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart Action */}
          <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#6C4CD8]">
                ${FEATURED_DEAL.salePrice}.00
              </span>
              <span className="text-xs font-semibold text-gray-400 line-through">
                ${FEATURED_DEAL.originalPrice}.00
              </span>
            </div>

            <Link
              href={`/products/${FEATURED_DEAL.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-4 py-2 text-xs font-bold hover:bg-[#6C4CD8] dark:hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <ShoppingBag className="size-3.5" />
              <span>Shop Now</span>
            </Link>
          </div>
        </div>

        {/* ================= RIGHT: 2x2 COMPACT & SMALLER REGULAR PRODUCT CARDS ================= */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-stretch">
          {FLASH_ITEMS.map((item) => {
            const isFav = Boolean(savedItems[item.id]);
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#EDEBF3] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all hover:border-[#6C4CD8]/40"
              >
                <Link href={`/products/${item.slug}`} className="flex flex-col h-full justify-between">
                  {/* Top Image Container - Compact Height */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F8F7FB] dark:bg-zinc-800">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />

                    {/* Top-Left Purple Discount Badge */}
                    {item.discountPercent && (
                      <span className="absolute left-2 top-2 z-10 rounded-sm bg-[#6C4CD8] px-1.5 py-0.5 text-[9.5px] font-black text-white shadow-xs">
                        -{item.discountPercent}%
                      </span>
                    )}

                    {/* Top-Right Heart Save Button */}
                    <button
                      onClick={(e) => toggleSave(item.id, e)}
                      aria-label="Save item"
                      className={`absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-xs transition-all ${
                        isFav ? "bg-[#6C4CD8] text-white" : "bg-white/90 dark:bg-zinc-900/90 text-[#6C4CD8] hover:bg-[#F2F0FC]"
                      }`}
                    >
                      <Heart
                        size={11.5}
                        className={isFav ? "fill-white text-white" : "text-[#6C4CD8]"}
                      />
                    </button>
                  </div>

                  {/* Card Content Below Image - Compact & Sized Down */}
                  <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 space-y-1 font-sans">
                    {/* 1. Title */}
                    <h3 className="text-[13px] sm:text-[13.5px] font-bold text-[#111827] dark:text-white line-clamp-1 leading-snug group-hover:text-[#6C4CD8] transition-colors">
                      {item.title}
                    </h3>

                    {/* 2. Price Row (Original Price strikethrough + Current Purple Price) */}
                    <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                      {item.originalPrice && (
                        <span className="text-[10.5px] font-semibold text-[#9B94B4] line-through">
                          ${item.originalPrice}.00
                        </span>
                      )}
                      <span className="text-[13.5px] sm:text-[14px] font-black text-[#6C4CD8] dark:text-[#A78BFA]">
                        ${item.salePrice}.00
                      </span>
                    </div>

                    {/* 3. Rating Row (5 Stars + Review Count) */}
                    <div className="flex items-center gap-1 text-xs">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10.5}
                            className={
                              i < Math.round(item.rating)
                                ? "fill-[#F5B301] text-[#F5B301]"
                                : "fill-[#E5E2EC] text-[#E5E2EC]"
                            }
                          />
                        ))}
                      </div>
                      <span className="ml-0.5 text-[10px] font-medium text-[#8B85A0]">
                        ({item.reviewCount})
                      </span>
                    </div>

                    {/* 4. Store Name */}
                    <p className="text-[10px] font-medium text-[#7C7596] truncate">
                      {item.storeName || "Store1Name"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

