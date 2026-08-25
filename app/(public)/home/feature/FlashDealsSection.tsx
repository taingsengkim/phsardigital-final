"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Star, ShoppingBag } from "lucide-react";
import { useGetFeaturedListingsQuery } from "@/lib/api/homeApi";
import SavedButton from "@/components/saved/SavedButton";

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
  isFavorite?: boolean;
}

function formatFlashDeal(item: any): FlashDealItem {
  const fullPrice = typeof item.fullPrice === "number" ? item.fullPrice : (typeof item.price === "number" ? item.price : 0);
  const discountPrice = typeof item.discountPrice === "number" ? item.discountPrice : null;
  const hasDiscount = discountPrice !== null && fullPrice > 0 && discountPrice < fullPrice;

  const originalPrice = fullPrice;
  const salePrice = hasDiscount ? discountPrice! : fullPrice;
  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0;

  const primaryImage =
    typeof item.thumbnailUri === "string"
      ? item.thumbnailUri
      : item.thumbnailUri?.uri ||
        item.images?.[0]?.uri ||
        item.images?.[0]?.url ||
        "";

  const thumbnails = (item.images || [])
    .map((img: any) => img?.uri || img?.url)
    .filter(Boolean);
  if (thumbnails.length === 0 && primaryImage) thumbnails.push(primaryImage);

  return {
    id: item.uuid || item.id || "flash-1",
    slug: item.slug || item.uuid || "flash-deal",
    title: item.title || "Flash Sale Item",
    category: item.category?.name || "Featured",
    storeName: item.sellerProfile?.businessName || "",
    originalPrice,
    salePrice,
    discountPercent,
    rating: item.averageRating ?? 0,
    reviewCount: item.reviewCount ?? 0,
    badge: item.isFeatured ? "Hot Deal" : "Flash Sale",
    image: primaryImage,
    thumbnails,
    isFavorite: Boolean(item.isFavorite),
  };
}

export function FlashDealsSection() {
  const [activeThumb, setActiveThumb] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState({
    days: "01",
    hours: "08",
    minutes: "45",
    seconds: "22",
  });

  const { data: featuredResponse } = useGetFeaturedListingsQuery();

  const apiListings =
    featuredResponse?.data || (featuredResponse as any)?.content || [];

  const formattedItems = React.useMemo(() => {
    return (apiListings || []).map(formatFlashDeal);
  }, [apiListings]);

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

  if (formattedItems.length === 0) return null;

  const featuredDeal = formattedItems[0];
  const flashItems = formattedItems.slice(1, 5);

  const featuredImg =
    featuredDeal?.thumbnails && featuredDeal.thumbnails[activeThumb]
      ? featuredDeal.thumbnails[activeThumb]
      : featuredDeal?.image || "";

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-5 font-sans">
      {/* Section Header with Countdown Timer */}
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
        {featuredDeal && (
          <div className="relative flex flex-col justify-between rounded-2xl border border-[#EDEBF3] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
            <div className="space-y-3.5">
              {/* Top Badges */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#E8F8F0] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-bold text-xs px-3 py-0.5">
                  {featuredDeal.badge}
                </span>
                {featuredDeal.discountPercent > 0 && (
                  <span className="rounded-full bg-[#FF3366] text-white font-extrabold text-xs px-2.5 py-0.5 shadow-xs">
                    -{featuredDeal.discountPercent}%
                  </span>
                )}
              </div>

              {/* Main Featured Image */}
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-800">
                {featuredImg ? (
                  <Image
                    src={featuredImg}
                    alt={featuredDeal.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    unoptimized={Boolean(featuredImg.startsWith("http"))}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    No image
                  </div>
                )}
              </div>

              {/* Gallery Thumbnail Row */}
              {featuredDeal.thumbnails && featuredDeal.thumbnails.length > 1 && (
                <div className="flex items-center gap-2 pt-0.5">
                  {featuredDeal.thumbnails.map((thumb: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveThumb(idx)}
                      className={`relative size-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeThumb === idx
                          ? "border-[#6C4CD8] scale-105 shadow-xs"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={thumb} alt="thumbnail" fill className="object-cover" unoptimized={Boolean(thumb.startsWith("http"))} />
                    </button>
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-[#6C4CD8] dark:text-[#A78BFA] uppercase tracking-wider">
                  {featuredDeal.category}
                </span>
                <Link href={`/products/${featuredDeal.id || featuredDeal.slug}`}>
                  <h3 className="text-[16px] sm:text-[17px] font-bold text-[#111827] dark:text-white line-clamp-2 hover:text-[#6C4CD8] transition-colors leading-snug">
                    {featuredDeal.title}
                  </h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center gap-1 text-xs pt-0.5">
                  <div className="flex items-center text-amber-400">
                    <Star className="size-3.5 fill-[#F5B301] text-[#F5B301]" />
                    <span className="font-bold ml-1 text-[#111827] dark:text-white">{featuredDeal.rating}</span>
                  </div>
                  <span className="text-gray-400 text-xs">({featuredDeal.reviewCount} Reviews)</span>
                </div>
              </div>
            </div>

            {/* Pricing & Add to Cart Action */}
            <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#6C4CD8]">
                  ${featuredDeal.salePrice.toFixed(2)}
                </span>
                {featuredDeal.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-gray-400 line-through">
                    ${featuredDeal.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <Link
                href={`/products/${featuredDeal.id || featuredDeal.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] dark:bg-[#6C4CD8] text-white px-4 py-2 text-xs font-bold hover:bg-[#6C4CD8] transition-colors shadow-xs"
              >
                <ShoppingBag className="size-3.5" />
                <span>Shop Now</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= RIGHT: 2x2 COMPACT & SMALLER REGULAR PRODUCT CARDS ================= */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-stretch">
          {flashItems.map((item: FlashDealItem) => {
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#EDEBF3] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all hover:border-[#6C4CD8]/40"
              >
                <Link href={`/products/${item.id || item.slug}`} className="flex flex-col h-full justify-between">
                  {/* Top Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F8F7FB] dark:bg-zinc-800">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-106"
                        unoptimized={Boolean(item.image.startsWith("http"))}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        No image
                      </div>
                    )}

                    {/* Top-Left Discount Badge */}
                    {item.discountPercent > 0 && (
                      <span className="absolute left-2 top-2 z-10 rounded-sm bg-[#6C4CD8] px-1.5 py-0.5 text-[9.5px] font-black text-white shadow-xs">
                        -{item.discountPercent}%
                      </span>
                    )}

                    {/* Top-Right Heart Save Button */}
                    <SavedButton
                      listingId={item.id}
                      initialSaved={item.isFavorite}
                      className="absolute right-2 top-2 z-10 shadow-xs"
                    />
                  </div>

                  {/* Card Content Below Image */}
                  <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 space-y-1 font-sans">
                    {/* 1. Title */}
                    <h3 className="text-[13px] sm:text-[13.5px] font-bold text-[#111827] dark:text-white line-clamp-1 leading-snug group-hover:text-[#6C4CD8] transition-colors">
                      {item.title}
                    </h3>

                    {/* 2. Price Row */}
                    <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[13.5px] sm:text-[14px] font-black text-[#6C4CD8] dark:text-[#A78BFA]">
                        ${item.salePrice.toFixed(2)}
                      </span>
                      {item.discountPercent > 0 && (
                        <span className="text-[10.5px] font-semibold text-[#9B94B4] line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* 3. Rating Row */}
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
                    {item.storeName && (
                      <p className="text-[10px] font-medium text-[#7C7596] truncate">
                        {item.storeName}
                      </p>
                    )}
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

