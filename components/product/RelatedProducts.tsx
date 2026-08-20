import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
import { getListings } from "@/app/api/listings";
import type { Listing } from "@/lib/types";

type Props = {
  categorySlug?: string;
  excludeUuid?: string;
};

function ProductCard({ listing }: { listing: Listing }) {
  const primary =
    listing.images?.find((img) => img.is_primary) ??
    listing.images?.[0];
  const imgSrc = primary?.url;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]">

      {/* image */}
      <Link href={`/products/${listing.slug}`} tabIndex={-1} aria-hidden="true">
        <div className="aspect-square w-full overflow-hidden bg-[#F5F3FA]">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={listing.title}
              width={320}
              height={320}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-14 w-14">
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
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1A1330] transition-colors hover:text-[#6C4CD8]"
        >
          {listing.title}
        </Link>

        {/* sold count as proxy for popularity */}
        {typeof listing.stock === "number" && listing.stock > 0 && (
          <div className="flex items-center gap-1.5">
            <Star size={12} fill="#F5B301" className="text-[#F5B301]" />
            <span className="text-[13px] text-[#8B85A0]">In stock</span>
          </div>
        )}

        {/* price */}
        <div className="mt-auto pt-1">
          <span className="text-[18px] font-extrabold text-[#6C4CD8]">
            ${listing.price.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function RelatedProducts({ categorySlug, excludeUuid }: Props) {
  let listings: Listing[] = [];

  try {
    const result = await getListings({ pageSize: 8 });
    listings = result.data
      .filter((l) => l.uuid !== excludeUuid)
      .slice(0, 4);
  } catch {
    return null;
  }

  if (listings.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">

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
          href={categorySlug ? `/category/${categorySlug}` : "/products"}
          className="hidden items-center gap-1.5 rounded-xl border border-[#E2DFEC] bg-white px-5 py-2.5 text-[15px] font-bold text-[#6C4CD8] transition hover:bg-[#F1EFFA] sm:flex"
        >
          View all <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {listings.map((l) => (
          <ProductCard key={l.uuid} listing={l} />
        ))}
      </div>

      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-xl border border-[#E2DFEC] bg-white px-6 py-3 text-[15px] font-bold text-[#6C4CD8]"
        >
          View all <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}