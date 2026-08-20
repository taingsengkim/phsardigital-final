"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, Trash2 } from "lucide-react";
import {
  getPrimaryImage,
  getAverageRating,
  getPrices,
  formatPrice,
} from "./listing-helpers";
import { addFavorite, removeFavorites } from "@/app/api/favorites";

type ProductCardProps = {
  listing: any;
  sellerName?: string;
  isSavedPage?: boolean;
  onRemove?: (uuid: string) => void;
};

export function ProductCard({ listing, sellerName, isSavedPage, onRemove }: ProductCardProps) {
  const initialFav = Boolean(
    listing?.isFavorite ?? listing?.is_favorite ?? listing?.isFav ?? false
  );
  const [isSaved, setIsSaved] = useState(initialFav);

  useEffect(() => {
    const fav = listing?.isFavorite ?? listing?.is_favorite ?? listing?.isFav;
    if (typeof fav === "boolean") {
      setIsSaved(fav);
    }
  }, [listing?.isFavorite, listing?.is_favorite, listing?.isFav]);

  const image = getPrimaryImage(listing);
  const rating = getAverageRating(listing);
  const { currentPrice, originalPrice, discountPercent } = getPrices(listing);

  const productSlug = listing.uuid || listing.slug || listing.id || "#";
  const displaySeller =
    sellerName ||
    listing.sellerProfile?.businessName ||
    listing.seller_name ||
    "Phsar Store";

  const ratingVal = typeof rating === "number" && rating > 0 ? Math.round(rating) : 0;
  const reviewCount = listing.reviewCount ?? listing.reviews?.length ?? 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-xs transition-all duration-300 hover:border-[#6C4CD8]/40 hover:shadow-xl"
    >
      <Link href={`/products/${productSlug}`} className="block flex-1 flex flex-col justify-between">
        {/* Top Image Box — Flush to card top/left/right borders */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F8F7FB]">
          <Image
            src={image}
            alt={listing.title || "Product"}
            fill
            unoptimized={Boolean(image?.startsWith("http"))}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
          />

          {/* Discount Badge on Top-Left */}
          {discountPercent && (
            <span className="absolute left-3 top-3 rounded-xl bg-[#6C4CD8] px-3 py-1 text-xs font-extrabold text-white shadow-md">
              -{discountPercent}%
            </span>
          )}

          {/* Top-Right Action: Bin / Trash icon if on saved page, Heart icon otherwise */}
          {isSavedPage ? (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 12 }}
              whileTap={{ scale: 0.85 }}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetUuid = listing.uuid || listing.slug || listing.id;
                if (onRemove && targetUuid) {
                  onRemove(String(targetUuid));
                }
              }}
              aria-label="Remove from favorites"
              title="Remove from saved items"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-md backdrop-blur-xs transition-all hover:bg-rose-500 hover:text-white"
            >
              <Trash2 size={17} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetUuid = listing.uuid || listing.slug || listing.id;
                const nextSaved = !isSaved;
                setIsSaved(nextSaved);
                if (targetUuid) {
                  if (nextSaved) {
                    await addFavorite(String(targetUuid));
                  } else {
                    await removeFavorites([String(targetUuid)]);
                  }
                }
              }}
              aria-label="Save item"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#6C4CD8] shadow-md transition-all hover:bg-[#F1EFFA]"
            >
              <Heart
                size={17}
                className={isSaved ? "fill-[#6C4CD8] text-[#6C4CD8]" : "text-[#6C4CD8]"}
              />
            </motion.button>
          )}
        </div>

        {/* Content Below Image */}
        <div className="flex-1 p-5 flex flex-col justify-between space-y-2.5">
          {/* Product Title */}
          <h3 className="line-clamp-2 text-base font-extrabold text-[#1A1330] leading-snug transition-colors group-hover:text-[#6C4CD8]">
            {listing.title || "Untitled Product"}
          </h3>

          {/* 5-Star Rating Row + (reviewCount) */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={
                    ratingVal > 0 && i < ratingVal
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300 fill-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#8B85A0]">({reviewCount})</span>
          </div>

          {/* Price Row: Current Price + Strikethrough Original Price */}
          <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
            <span className="text-xl sm:text-2xl font-black text-[#6C4CD8]">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm font-semibold text-[#9B94B4] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Seller Business Name */}
          <p className="text-xs sm:text-sm font-semibold text-[#7C7596] truncate">
            {displaySeller}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
