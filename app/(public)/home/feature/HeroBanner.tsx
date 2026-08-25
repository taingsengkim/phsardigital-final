"use client";

import * as React from "react";
import { HOME_SECTION } from "../section";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Leaf,
  Sparkles,
  SunMedium,
  Loader2,
} from "lucide-react";
import { useGetFeaturedListingsQuery, useGetCategoriesQuery } from "@/lib/api/homeApi";

interface BannerSlide {
  id: string;
  tag: string;
  iconType: "leaf" | "sun" | "sparkle";
  title: string;
  description?: string | null;
  buttonText: string;
  image: string;
  link: string;
  accentBg?: string;
}

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [direction, setDirection] = React.useState(1);

  // Fetch real data from APIs
  const { data: featuredResponse, isLoading: isLoadingFeatured } = useGetFeaturedListingsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  const featuredListings =
    featuredResponse?.data || (featuredResponse as any)?.content || [];

  // Adapt slides dynamically from featured API listings
  const slides: BannerSlide[] = React.useMemo(() => {
    if (featuredListings && featuredListings.length > 0) {
      return featuredListings.slice(0, 5).map((item: any, idx: number) => {
        const primaryImage =
          typeof item.thumbnailUri === "string"
            ? item.thumbnailUri
            : item.thumbnailUri?.uri ||
              item.images?.[0]?.uri ||
              item.images?.[0]?.url ||
              "/picture/product_dress_blue_floral.jpg";

        return {
          id: item.uuid || item.id || `slide-${idx}`,
          tag: item.category?.name ? item.category.name.toUpperCase() : "FEATURED PRODUCT",
          iconType: (idx % 3 === 0 ? "leaf" : idx % 3 === 1 ? "sun" : "sparkle") as "leaf" | "sun" | "sparkle",
          title: item.title ? item.title.toUpperCase() : "SPECIAL OFFER",
          description: item.description || null,
          buttonText: "BUY NOW →",
          image: primaryImage,
          link: `/products/${item.uuid || item.slug || item.id}`,
        };
      });
    }
    return [];
  }, [featuredListings]);

  // Dynamic Side Promo using the 2nd API listing if available
  const sidePromo = React.useMemo(() => {
    if (featuredListings && featuredListings.length > 1) {
      const item = featuredListings[1];
      const primaryImage =
        typeof item.thumbnailUri === "string"
          ? item.thumbnailUri
          : item.thumbnailUri?.uri ||
            item.images?.[0]?.uri ||
            item.images?.[0]?.url ||
            "/picture/seller_cover_electronics.jpg";
      return {
        tag: item.category?.name ? item.category.name.toUpperCase() : "SPECIAL ITEM",
        title: item.title ? item.title.toUpperCase() : "HOT DEAL",
        buttonText: "SHOP NOW →",
        image: primaryImage,
        link: `/products/${item.uuid || item.slug || item.id}`,
      };
    }
    return null;
  }, [featuredListings]);

  // Autoplay functionality
  React.useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[currentSlide] || slides[0];

  const renderIcon = (type: "leaf" | "sun" | "sparkle") => {
    switch (type) {
      case "leaf":
        return <Leaf className="size-3.5 text-[#1B2533]/70 dark:text-white/70 inline-block" />;
      case "sun":
        return <SunMedium className="size-3.5 text-[#1B2533]/70 dark:text-white/70 inline-block" />;
      case "sparkle":
        return <Sparkles className="size-3.5 text-[#1B2533]/70 dark:text-white/70 inline-block" />;
    }
  };

  if (isLoadingFeatured && slides.length === 0) {
    return (
      <section className={HOME_SECTION}>
        <div className="grid grid-cols-1 lg:grid-cols-[2.35fr_1fr] gap-4 sm:gap-5 items-stretch">
          <div className="relative min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[480px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-slate-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-[#6C4CD8]" />
          </div>
          <div className="hidden lg:block min-h-[480px] rounded-[32px] bg-slate-100 dark:bg-zinc-900 animate-pulse" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className={HOME_SECTION}>
      <div className="grid grid-cols-1 lg:grid-cols-[2.35fr_1fr] gap-4 sm:gap-5 items-stretch">
        
        {/* ================= LEFT / MAIN CAROUSEL BANNER ================= */}
        <div
          className="relative min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[480px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm border border-slate-200/60 dark:border-zinc-800/80 bg-[#EDF3F8] dark:bg-zinc-900 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={activeSlide.id}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 size-full"
            >
              {/* Background Product Image */}
              <Image
                src={activeSlide.image}
                alt={activeSlide.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                quality={90}
                className="object-cover object-center sm:object-right select-none"
              />

              {/* Soft subtle gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F0F5FA]/90 via-[#F0F5FA]/50 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent sm:from-[#F0F5FA]/80 sm:via-[#F0F5FA]/30 sm:to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Slide Text Content Overlay */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 max-w-lg sm:max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 sm:space-y-5"
              >
                {/* Overline Tag with Flourish */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#2D3748] dark:text-zinc-300 uppercase">
                  <span className="h-[1px] w-6 bg-[#2D3748]/30 dark:bg-zinc-600" />
                  <span className="flex items-center gap-1.5">
                    {renderIcon(activeSlide.iconType)}
                    {activeSlide.tag}
                  </span>
                  <span className="h-[1px] w-6 bg-[#2D3748]/30 dark:bg-zinc-600" />
                </div>

                {/* Headline in Luxury Serif */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-medium leading-[1.12] tracking-tight text-[#111827] dark:text-white uppercase max-w-md">
                  {activeSlide.title}
                </h1>

                {/* Optional Subtitle */}
                {activeSlide.description && (
                  <p className="text-sm sm:text-base text-[#4A5568] dark:text-zinc-300 font-normal max-w-sm">
                    {activeSlide.description}
                  </p>
                )}

                {/* Call to Action Button */}
                <div className="pt-2 sm:pt-4">
                  <Link
                    href={activeSlide.link}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-black dark:hover:bg-zinc-100 hover:scale-[1.03] hover:shadow-lg active:scale-95"
                  >
                    <span>{activeSlide.buttonText}</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-10 rounded-full bg-white/70 dark:bg-zinc-800/70 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md text-[#111827] dark:text-white flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 size-8 sm:size-10 rounded-full bg-white/70 dark:bg-zinc-800/70 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md text-[#111827] dark:text-white flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>

          {/* Pagination Indicators (Bottom Center) */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_: unknown, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? "w-6 h-2 bg-white dark:bg-zinc-200 shadow-sm"
                    : "w-2 h-2 bg-white/50 dark:bg-zinc-600/70 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= RIGHT / SIDE PROMO BANNER ================= */}
        {sidePromo && (
          <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-[480px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm border border-slate-200/60 dark:border-zinc-800/80 bg-[#DFEBF4] dark:bg-zinc-900 flex flex-col justify-between p-6 sm:p-8">
            
            {/* Background Image */}
            <Image
              src={sidePromo.image}
              alt={sidePromo.title}
              fill
              sizes="(max-width: 1024px) 100vw, 30vw"
              className="object-cover object-bottom sm:object-center select-none"
            />

            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#DFEBF4]/90 via-[#DFEBF4]/30 to-transparent dark:from-zinc-900/90 dark:via-zinc-900/30 dark:to-transparent" />

            {/* Side Banner Content */}
            <div className="relative z-10 space-y-2.5 sm:space-y-3 max-w-[260px]">
              {/* Overline */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] text-[#2D3748] dark:text-zinc-300 uppercase">
                <Leaf className="size-3.5 text-[#1B2533]/70 dark:text-white/70 inline-block" />
                <span>{sidePromo.tag}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-medium leading-tight tracking-tight text-[#111827] dark:text-white uppercase line-clamp-3">
                {sidePromo.title}
              </h2>

              {/* Button */}
              <div className="pt-2">
                <Link
                  href={sidePromo.link}
                  className="inline-flex items-center gap-2 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-6 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-black dark:hover:bg-zinc-100 hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span>{sidePromo.buttonText}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
