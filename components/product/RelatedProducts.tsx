import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getListings } from "@/app/api/listings";
import type { Listing, ListingDiscount } from "@/lib/types";

type Props = {
  /** Category to pull related items from */
  categoryId?: number;
  /** Exclude the current listing so it doesn't appear in the grid */
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
  const activeDiscount = getActiveDiscount(listing.discounts);
  const discountedPrice = activeDiscount
    ? listing.price * (1 - activeDiscount.discount_percent / 100)
    : null;
  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) /
        listing.reviews.length
      : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(33,26,53,0.14)] hover:border-transparent">
      {/* discount badge */}
      {activeDiscount && (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-[5px] bg-[#3d2b87] px-2 py-0.5 text-[11px] font-bold text-white">
          -{activeDiscount.discount_percent}%
        </span>
      )}

      {/* image */}
      <Link
        href={`/products/${listing.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block"
      >
        <div className="aspect-square w-full overflow-hidden bg-[#efe9fb]">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? listing.title}
              width={300}
              height={300}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#3d2b87] opacity-40">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="h-12 w-12"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link
          href={`/products/${listing.slug}`}
          className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground hover:text-[#3d2b87]"
        >
          {listing.title}
        </Link>

        {/* price */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[15px] font-bold text-[#4a7c59]">
            ${(discountedPrice ?? listing.price).toFixed(2)}
          </span>
          {discountedPrice && (
            <s className="text-xs text-muted-foreground">
              ${listing.price.toFixed(2)}
            </s>
          )}
        </div>

        {/* meta: rating + store */}
        <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
          {avgRating !== null ? (
            <span className="text-[#c9822a]">★ {avgRating.toFixed(1)}</span>
          ) : (
            <span />
          )}
        </div>
      </div>
    </article>
  );
}

export default async function RelatedProducts({
  categoryId,
  excludeSlug,
}: Props) {
  let listings: Listing[] = [];

  try {
    const result = await getListings({
      categoryId,
      pageSize: 6,
      sort: "top_rated",
    });
    listings = result.data.filter((l) => l.slug !== excludeSlug).slice(0, 5);
  } catch {
    // If the API is unavailable just render nothing — non-fatal
    return null;
  }

  if (listings.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      {/* section header */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center gap-2.5">
          {/* krama stripe accent */}
          <span
            className="inline-block h-1.5 w-7 rounded-sm"
            style={{
              background:
                "repeating-linear-gradient(90deg,#3d2b87 0 10px,#e8a33d 10px 20px)",
            }}
            aria-hidden="true"
          />
          <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[.16em] text-[#c9822a]">
            You might also need
          </span>
        </div>
        <h2
          id="related-heading"
          className="font-serif text-2xl font-semibold text-[#2a1c63]"
        >
          More from the kitchen aisle
        </h2>
      </div>

      {/* 5-column grid */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {listings.map((listing) => (
          <RelatedProductCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* view more */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-full border border-[#3d2b87] bg-card px-8 py-3 text-[13.5px] font-bold text-[#2a1c63] transition hover:bg-[#3d2b87] hover:text-white"
        >
          View more <ChevronRight size={15} />
        </Link>
      </div>
    </section>
  );
}
