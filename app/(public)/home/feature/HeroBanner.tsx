"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronsUpDown, Loader2, Layers } from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/api/homeApi";

export function HeroBanner() {
  const { data: apiCategories = [], isLoading } = useGetCategoriesQuery();

  const categories = apiCategories.map((c: any) => ({
    id: c.uuid || String(c.id),
    name: c.name,
    slug: c.slug || String(c.id),
  }));

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[260px_1fr] font-sans">
      {/* Sidebar category list — hidden on mobile, desktop-first */}
      <aside className="hidden rounded-xl border border-[#EDEBF3] bg-white p-2 shadow-sm lg:block">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-xs text-gray-500 gap-2">
            <Loader2 className="size-4 animate-spin text-[#6C4CD8]" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-gray-400">
            <Layers className="size-6 text-gray-300 mb-1" />
            No categories
          </div>
        ) : (
          <ul>
            {categories.map((category: any) => (
              <li key={category.id || category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#241F35] transition-colors hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
                >
                  <span className="truncate">{category.name}</span>
                  <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex min-h-[300px] items-center overflow-hidden rounded-2xl bg-[#EDE8FA]"
      >
        <Image
          src="/picture/pic1.jpg"
          alt="Fashion sale promo"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 75vw"
          className="object-cover object-center opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent" />

        <div className="relative max-w-sm space-y-4 p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold leading-tight text-[#1A1330] sm:text-4xl">
            Shopping Today <span className="text-[#6C4CD8]">Fashion sale</span>
          </h1>
          <p className="text-[#5A5470]">
            <span className="font-bold text-[#6C4CD8]">30% off</span> Hurry up!!!
          </p>
          <div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#6C4CD8] px-7 py-3 text-sm font-bold text-white shadow-[0_8px_25px_rgba(108,76,216,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#5B3DC0] hover:shadow-[0_12px_32px_rgba(108,76,216,0.45)]"
            >
              Shop now
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
