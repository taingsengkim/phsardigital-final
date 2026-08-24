"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, Trash2 } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import {
  getPrimaryImage,
  getAverageRating,
  getPrices,
  formatPrice,
} from "./listing-helpers";
<<<<<<< HEAD
import { addFavorite, removeFavorites } from "@/app/api/favorites";
=======
import { getListingFullPrice, hasListingDiscount } from "@/lib/api/listing-price";
>>>>>>> cadf4b509bb9305c934c3caaa3a9ed5f63eaa2eb

type ProductCardProps = {
  listing: any;
  sellerName?: string;
  isSavedPage?: boolean;
  onRemove?: (uuid: string) => void;
};

export function ProductCard({ listing, sellerName, isSavedPage, onRemove }: ProductCardProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

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
<<<<<<< HEAD
  const { currentPrice, originalPrice, discountPercent } = getPrices(listing);
=======
  const discountPercent = getActiveDiscountPercent(listing);
  const finalPrice = getDiscountedPrice(listing);
  const fullPrice = getListingFullPrice(listing);
  const hasApiDiscount = hasListingDiscount(listing);
>>>>>>> cadf4b509bb9305c934c3caaa3a9ed5f63eaa2eb

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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#EDEBF3] bg-white shadow-xs transition-all duration-300 hover:border-[#6C4CD8]/40 hover:shadow-xl"
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

          {/* Discount Badge on Top-Left (Picture 1 style) */}
          {discountPercent && (
            <span className="absolute left-3 top-3 z-10 rounded-md bg-[#6C4CD8] px-2.5 py-1 text-xs font-black text-white shadow-xs">
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
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-500 shadow-md backdrop-blur-xs transition-all hover:bg-rose-500 hover:text-white"
            >
              <Trash2 size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoggedIn) {
                  await authClient.signIn.oauth2({
                    providerId: "keycloak",
                    callbackURL: typeof window !== "undefined" ? window.location.href : "/",
                  });
                  return;
                }
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
              className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-xs transition-all ${
                isSaved ? "bg-[#6C4CD8]" : "bg-white/90 hover:bg-[#F1EFFA]"
              }`}
            >
              <Heart
                size={15}
                color={isSaved ? "#fff" : "#6C4CD8"}
                fill={isSaved ? "#fff" : "none"}
              />
            </motion.button>
          )}
        </div>

        {/* Content Below Image (Picture 1 style: Title -> Price -> Rating -> Seller) */}
        <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-2 font-sans">
          {/* 1. Product Title (Font size 16/17px) */}
          <h3 className="line-clamp-2 text-[16px] sm:text-[17px] font-bold text-[#111827] dark:text-white leading-snug transition-colors group-hover:text-[#6C4CD8]">
            {listing.title || "Untitled Product"}
          </h3>

          {/* 2. Price Row: Strikethrough Original Price + Current Purple Price */}
          <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
            {originalPrice && (
              <span className="text-xs sm:text-[13px] font-semibold text-[#9B94B4] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-[16px] sm:text-[17px] font-black text-[#6C4CD8] dark:text-[#A78BFA]">
              {formatPrice(currentPrice)}
            </span>
<<<<<<< HEAD
=======
            {(discountPercent || hasApiDiscount) && (
              <span className="text-xs text-[#8B85A0] line-through">
                {formatPrice(fullPrice)}
              </span>
            )}
>>>>>>> cadf4b509bb9305c934c3caaa3a9ed5f63eaa2eb
          </div>

          {/* 3. 5-Star Rating Row + (reviewCount) */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={
                    i < ratingVal
                      ? "fill-[#F5B301] text-[#F5B301]"
                      : "fill-[#E5E2EC] text-[#E5E2EC]"
                  }
                />
              ))}
            </div>
            <span className="ml-1 text-[12px] font-medium text-[#8B85A0]">({reviewCount})</span>
          </div>

          {/* 4. Seller Business Name */}
          <p className="text-[12px] font-medium text-[#7C7596] truncate">
            {displaySeller}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
