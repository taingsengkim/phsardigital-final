"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Star,
  ShoppingBag,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  badge: string;
  tag: string;
  title: string;
  highlight: string;
  price: string;
  originalPrice: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  image: string;
  category: string;
  rating: number;
  reviews: string;
  salesCount: string;
  floatBadge1: { icon: string; text: string };
  floatBadge2: { text: string; subtext: string };
};

const SLIDES: Slide[] = [
  {
    id: "tech-audio",
    badge: "LIMITED OFFER",
    tag: "BEST SELLERS",
    title: "Next-Gen Pro",
    highlight: "Audio & Gadgets",
    price: "$49",
    originalPrice: "$79",
    description:
      "Experience immersive studio-grade sound and seamless multi-device Bluetooth connectivity with active noise cancellation.",
    ctaHref: "/products?category=electronics",
    ctaLabel: "Shop Tech Deals",
    image: "/picture/seller_cover_electronics.jpg",
    category: "Electronics & Audio",
    rating: 4.9,
    reviews: "2.8k+",
    salesCount: "1,400+ sold",
    floatBadge1: { icon: "🔥", text: "35% OFF Today" },
    floatBadge2: { text: "Studio Grade", subtext: "Active Noise Cancelling" },
  },
  {
    id: "fashion-elegance",
    badge: "NEW SEASON",
    tag: "POPULAR PICK",
    title: "Timeless Floral",
    highlight: "Summer Elegance",
    price: "$39",
    originalPrice: "$59",
    description:
      "Lightweight breathable floral midi wrap dresses with romantic silhouettes, designed by verified Cambodian fashion boutiques.",
    ctaHref: "/products?category=womens-fashion",
    ctaLabel: "Explore Fashion",
    image: "/picture/product_dress_blue_floral.jpg",
    category: "Women's Fashion",
    rating: 4.8,
    reviews: "1.9k+",
    salesCount: "950+ ordered",
    floatBadge1: { icon: "✨", text: "100% Breathable Chiffon" },
    floatBadge2: { text: "Verified Seller", subtext: "Dance Skirts & Boutiques" },
  },
  {
    id: "urban-streetwear",
    badge: "URBAN ESSENTIALS",
    tag: "TOP RATED",
    title: "Waterproof Travel",
    highlight: "Gear & Apparel",
    price: "$29",
    originalPrice: "$45",
    description:
      "Heavyweight cotton zip-up hoodies and ergonomic waterproof laptop travel backpacks tailored for modern urban commuters.",
    ctaHref: "/products?category=sports-and-outdoors",
    ctaLabel: "Browse Essentials",
    image: "/picture/product_travel_backpack.jpg",
    category: "Travel & Lifestyle",
    rating: 5.0,
    reviews: "3.2k+",
    salesCount: "2,100+ delivered",
    floatBadge1: { icon: "⚡", text: "Express Delivery" },
    floatBadge2: { text: "IPX6 Waterproof", subtext: "15.6\" Laptop Protection" },
  },
];

const AUTOPLAY_DELAY = 5000;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrent((prev) => (prev + newDirection + SLIDES.length) % SLIDES.length);
    },
    []
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => paginate(1), AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [paused, paginate]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden font-sans select-none bg-[#EFECFB] dark:bg-[#150F2A] border-b border-[#E2DCF7] dark:border-zinc-800"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background Subtle Gradient & Glowing Ambiance ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EFECFB] via-[#F5F2FD] to-[#E8E2F9] dark:from-[#150F2A] dark:via-[#1D143D] dark:to-[#160E2E]" />

      {/* Animated Glowing Lavender Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-16 -top-16 h-80 w-80 rounded-full bg-[#6C4CD8]/20 blur-[80px]"
      />
      <motion.div
        animate={{
          scale: [1.15, 1, 1.15],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -25, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-[#A78BFA]/25 blur-[90px]"
      />

      {/* Subtle Dot Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #6C4CD8 1.2px, transparent 1.2px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* ── Main Banner Container ── */}
      <div className="relative mx-auto max-w-[1280px] px-6 sm:px-8 py-10 lg:py-14 min-h-[480px] lg:min-h-[520px] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* ════════ LEFT COLUMN: ANIMATED TEXT CONTENT (cols: 7) ════════ */}
          <div className="lg:col-span-7 flex flex-col justify-center z-10 space-y-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? -25 : 25, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? 25 : -25, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-3.5"
              >
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-800/90 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#6C4CD8] dark:text-[#A78BFA] border border-[#DDD6FE] dark:border-zinc-700 shadow-xs">
                    <Sparkles className="size-3 text-[#6C4CD8] dark:text-[#A78BFA] animate-pulse" />
                    {slide.badge}
                  </span>
                  <span className="rounded-full bg-[#6C4CD8] px-3 py-1 text-[11px] font-black uppercase text-white shadow-xs">
                    {slide.tag}
                  </span>
                </div>

                {/* Animated Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#160D38] dark:text-white leading-[1.08]">
                  {slide.title}
                  <br />
                  <span className="text-[#6C4CD8] dark:text-[#A78BFA]">
                    {slide.highlight}
                  </span>
                </h1>

                {/* Price & Savings Callout */}
                <div className="flex items-baseline gap-3 pt-0.5">
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#6E678A] dark:text-zinc-400">
                    Starting from
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#6C4CD8] dark:text-[#A78BFA] tracking-tight">
                    {slide.price}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#9B94B4] line-through">
                    {slide.originalPrice}
                  </span>
                </div>

                {/* Description */}
                <p className="max-w-xl text-sm sm:text-[15px] leading-relaxed text-[#4D4566] dark:text-zinc-300 line-clamp-2">
                  {slide.description}
                </p>

                {/* Interactive CTA Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link
                    href={slide.ctaHref}
                    className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#6C4CD8] px-6 sm:px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_8px_25px_rgba(108,76,216,0.35)] transition-all hover:scale-105 hover:bg-[#5839C2] cursor-pointer"
                  >
                    <ShoppingBag className="size-4 transition-transform group-hover:rotate-12" />
                    <span>{slide.ctaLabel}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#DDD6FE] dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/80 px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-[#160D38] dark:text-white shadow-xs transition-all hover:bg-white hover:scale-105 cursor-pointer"
                  >
                    <span>View All</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation Dots & Progress Bar */}
            <div className="pt-3 flex items-center gap-2.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300 cursor-pointer",
                    i === current
                      ? "h-2.5 w-8 bg-[#6C4CD8] dark:bg-[#A78BFA] shadow-xs"
                      : "h-2 w-2 bg-[#C4BCE8] dark:bg-zinc-700 hover:bg-[#6C4CD8]"
                  )}
                />
              ))}

              {/* Autoplay Active Progress Indicator */}
              <div className="ml-3 h-1 w-16 overflow-hidden rounded-full bg-[#DDD6FE] dark:bg-zinc-800">
                <motion.div
                  key={current}
                  initial={{ width: "0%" }}
                  animate={{ width: paused ? "0%" : "100%" }}
                  transition={{
                    duration: AUTOPLAY_DELAY / 1000,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                  className="h-full bg-[#6C4CD8] dark:bg-[#A78BFA] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN: SHOWCASE CARD & FLOATING BADGES (cols: 5) ════════ */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative w-full max-w-[320px] sm:max-w-[350px]"
              >
                {/* Product Card Outer Container */}
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border-2 border-white dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(108,76,216,0.14)]"
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover transition-transform duration-700 group-hover:scale-108"
                    priority
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

                  {/* Category Pill on Image */}
                  <div className="absolute top-4 left-4 z-10 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
                    {slide.category}
                  </div>

                  {/* Price Tag Inside Bottom of Card */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between rounded-2xl bg-black/60 p-3 backdrop-blur-md border border-white/20">
                    <div>
                      <p className="text-[10px] font-semibold text-white/70">Flash Deal Price</p>
                      <p className="text-xl font-black text-amber-300 leading-none">{slide.price}.00</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-400/30">
                      <Flame className="size-3" />
                      {slide.salesCount}
                    </span>
                  </div>
                </motion.div>

                {/* ── Floating Badge 1: Top-Left (Animated) ── */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -left-3 sm:-left-6 z-20 rounded-2xl bg-white/95 dark:bg-zinc-900/95 p-3 backdrop-blur-xl border border-[#DDD6FE] dark:border-zinc-700 shadow-xl flex items-center gap-2.5"
                >
                  <span className="text-xl">{slide.floatBadge1.icon}</span>
                  <div>
                    <p className="text-xs font-black text-[#160D38] dark:text-white leading-tight">
                      {slide.floatBadge1.text}
                    </p>
                    <p className="text-[10px] font-medium text-[#7C7596] dark:text-zinc-400">Verified Marketplace Deal</p>
                  </div>
                </motion.div>

                {/* ── Floating Badge 2: Bottom-Right (Animated) ── */}
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-3 -right-3 sm:-right-5 z-20 rounded-2xl bg-white/95 dark:bg-zinc-900/95 p-3 backdrop-blur-xl border border-[#DDD6FE] dark:border-zinc-700 shadow-xl space-y-0.5"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-xs font-black text-[#160D38] dark:text-white">{slide.rating}</span>
                  </div>
                  <p className="text-[10.5px] font-bold text-[#160D38] dark:text-white">
                    {slide.floatBadge2.text}
                  </p>
                  <p className="text-[9.5px] text-[#7C7596] dark:text-zinc-400">
                    {slide.reviews} verified reviews
                  </p>
                </motion.div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>
      </div>

      {/* ── Prev / Next Navigation Arrows ── */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#6C4CD8] dark:text-[#A78BFA] border border-[#DDD6FE] dark:border-zinc-700 shadow-md transition-all hover:bg-[#6C4CD8] hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="size-5 sm:size-6" />
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#6C4CD8] dark:text-[#A78BFA] border border-[#DDD6FE] dark:border-zinc-700 shadow-md transition-all hover:bg-[#6C4CD8] hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="size-5 sm:size-6" />
      </button>
    </section>
  );
}


