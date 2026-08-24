"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CheckCircle2, ArrowRight, Store } from "lucide-react";

export function SellerProfileCard({ seller }: { seller: any }) {
  const sellerName =
    seller.businessName || seller.storeDisplayName || seller.name || "Phsar Seller";

  const sellerSlug =
    seller.slug || seller.sellerId || seller.id || seller.uuid || "storee-corner";

  const logoImage =
    seller.logoUri || seller.logoUrl || seller.avatar_url || seller.avatarUrl || "/picture/pic1.jpg";

  const coverImage =
    seller.coverUrl || seller.coverUri || seller.bannerImage || "/picture/seller_cover_electronics.jpg";

  const rating = seller.averageRating ?? seller.rating ?? 4.9;
  const reviewCount = seller.review_count ?? seller.reviewCount ?? 120;
  const productCount = seller.product_count ?? seller.productCount ?? 45;
  const verified = seller.verified !== false;

  return (
    <Link href={`/stores/${sellerSlug}`} className="group block h-full select-none">
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(108,76,216,0.14)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-[#EDEBF3] dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:border-[#6C4CD8]/50"
      >
        <div>
          {/* Top Banner / Cover Image */}
          <div className="relative h-[135px] sm:h-[145px] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
            <Image
              src={coverImage}
              alt={`${sellerName} cover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              unoptimized={Boolean(coverImage?.startsWith("http"))}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Overlapping Store Avatar */}
          <div className="px-4 sm:px-5">
            <div className="relative -mt-8 size-15 sm:size-16 shrink-0 rounded-full border-[3px] border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-md overflow-hidden flex items-center justify-center">
              {logoImage ? (
                <Image
                  src={logoImage}
                  alt={sellerName}
                  width={64}
                  height={64}
                  unoptimized={Boolean(logoImage?.startsWith("http"))}
                  className="size-full object-cover"
                />
              ) : (
                <Store className="size-6 text-[#6C4CD8]" />
              )}
            </div>
          </div>

          {/* Store Info */}
          <div className="px-4 sm:px-5 pt-2.5 space-y-1.5">
            {/* Title & Verified Badge Row */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-[17px] font-bold text-[#111827] dark:text-white truncate group-hover:text-[#6C4CD8] transition-colors">
                {sellerName}
              </h3>

              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECE8FB] dark:bg-[#6C4CD8]/20 px-2 py-0.5 text-[10px] font-bold text-[#6C4CD8] dark:text-[#A78BFA] shrink-0 tracking-wide uppercase">
                  <CheckCircle2 className="size-3 fill-[#6C4CD8] text-white dark:text-zinc-900" />
                  VERIFIED
                </span>
              )}
            </div>

            {/* Tagline / Bio */}
            <p className="text-xs text-[#6B7280] dark:text-zinc-400 line-clamp-2 leading-relaxed min-h-[36px]">
              {seller.tagline || seller.bio || "Official verified store on Phsar Digital."}
            </p>
          </div>
        </div>

        {/* Footer Stats & Button */}
        <div className="px-4 sm:px-5 pb-4 pt-3 space-y-3">
          {/* Rating & Product Count Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-bold text-[#111827] dark:text-white">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="font-normal text-[#9CA3AF] dark:text-zinc-400">({reviewCount})</span>
            </div>

            <span className="font-bold text-[#6C4CD8] dark:text-[#A78BFA]">
              {productCount} Products
            </span>
          </div>

          {/* Visit Store Button */}
          <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F2F0FC] dark:bg-[#6C4CD8]/15 hover:bg-[#E8E4FA] dark:hover:bg-[#6C4CD8]/25 text-[#6C4CD8] dark:text-[#A78BFA] py-2.5 text-xs sm:text-sm font-semibold transition-colors">
            <span>Visit Store</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
