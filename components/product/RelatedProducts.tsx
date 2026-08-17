import Link from "next/link";
import Image from "next/image";
import { ChevronsUpDown, Star } from "lucide-react";
import { getListings } from "@/app/api/listings";
import type { Listing, ListingDiscount } from "@/lib/types";

type Props = {
  categoryId?: number;
  excludeSlug?: string;
};

function getActiveDiscount(discounts?: ListingDiscount[]) {
  if (!discounts || discounts.length === 0) return null;
  const now = Date.now();
  return (
    discounts
      .filter(
        (d) =>
          new Date(d.starts_at).getTime() <= now &&
          new Date(d.ends_at).getTime() >= now
      )
      .sort((a, b) => b.discount_percent - a.discount_percent)[0] ?? null
  );
}

async function RelatedProductCard({ listing }: { listing: Listing }) {
  const primaryImage =
    listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  const activeDiscount  = getActiveDiscount(listing.discounts);
  const discountedPrice = activeDiscount
    ? listing.price * (1 - activeDiscount.discount_percent / 100)
    : null;
  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length
      : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]">

      {/* discount badge */}
      {activeDiscount && (
        <span className="absolute left-3 top-3 z-10 rounded-lg bg-[#6C4CD8] px-2.5 py-1 text-[13px] font-bold text-white shadow-sm">
          -{activeDiscount.discount_percent}%
        </span>
      )}

      {/* image */}
      <Link href={`/products/${listing.slug}`} tabIndex={-1} aria-hidden="true">
        <div className="aspect-square w-full overflow-hidden bg-[#F5F3FA]">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? listing.title}
              width={320}
              height={320}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-14 w-14" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${listing.slug}`}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1A1330] hover:text-[#6C4CD8] transition-colors"
        >
          {listing.title}
        </Link>

        {/* rating */}
        {avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <Star size={13} fill="#F5B301" color="#F5B301" />
            <span className="text-[14px] font-semibold text-[#F5B301]">{avgRating.toFixed(1)}</span>
            {listing.reviews && (
              <span className="text-[13px] text-[#8B85A0]">({listing.reviews.length})</span>
            )}
          </div>
        )}

        {/* price */}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-[18px] font-extrabold text-[#6C4CD8]">
            ${(discountedPrice ?? listing.price).toFixed(2)}
          </span>
          {discountedPrice && (
            <span className="text-[13px] text-[#B3ADC4] line-through">
              ${listing.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function RelatedProducts({ categoryId, excludeSlug }: Props) {
  let listings: Listing[] = [];

  try {
    const result = await getListings({ categoryId, pageSize: 5, sort: "top_rated" });
    listings = result.data.filter((l) => l.slug !== excludeSlug).slice(0, 4);
  } catch {
    return null;
  }

  if (listings.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">

      {/* section header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-widest text-[#6C4CD8]">
            You might also like
          </p>
          <h2 id="related-heading" className="mt-1 text-[24px] font-extrabold text-[#1A1330]">
            Related Products
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden items-center gap-1.5 rounded-xl border border-[#E2DFEC] bg-white px-5 py-2.5 text-[15px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA] sm:flex"
        >
          View all <ChevronsUpDown size={16} />
        </Link>
      </div>

      {/* 4-column grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <RelatedProductCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* mobile view-all */}
      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-xl border border-[#E2DFEC] bg-white px-6 py-3 text-[15px] font-bold text-[#6C4CD8]"
        >
          View all <ChevronsUpDown size={16} />
        </Link>
      </div>
    </section>
  );
}
