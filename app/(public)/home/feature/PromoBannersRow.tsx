"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Tag } from "lucide-react";

export function PromoBannersRow() {
  return (
    <section className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 py-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Banner 1: Fashion & Dresses Promo */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative min-h-[220px] sm:min-h-[250px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#EDE8F5] to-[#E3DCF2] dark:from-zinc-900 dark:to-zinc-800 border border-purple-100 dark:border-zinc-800 p-6 sm:p-8 flex flex-col justify-between shadow-xs"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-90">
            <Image
              src="/picture/product_dress_beige_slit.jpg"
              alt="Fashion Promo"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#EDE8F5] dark:from-zinc-900 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-2 max-w-[240px] sm:max-w-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CD8]/15 text-[#6C4CD8] dark:text-[#A78BFA] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
              <Tag className="size-3" />
              <span>UP TO 40% OFF</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white leading-tight">
              Boutique Floral Dresses
            </h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400">
              Graceful silhouette designs crafted with breathable fabrics.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <Link
              href="/products?category=womens-fashion"
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-5 py-2.5 text-xs font-bold transition-all hover:bg-[#6C4CD8] dark:hover:bg-zinc-100 hover:gap-3"
            >
              <span>Shop Dresses</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Banner 2: Botanical Skincare Promo */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative min-h-[220px] sm:min-h-[250px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#E3EDF6] to-[#D5E4F2] dark:from-zinc-900 dark:to-zinc-800 border border-sky-100 dark:border-zinc-800 p-6 sm:p-8 flex flex-col justify-between shadow-xs"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-90">
            <Image
              src="/picture/hero_slide_super_sale.jpg"
              alt="Skincare Promo"
              fill
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E3EDF6] dark:from-zinc-900 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 space-y-2 max-w-[240px] sm:max-w-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-600/15 text-sky-700 dark:text-sky-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="size-3" />
              <span>ORGANIC FORMULA</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white leading-tight">
              Natural Glow Skincare
            </h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400">
              Clean botanical extracts designed for all skin types.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <Link
              href="/products?category=health-beauty"
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-5 py-2.5 text-xs font-bold transition-all hover:bg-[#6C4CD8] dark:hover:bg-zinc-100 hover:gap-3"
            >
              <span>Explore Beauty</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
