"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import {
  getPrimaryImage,
  getAverageRating,
  getActiveDiscountPercent,
  getDiscountedPrice,
  formatPrice,
} from "./listing-helpers";

type ProductCardProps = {
  listing: any;
  sellerName?: string;
};

export function ProductCard({ listing, sellerName }: ProductCardProps) {
  const image = getPrimaryImage(listing);
  const rating = getAverageRating(listing);
  const discountPercent = getActiveDiscountPercent(listing);
  const finalPrice = getDiscountedPrice(listing);

  const productSlug = listing.uuid || listing.slug || listing.id || "#";
  const displaySeller =
    sellerName ||
    listing.sellerProfile?.businessName ||
    listing.seller_name ||
    "Phsar Store";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border border-[#EDEBF3] bg-white shadow-sm"
    >
      <Link href={`/products/${productSlug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3FA]">
          <Image
            src={image}
            alt={listing.title || "Product"}
            fill
            unoptimized={Boolean(image?.startsWith("http"))}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {discountPercent && (
            <span className="absolute left-2 top-2 rounded-md bg-[#6C4CD8] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}

          {/* Hover-only quick actions */}
          <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.preventDefault()}
              aria-label="Save"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#241F35] shadow hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
            >
              <Heart size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.preventDefault()}
              aria-label="Quick view"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#241F35] shadow hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
            >
              <Eye size={15} />
            </motion.button>
          </div>
        </div>

        <div className="space-y-1 p-3">
          <p className="truncate text-sm font-semibold text-[#241F35]">
            {listing.title || "Untitled Product"}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#6C4CD8]">
              {formatPrice(finalPrice)}
            </span>
            {discountPercent && (
              <span className="text-xs text-[#8B85A0] line-through">
                {formatPrice(listing.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#8B85A0]">
            <span className="truncate max-w-[110px]">{displaySeller}</span>
            {rating > 0 && (
              <span className="flex items-center gap-0.5 shrink-0">
                <Star size={12} className="fill-[#F5B301] text-[#F5B301]" />
                {rating}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
