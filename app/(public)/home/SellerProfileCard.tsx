"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, CheckCircle2, ArrowRight, Store } from "lucide-react";

export function SellerProfileCard({ seller }: { seller: any }) {
  const sellerName =
    seller.businessName || seller.storeDisplayName || seller.name || "Phsar Seller";

  const sellerSlug = seller.slug || seller.sellerId || seller.id || seller.uuid || "storee-corner";

  const logoImage =
    seller.logoUri || seller.logoUrl || seller.avatar_url || seller.avatarUrl || "/picture/pic1.jpg";

  const rating = seller.averageRating ?? seller.rating ?? 4.9;
  const reviewCount = seller.review_count ?? seller.reviewCount ?? 120;
  const productCount = seller.product_count ?? seller.productCount ?? 45;
  const verified = seller.verified !== false;

  return (
    <Link href={`/stores/${sellerSlug}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 18px 36px -12px rgba(108,76,216,0.18)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#EDEBF3] bg-white p-4 font-sans shadow-xs transition-all hover:border-[#6C4CD8]"
      >
        <div>
          {/* Card Header: Store Logo Avatar & Verified Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#EDEBF3] bg-[#F6F5FA] shadow-xs">
              {logoImage ? (
                <Image
                  src={logoImage}
                  alt={sellerName}
                  width={56}
                  height={56}
                  unoptimized={Boolean(logoImage?.startsWith("http"))}
                  className="object-cover h-full w-full"
                />
              ) : (
                <Store size={24} className="text-[#6C4CD8]" />
              )}
            </div>

            {verified && (
              <span className="flex items-center gap-1 rounded-full bg-[#F1EFFA] px-2.5 py-1 text-[11px] font-extrabold text-[#6C4CD8]">
                <CheckCircle2 size={13} className="fill-[#6C4CD8] text-white" />
                Verified
              </span>
            )}
          </div>

          {/* Store Title & Description */}
          <div className="mt-3.5 space-y-1 min-h-[52px]">
            <h3 className="text-[15.5px] font-extrabold text-[#1A1330] line-clamp-1 group-hover:text-[#6C4CD8] transition-colors">
              {sellerName}
            </h3>
            {seller.tagline ? (
              <p className="line-clamp-2 text-[12px] font-medium text-[#8B85A0] leading-snug">
                {seller.tagline}
              </p>
            ) : (
              <p className="text-[12px] font-medium text-[#8B85A0]">Official Seller Store</p>
            )}
          </div>
        </div>

        <div>
          {/* Rating & Product Count Footer */}
          <div className="mt-4 pt-3 border-t border-[#F0EDFB] flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-bold text-[#1A1330]">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-[11px] font-normal text-[#8B85A0]">({reviewCount})</span>
            </div>

            <span className="rounded-full bg-[#F6F5FA] px-2.5 py-0.5 text-[11px] font-extrabold text-[#6C4CD8]">
              {productCount} Products
            </span>
          </div>

          {/* Visit Store Button */}
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#F6F5FA] py-2 text-xs font-extrabold text-[#6C4CD8] transition-all group-hover:bg-[#6C4CD8] group-hover:text-white shadow-xs">
            <span>Visit Store</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
