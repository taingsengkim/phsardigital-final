"use client";

import * as React from "react";
import { HOME_SECTION } from "../section";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/api/homeApi";

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "books-and-stationery": "/picture/category_books.jpg",
  "electronics": "/picture/seller_cover_electronics.jpg",
  "groceries-and-essentials": "/picture/seller_cover_coffee.jpg",
  "health-and-beauty": "/picture/hero_natural_care.jpg",
  "home-and-living": "/picture/pic2.jpg",
  "sports-and-outdoors": "/picture/pic7.jpg",
  "toys-and-baby-care": "/picture/pic8.jpg",
  "vehicles": "/picture/seller_cover_auto.jpg",
  "womens-fashion": "/picture/product_dress_blue_floral.jpg",
};

function getCategoryPicture(slug: string, name: string, customImage?: string): string {
  if (customImage && typeof customImage === "string" && (customImage.startsWith("/") || customImage.startsWith("http"))) {
    return customImage;
  }
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();

  for (const [key, path] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (s.includes(key) || key.includes(s)) return path;
  }

  if (s.includes("book") || n.includes("book") || n.includes("stationery")) return "/picture/category_books.jpg";
  if (s.includes("electro") || n.includes("electro") || s.includes("phone") || s.includes("computer")) return "/picture/seller_cover_electronics.jpg";
  if (s.includes("grocer") || n.includes("grocer") || s.includes("coffee") || s.includes("food") || s.includes("essential")) return "/picture/seller_cover_coffee.jpg";
  if (s.includes("health") || n.includes("health") || s.includes("beauty") || s.includes("care")) return "/picture/hero_natural_care.jpg";
  if (s.includes("home") || n.includes("home") || s.includes("living")) return "/picture/pic2.jpg";
  if (s.includes("sport") || n.includes("sport") || s.includes("outdoor")) return "/picture/pic7.jpg";
  if (s.includes("toy") || n.includes("baby")) return "/picture/pic8.jpg";
  if (s.includes("vehicle") || n.includes("car") || s.includes("auto")) return "/picture/seller_cover_auto.jpg";
  if (s.includes("women") || n.includes("dress") || n.includes("women")) return "/picture/product_dress_blue_floral.jpg";
  if (s.includes("men") || n.includes("men")) return "/picture/pic6.jpg";

  return "/picture/pic1.jpg";
}

export function PopularCategoriesStrip() {
  const { data: apiCategories = [], isLoading } = useGetCategoriesQuery();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const categories =
    (apiCategories || []).map((c: any) => ({
      id: c.uuid || String(c.id),
      name: c.name,
      slug: c.slug || String(c.id),
      image_url: getCategoryPicture(c.slug || "", c.name || "", c.image_url || c.imageUrl),
    }));

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className={HOME_SECTION}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white tracking-tight">
              Explore from our popular categories
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#6C4CD8]/10 text-[#6C4CD8] dark:text-[#A78BFA] text-[11px] font-bold px-2.5 py-0.5">
              <Sparkles className="size-3" />
              Featured
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Browse through top trending collections curated for you
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="size-8 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-[#F2F0FC] hover:border-[#6C4CD8] text-gray-700 dark:text-gray-200 hover:text-[#6C4CD8] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="size-8 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-[#F2F0FC] hover:border-[#6C4CD8] text-gray-700 dark:text-gray-200 hover:text-[#6C4CD8] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#6C4CD8] dark:text-[#A78BFA] hover:underline"
          >
            <span>Show all</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-xs text-gray-400 gap-2">
          <Loader2 className="size-4 animate-spin text-[#6C4CD8]" />
          Loading categories...
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth"
        >
          {categories.map((category: any, idx: number) => (
            <Link
              key={category.id || category.slug || idx}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center gap-2.5 min-w-[100px] sm:min-w-[115px] text-center flex-shrink-0"
            >
              {/* Larger, Prominent Category Circle */}
              <motion.div
                whileHover={{ scale: 1.06, y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative size-20 sm:size-[92px] md:size-[100px] rounded-full p-1 border-2 border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs group-hover:shadow-md group-hover:border-[#6C4CD8] group-hover:ring-4 group-hover:ring-[#6C4CD8]/10 flex items-center justify-center overflow-hidden transition-all duration-300"
              >
                <div className="relative size-full rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 80px, 100px"
                    className="object-cover transition-transform duration-500 group-hover:scale-112"
                  />
                </div>
              </motion.div>

              {/* Bold, Clear Category Title */}
              <span className="text-xs sm:text-[13px] font-bold text-[#1F1735] dark:text-zinc-200 group-hover:text-[#6C4CD8] dark:group-hover:text-[#A78BFA] line-clamp-1 transition-colors max-w-[110px] leading-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

