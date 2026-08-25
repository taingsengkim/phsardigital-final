"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Store } from "lucide-react";
import { cn, getFileUrl } from "@/lib/utils";
import SavedButton from "@/components/saved/SavedButton";
import { getPrimaryImage } from "@/app/(public)/home/listing-helpers";

export type CardListing = {
  id?: number | string;
  uuid?: string;
  slug?: string;
  title: string;
  price?: number | null;
  fullPrice?: number | null;
  discountPrice?: number | null;
  isFavorite?: boolean | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  sellerProfile?: { businessName?: string | null } | null;
  images?:
    | {
        uuid?: string;
        uri?: string;
        url?: string;
        isPrimary?: boolean;
        is_primary?: boolean;
        sortOrder?: number;
      }[]
    | null;
  thumbnailUri?: { uri?: string; url?: string } | null;
};

type Props = {
  listing: CardListing;
  className?: string;
  isSavedPage?: boolean;
  onRemove?: (uuid: string) => Promise<void>;
  sellerName?: string;
};

export function ProductCard({ listing, className, sellerName, onRemove }: Props) {
  const key = listing.uuid ?? String(listing.id ?? listing.slug ?? "");

  // 1. Image Resolution (prefer thumbnailUri.uri)
  const rawImageUri = listing.thumbnailUri?.uri || listing.thumbnailUri?.url;
  const imgSrc = rawImageUri ? getFileUrl(rawImageUri) : getPrimaryImage(listing);

  // 2. Pricing & Discount calculation
  const fullPrice = listing.fullPrice ?? listing.price ?? null;
  const discountPrice = listing.discountPrice ?? null;
  const hasDiscount =
    discountPrice !== null &&
    fullPrice !== null &&
    discountPrice < fullPrice &&
    fullPrice > 0;

  const discountPercentage =
    hasDiscount && fullPrice && discountPrice
      ? Math.round(((fullPrice - discountPrice) / fullPrice) * 100)
      : 0;

  const activePrice = hasDiscount ? discountPrice! : (fullPrice ?? listing.price ?? 0);

  // 3. Rating & Review calculation with graceful fallbacks
  const rawRating = listing.averageRating;
  const rating = typeof rawRating === "number" && rawRating >= 0 ? rawRating : 0;
  const filledStars = Math.round(rating);
  const reviewCount =
    typeof listing.reviewCount === "number" && listing.reviewCount >= 0
      ? listing.reviewCount
      : 0;

  // 4. Seller business name
  const businessName = listing.sellerProfile?.businessName || sellerName || null;

  const targetUuid = listing.uuid || listing.id || listing.slug || "";
  const productUrl = `/products/${targetUuid}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(36,31,53,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.15)]",
        className
      )}
    >
      {/* ── Top Image Container ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3FA]">
        {/* Discount Badge at top-left */}
        {hasDiscount && discountPercentage > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            -{discountPercentage}%
          </span>
        )}

        {/* Favorite/Wishlist Button at top-right */}
        <SavedButton
          listingId={key}
          initialSaved={Boolean(listing.isFavorite)}
          onToggle={(isSaved) => {
            if (!isSaved && onRemove) {
              onRemove(key);
            }
          }}
          className="absolute right-2.5 top-2.5 z-10 shadow-sm"
        />

        {/* Product Thumbnail */}
        <Link href={productUrl} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={listing.title || "Product image"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={90}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="h-12 w-12"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </Link>
      </div>

      {/* ── Product Content Info ── */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        {/* Title */}
        <Link
          href={productUrl}
          className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug text-[#241F35] transition-colors hover:text-[#6C4CD8]"
        >
          {listing.title}
        </Link>

        {/* Ratings and Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const isFilled = filledStars > 0 && i < filledStars;
              return (
                <Star
                  key={i}
                  size={13}
                  className={cn(
                    isFilled
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              );
            })}
          </div>
          <span className="font-semibold text-gray-700">
            {rating}
          </span>
          <span className="text-gray-400">({reviewCount})</span>
        </div>

        {/* Pricing Section */}
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-[#6C4CD8]">
            ${activePrice.toFixed(2)}
          </span>
          {hasDiscount && fullPrice !== null && (
            <span className="text-xs sm:text-sm font-medium text-gray-400 line-through">
              ${fullPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Seller Information */}
        {businessName && (
          <div className="mt-auto pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
            <Store size={13} className="flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium text-gray-600">
              {businessName}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;


