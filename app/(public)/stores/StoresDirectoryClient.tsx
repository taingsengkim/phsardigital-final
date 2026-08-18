"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CheckCircle2, Search, ArrowRight, Store, MapPin } from "lucide-react";
import { MOCK_STORES } from "./mockStores";

export default function StoresDirectoryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const storesList = Object.values(MOCK_STORES);

  const filteredStores = storesList.filter((store) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      store.name.toLowerCase().includes(q) ||
      store.tagline.toLowerCase().includes(q) ||
      store.categories.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-[#EDEBF3] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#1A1330] sm:text-4xl">Official Stores</h1>
            <span className="rounded-full bg-[#6C4CD8] px-4 py-1.5 text-sm font-extrabold text-white shadow-sm">
              {storesList.length} Verified Stores
            </span>
          </div>
          <p className="mt-2 text-base sm:text-lg font-medium text-[#7C7596]">
            Discover official brand shops and top Cambodian sellers on Phsar Digital.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores or brands..."
            className="w-full rounded-full border border-[#E2DFEC] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#1A1330] outline-none shadow-xs transition-all focus:border-[#6C4CD8] focus:ring-2 focus:ring-[#6C4CD8]/20"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C4CD8]" />
        </div>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStores.map((store) => (
          <motion.div
            key={store.id}
            whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(108, 76, 216, 0.22)" }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-sm transition-all hover:border-[#6C4CD8]/40"
          >
            {/* Cover image header */}
            <div className="relative h-36 w-full overflow-hidden bg-[#1A1330]">
              <Image
                src={store.coverUrl}
                alt={store.name}
                fill
                className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1330]/90 via-[#1A1330]/20 to-transparent" />

              {/* Avatar logo */}
              <div className="absolute left-4 bottom-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md">
                <Image src={store.avatarUrl} alt={store.name} width={56} height={56} className="object-cover" />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-extrabold text-[#1A1330] line-clamp-1">{store.name}</h3>
                  {store.verified && (
                    <CheckCircle2 size={16} className="fill-[#6C4CD8] text-white shrink-0" />
                  )}
                </div>
                <p className="line-clamp-2 text-xs font-semibold text-[#7C7596]">{store.tagline}</p>
              </div>

              {/* Stats & Link */}
              <div className="space-y-3 pt-3 border-t border-[#EDEBF3]/70">
                <div className="flex items-center justify-between text-xs font-bold text-[#1A1330]">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                    <span className="text-[11px] font-medium text-[#7C7596]">({store.reviewCount})</span>
                  </div>
                  <span className="text-[#6C4CD8]">{store.productCount} Products</span>
                </div>

                <Link
                  href={`/stores/${store.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6C4CD8] py-2.5 px-4 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#5B3EC4]"
                >
                  Visit Store
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
