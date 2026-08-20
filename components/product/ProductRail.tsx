import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageOff, Star } from "lucide-react";
import type { ApiListing, RelatedListing, RelatedReason } from "@/lib/types";

/** Whatever the rail renders, reduced to the fields a card needs. */
type RailItem = {
  uuid: string;
  href: string;
  title: string;
  image: string | null;
  price: number;
  sold: number;
  inStock: boolean;
  categoryName: string | null;
  storeName: string | null;
  rating: number | null;
  reviewCount: number;
  isFeatured: boolean;
  reason: RelatedReason | null;
};

function fromListing(listing: ApiListing): RailItem {
  const image =
    listing.thumbnailUri?.uri ??
    [...(listing.images ?? [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )[0]?.uri ??
    null;

  return {
    uuid: listing.uuid,
    href: `/products/${listing.slug || listing.uuid}`,
    title: listing.title || "Untitled product",
    image,
    price: typeof listing.price === "number" ? listing.price : 0,
    sold: listing.sold ?? 0,
    inStock: (listing.stockQty ?? 0) > 0,
    categoryName: listing.category?.name ?? null,
    storeName: listing.sellerProfile?.businessName ?? null,
    rating:
      typeof listing.averageRating === "number" && listing.averageRating > 0
        ? listing.averageRating
        : null,
    reviewCount: listing.reviewCount ?? 0,
    isFeatured: Boolean(listing.isFeatured),
    reason: null,
  };
}

function fromRelated(related: RelatedListing): RailItem {
  return {
    uuid: related.uuid,
    href: `/products/${related.slug || related.uuid}`,
    title: related.title || "Untitled product",
    // note: RelatedListingResponse returns thumbnailUri as a plain URL string
    image: related.thumbnailUri ?? null,
    price: typeof related.price === "number" ? related.price : 0,
    sold: related.sold ?? 0,
    inStock: (related.stockQty ?? 0) > 0,
    categoryName: related.category?.name ?? null,
    storeName: related.businessName ?? null,
    rating: null,
    reviewCount: 0,
    isFeatured: false,
    reason: related.reason ?? null,
  };
}

const REASON_LABELS: Record<RelatedReason, string> = {
  BOUGHT_TOGETHER: "Often bought together",
  SAME_CATEGORY: "Similar product",
  SAME_SHOP: "From this shop",
};

function ProductRailCard({ item }: { item: RailItem }) {
  const badge = item.isFeatured
    ? "Featured"
    : item.reason
      ? REASON_LABELS[item.reason]
      : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]">
      {badge && (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg bg-[#6C4CD8] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
          {item.isFeatured && <Star size={10} fill="white" />}
          {badge}
        </span>
      )}

      <Link href={item.href} tabIndex={-1} aria-hidden="true">
        <div className="aspect-square w-full overflow-hidden bg-[#F5F3FA]">
          {item.image ? (
            <Image
              src={item.image}
              alt=""
              width={320}
              height={320}
              unoptimized
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <ImageOff size={38} strokeWidth={1.3} />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={item.href}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1A1330] transition-colors hover:text-[#6C4CD8]"
        >
          {item.title}
        </Link>

        {item.rating !== null ? (
          <div className="flex items-center gap-1.5">
            <Star size={13} fill="#F5B301" color="#F5B301" />
            <span className="text-[14px] font-bold text-[#F5B301]">
              {item.rating.toFixed(1)}
            </span>
            {item.reviewCount > 0 && (
              <span className="text-[13px] text-[#8B85A0]">
                ({item.reviewCount})
              </span>
            )}
          </div>
        ) : (
          item.storeName && (
            <p className="line-clamp-1 text-[13px] text-[#8B85A0]">
              {item.storeName}
            </p>
          )
        )}

        <div className="flex flex-wrap items-center gap-x-3 text-[13px] text-[#8B85A0]">
          {item.categoryName && <span>{item.categoryName}</span>}
          {item.sold > 0 && <span>{item.sold} sold</span>}
        </div>

        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
          <span className="text-[18px] font-extrabold text-[#6C4CD8]">
            ${item.price.toFixed(2)}
          </span>
          {!item.inStock && (
            <span className="text-[12px] font-semibold text-red-500">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

type RailProps = {
  id: string;
  eyebrow: string;
  heading: string;
  /** pass either full listings or the lighter related-listing payload */
  listings?: ApiListing[];
  related?: RelatedListing[];
  viewAllHref?: string;
  viewAllLabel?: string;
  limit?: number;
};

/** A titled 4-up grid of products. Renders nothing when there is nothing to show. */
export default function ProductRail({
  id,
  eyebrow,
  heading,
  listings,
  related,
  viewAllHref,
  viewAllLabel = "View all",
  limit = 4,
}: RailProps) {
  const items = (
    related ? related.map(fromRelated) : (listings ?? []).map(fromListing)
  ).slice(0, limit);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby={id} className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-widest text-[#6C4CD8]">
            {eyebrow}
          </p>
          <h2 id={id} className="mt-1 text-[24px] font-extrabold text-[#1A1330]">
            {heading}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-[#E2DFEC] bg-white px-5 py-2.5 text-[15px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA] sm:flex"
          >
            {viewAllLabel} <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ProductRailCard key={item.uuid} item={item} />
        ))}
      </div>

      {viewAllHref && (
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href={viewAllHref}
            className="flex items-center gap-2 rounded-xl border border-[#E2DFEC] bg-white px-6 py-3 text-[15px] font-bold text-[#6C4CD8]"
          >
            {viewAllLabel} <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
