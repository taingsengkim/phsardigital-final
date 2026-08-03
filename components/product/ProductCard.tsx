import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import ProductBadge from "./ProductBadge";
import SavedButton from "@/components/saved/SavedButton";

type Props = {
  listing: Listing;
  className?: string;
};

function averageRating(listing: Listing): number {
  if (!listing.reviews || listing.reviews.length === 0) return 0;
  return (
    listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
    listing.reviews.length
  );
}

export default function ProductCard({ listing, className }: Props) {
  const primaryImage =
    listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  const avg = averageRating(listing);
  const reviewCount = listing.reviews?.length ?? 0;

  // pick the best active discount
  const now = Date.now();
  const activeDiscount = listing.discounts
    ?.filter(
      (d) =>
        new Date(d.starts_at).getTime() <= now &&
        new Date(d.ends_at).getTime() >= now
    )
    .sort((a, b) => b.discount_percent - a.discount_percent)[0];

  const discountedPrice = activeDiscount
    ? listing.price * (1 - activeDiscount.discount_percent / 100)
    : null;

  // store name — replace with listing.store?.name when your ERD is wired up
  const storeName = "Store1Name";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* ── discount badge (top-left) ── */}
      <ProductBadge
        discounts={listing.discounts}
        className="absolute left-2 top-2 z-10"
      />

      {/* ── save button (top-right) ── */}
      <SavedButton
        listingId={listing.id}
        className="absolute right-2 top-2 z-10"
      />

      {/* ── product image ── */}
      <Link
        href={`/products/${listing.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block"
      >
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? listing.title}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* ── card body ── */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {/* title */}
        <Link
          href={`/products/${listing.slug}`}
          className="line-clamp-2 text-xs font-medium leading-snug hover:underline"
        >
          {listing.title}
        </Link>

        {/* price — original on top, discounted below (matches mockup layout) */}
        <div className="mt-0.5 flex flex-col">
          {discountedPrice ? (
            <>
              <span className="text-[11px] text-muted-foreground line-through">
                ${listing.price.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-foreground">
                ${discountedPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-foreground">
              ${listing.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* rating row — shows "( N )" like mockup */}
        <div className="flex items-center gap-1">
          {/* stars */}
          <div className="flex items-center gap-0.5" aria-label={`${avg.toFixed(1)} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i < Math.round(avg)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                )}
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {reviewCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              ( {reviewCount} )
            </span>
          )}
        </div>

        {/* store name */}
        <p className="truncate text-[10px] text-muted-foreground">{storeName}</p>
      </div>
    </article>
  );
}
