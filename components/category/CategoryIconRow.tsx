"use client";

import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

const CATEGORIES = [
  { name: "All Products", href: "/products", image: "/picture/logo.png", isGrid: true },
  { name: "Women's Fashion", href: "/products?category=womens-fashion", image: "/picture/product_dress_blue_floral.jpg" },
  { name: "Men's Fashion", href: "/products?category=mens-fashion", image: "/picture/pic6.jpg" },
  { name: "Health & Beauty", href: "/products?category=health-and-beauty", image: "/picture/hero_natural_care.jpg" },
  { name: "Electronics", href: "/products?category=electronics", image: "/picture/seller_cover_electronics.jpg" },
  { name: "Groceries & Food", href: "/products?category=groceries-and-essentials", image: "/picture/seller_cover_coffee.jpg" },
  { name: "Home & Living", href: "/products?category=home-and-living", image: "/picture/pic2.jpg" },
  { name: "Vehicles & Auto", href: "/products?category=vehicles", image: "/picture/seller_cover_auto.jpg" },
  { name: "Books & Stationery", href: "/products?category=books-and-stationery", image: "/picture/category_books.jpg" },
  { name: "Sports & Outdoors", href: "/products?category=sports-and-outdoors", image: "/picture/pic7.jpg" },
  { name: "Toys & Baby", href: "/products?category=toys-and-baby-care", image: "/picture/pic8.jpg" },
];

export default function CategoryIconRow() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-4 font-sans">
      <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 pt-1">
        {CATEGORIES.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className="group flex flex-shrink-0 flex-col items-center gap-2.5 min-w-[100px] sm:min-w-[115px]"
          >
            <div className="relative size-20 sm:size-[92px] md:size-[100px] rounded-full p-1 border-2 border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs group-hover:shadow-md group-hover:border-[#6C4CD8] group-hover:ring-4 group-hover:ring-[#6C4CD8]/10 transition-all duration-300 flex items-center justify-center overflow-hidden">
              {c.isGrid ? (
                <div className="size-full rounded-full bg-[#111827] text-white flex items-center justify-center">
                  <LayoutGrid size={28} />
                </div>
              ) : (
                <div className="relative size-full rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="100px"
                    className="object-cover transition-transform duration-500 group-hover:scale-112"
                  />
                </div>
              )}
            </div>
            <span className="text-center text-xs sm:text-[13px] font-bold text-[#1F1735] dark:text-zinc-300 group-hover:text-[#6C4CD8] line-clamp-1 transition-colors max-w-[110px]">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

