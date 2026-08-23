"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, Loader2 } from "lucide-react";
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
  "mens-fashion": "/picture/pic6.jpg",
};

const FALLBACK_CATEGORIES = [
  { uuid: "6aaac71d-983c-4f72-abc2-50ead283b089", name: "Books & Stationery", slug: "books-and-stationery" },
  { uuid: "9e970d23-0c2e-4b48-bc16-caa4ec59df9b", name: "Electronics", slug: "electronics" },
  { uuid: "54fd238f-e326-4bf4-a3a8-fcf91dc8c80c", name: "Groceries & Essentials", slug: "groceries-and-essentials" },
  { uuid: "4b932659-fe14-42e7-841d-e8d2bf9e3ae5", name: "Health & Beauty", slug: "health-and-beauty" },
  { uuid: "c1cd451d-2222-46b2-a837-b0abecb2e2cb", name: "Home & Living", slug: "home-and-living" },
  { uuid: "981705a1-fea0-4a99-9a7f-9064ba55bd6c", name: "Sports & Outdoors", slug: "sports-and-outdoors" },
  { uuid: "993327fe-b998-402e-a4c8-169841bc6d84", name: "Toys & Baby Care", slug: "toys-and-baby-care" },
  { uuid: "c7e88b48-dce6-4722-abf4-9a5c724edb4f", name: "Vehicles", slug: "vehicles" },
  { uuid: "e17ad20e-db1a-4976-8b26-20755eee784f", name: "Women's Fashion", slug: "womens-fashion" },
  { uuid: "5d6c4acb-bbdb-4c88-8596-c5b7576b4784", name: "Men's Fashion", slug: "mens-fashion" },
];

function getCategoryPicture(slug: string, name: string, customImage?: string): string {
  if (customImage && (customImage.startsWith("/") || customImage.startsWith("http"))) {
    return customImage;
  }
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();

  for (const [key, path] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (s.includes(key) || key.includes(s)) return path;
  }

  if (s.includes("book") || n.includes("book") || n.includes("stationery")) return "/picture/category_books.jpg";
  if (s.includes("electro") || n.includes("electro") || s.includes("phone") || s.includes("computer")) return "/picture/seller_cover_electronics.jpg";
  if (s.includes("grocer") || n.includes("grocer") || s.includes("coffee") || s.includes("food")) return "/picture/seller_cover_coffee.jpg";
  if (s.includes("health") || n.includes("health") || s.includes("beauty") || s.includes("care")) return "/picture/hero_natural_care.jpg";
  if (s.includes("home") || n.includes("home") || s.includes("living")) return "/picture/pic2.jpg";
  if (s.includes("sport") || n.includes("sport")) return "/picture/pic7.jpg";
  if (s.includes("toy") || n.includes("baby")) return "/picture/pic8.jpg";
  if (s.includes("vehicle") || n.includes("car") || s.includes("auto")) return "/picture/seller_cover_auto.jpg";
  if (s.includes("women") || n.includes("dress") || n.includes("women")) return "/picture/product_dress_blue_floral.jpg";
  if (s.includes("men") || n.includes("men")) return "/picture/pic6.jpg";

  return "/picture/pic1.jpg";
}

export default function CategoryIconRow() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || searchParams.get("categorySlug") || "";
  const sortParam = searchParams.get("sort") || "";

  const { data: apiCategories = [], isLoading } = useGetCategoriesQuery();

  const categories =
    apiCategories && apiCategories.length > 0 ? apiCategories : FALLBACK_CATEGORIES;

  function buildCategoryHref(slug: string) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (sortParam) params.set("sort", sortParam);
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ""}`;
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 pt-6 pb-4 font-sans">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-white uppercase tracking-wider">
          Browse Categories
        </h3>
        {activeCategory && (
          <Link
            href="/products"
            className="text-xs font-semibold text-[#6C4CD8] hover:underline"
          >
            Clear Filter
          </Link>
        )}
      </div>

      <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-3 pt-1">
        {/* All Products / Recommend Item */}
        <Link
          href={buildCategoryHref("")}
          scroll={false}
          className="group flex flex-shrink-0 flex-col items-center gap-2.5 min-w-[100px] sm:min-w-[115px]"
        >
          <motion.div
            whileHover={{ scale: 1.06, y: -3 }}
            transition={{ duration: 0.2 }}
            className={`relative size-20 sm:size-[92px] md:size-[100px] rounded-full p-1 border-2 transition-all duration-300 flex items-center justify-center shadow-xs ${
              !activeCategory
                ? "border-[#6C4CD8] ring-4 ring-[#6C4CD8]/20 bg-[#6C4CD8] text-white shadow-md scale-105"
                : "border-gray-200/90 dark:border-zinc-800 bg-[#111827] text-white group-hover:border-[#6C4CD8]"
            }`}
          >
            <LayoutGrid size={28} className="text-white" />
          </motion.div>
          <span
            className={`text-center text-xs sm:text-[13px] leading-tight transition-colors ${
              !activeCategory
                ? "font-extrabold text-[#6C4CD8]"
                : "font-bold text-gray-700 dark:text-zinc-300 group-hover:text-[#6C4CD8]"
            }`}
          >
            All Items
          </span>
        </Link>

        {/* Dynamic Category Items with Photos */}
        {isLoading && categories.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-xs font-semibold text-gray-400">
            <Loader2 size={16} className="animate-spin text-[#6C4CD8]" />
            <span>Loading categories...</span>
          </div>
        ) : (
          categories.map((c: any) => {
            const pictureUrl = getCategoryPicture(
              c.slug || "",
              c.name || "",
              c.image_url || c.imageUrl
            );
            const isActive = activeCategory === c.slug;

            return (
              <Link
                key={c.uuid || c.slug || c.name}
                href={buildCategoryHref(c.slug || "")}
                scroll={false}
                className="group flex flex-shrink-0 flex-col items-center gap-2.5 min-w-[100px] sm:min-w-[115px]"
              >
                <motion.div
                  whileHover={{ scale: 1.06, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`relative size-20 sm:size-[92px] md:size-[100px] rounded-full p-1 border-2 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-xs ${
                    isActive
                      ? "border-[#6C4CD8] ring-4 ring-[#6C4CD8]/20 shadow-md scale-105"
                      : "border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 group-hover:border-[#6C4CD8]"
                  }`}
                >
                  <div className="relative size-full rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <Image
                      src={pictureUrl}
                      alt={c.name}
                      fill
                      sizes="100px"
                      className="object-cover transition-transform duration-500 group-hover:scale-112"
                    />
                  </div>
                </motion.div>
                <span
                  className={`text-center text-xs sm:text-[13px] leading-tight line-clamp-1 transition-colors max-w-[110px] ${
                    isActive
                      ? "font-extrabold text-[#6C4CD8]"
                      : "font-bold text-[#1F1735] dark:text-zinc-300 group-hover:text-[#6C4CD8]"
                  }`}
                >
                  {c.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
