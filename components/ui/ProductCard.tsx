"use client";

import Image from "next/image";
import Link from "next/link";
import { getFileUrl } from "@/lib/utils";
import type { Listing } from "@/lib/types";

interface ProductCardProps {
  listing: Listing;
  /**
   * Resolved separately by the caller (e.g. from useGetCategoriesQuery) and
   * passed in — Listing only carries categoryUuid, not a display name.
   */
  categoryName?: string;
  /**
   * Listing has no rating/discount fields yet, so the closest honest
   * "stands out" signal the backend gives us is `isFeatured`. Shows a
   * small badge when true.
   */
  showFeaturedBadge?: boolean;
}

export function ProductCard({
  listing,
  categoryName,
  showFeaturedBadge = false,
}: ProductCardProps) {
  const imageUrl = getFileUrl(
    listing.thumbnailObjectName ?? listing.images?.[0]?.url
  );

  return (
    <Link
      href={`/products/${listing.uuid || listing.slug || listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
            No image
          </div>
        )}

        {showFeaturedBadge && listing.isFeatured ? (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
            Featured
          </span>
        ) : null}

        {(listing.stockQty ?? listing.stock) === 0 ? (
          <span className="absolute right-2 top-2 rounded-md bg-foreground/80 px-2 py-0.5 text-[11px] font-bold text-background">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        <p className="line-clamp-1 text-[12px] font-medium text-foreground sm:text-[13px]">
          {listing.title}
        </p>

        <span className="text-[13px] font-bold text-primary sm:text-[14px]">
          ${listing.price.toFixed(2)}
        </span>

        {categoryName ? (
          <p className="text-[11px] text-muted-foreground">{categoryName}</p>
        ) : null}
      </div>
    </Link>
  );
}
