"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import SavedButton from "@/components/saved/SavedButton";

/* Minimal shape — works with both real API (uuid/uri) and mock data */
type CardListing = {
  id?: number;
  uuid?: string;
  slug: string;
  title: string;
  price: number;
  images?: { uuid?: string; uri?: string; url?: string; isPrimary?: boolean; is_primary?: boolean; sortOrder?: number }[];
  thumbnailUri?: { uri?: string };
};

type Props = {
  listing: CardListing;
  className?: string;
};

export default function ProductCard({ listing, className }: Props) {
  /* Support both real API (uuid/uri/isPrimary) and legacy (id/url/is_primary) */
  const primary =
    listing.images?.find((img) => img.isPrimary || img.is_primary) ??
    listing.images?.[0];
  const imgSrc =
    primary?.uri ?? primary?.url ?? listing.thumbnailUri?.uri;

  const key = listing.uuid ?? String(listing.id ?? listing.slug);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]",
        className
      )}
    >
      {/* ── image ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3FA]">
        <Link href={`/products/${listing.slug}`} tabIndex={-1} aria-hidden="true">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={listing.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              unoptimized={imgSrc.startsWith("http://51.79")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-12 w-12">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </Link>

        {/* save button */}
        <SavedButton
          listingId={key}
          className="absolute right-2 top-2 z-10"
        />
      </div>

      {/* ── info ── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          href={`/products/${listing.slug}`}
          className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#241F35] hover:text-[#6C4CD8] transition-colors"
        >
          {listing.title}
        </Link>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill="#F5B301" color="#F5B301" />
          ))}
        </div>

        <span className="text-[17px] font-extrabold text-[#6C4CD8]">
          ${listing.price.toFixed(2)}
        </span>
      </div>
    </article>
  );
}
