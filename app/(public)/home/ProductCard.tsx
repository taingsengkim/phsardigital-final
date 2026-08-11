"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import type { Listing } from "@/lib/types";
import {
  getPrimaryImage,
  getAverageRating,
  getActiveDiscountPercent,
  getDiscountedPrice,
  formatPrice,
} from "./listing-helpers";

type ProductCardProps = {
  listing: Listing;
  sellerName?: string; // e.g. "6Valley" in the mock — pass through once you have real seller data
};

export function ProductCard({ listing, sellerName }: ProductCardProps) {
  const image = getPrimaryImage(listing);
  const rating = getAverageRating(listing);
  const discountPercent = getActiveDiscountPercent(listing);
  const finalPrice = getDiscountedPrice(listing);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card"
    >
      <Link href={`/products/${listing.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={image}
            alt={listing.images?.[0]?.alt_text ?? listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {discountPercent && (
            <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow"
            >
              <Heart size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.preventDefault()}
              aria-label="Quick view"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow"
            >
              <Eye size={15} />
            </motion.button>
          </div>
        </div>

        <div className="space-y-1 p-3">
          <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{formatPrice(finalPrice)}</span>
            {discountPercent && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(listing.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {sellerName && <span>{sellerName}</span>}
            {rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star size={12} className="fill-gold text-gold" />
                {rating}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
