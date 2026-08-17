"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { mockCategories } from "../categories-mock";

/**
 * TODO when your API is ready: replace `mockCategories` with
 * `const { data: categories = [] } = useGetCategoriesQuery();`
 * from "@/lib/api/homeApi" — everything else stays the same since both
 * are typed as Category[].
 */
export function HeroBanner() {
  const categories = mockCategories;

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar category list — hidden on mobile, desktop-first */}
      <aside className="hidden rounded-xl border border-[#EDEBF3] bg-white p-2 shadow-sm lg:block">
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#241F35] transition-colors hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
              >
                {category.name}
                <ChevronRight size={14} className="text-[#8B85A0]" />
              </Link>
            </li>
          ))}
        </ul>
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
