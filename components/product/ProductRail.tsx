import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ApiListing, RelatedListing } from "@/lib/types";
import { ProductCard } from "@/app/(public)/home/ProductCard";

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

/** A titled 4-up grid of products using the primary home ProductCard. Renders nothing when there is nothing to show. */
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
  const items: any[] = (listings ?? related ?? []).slice(0, limit);

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
        {items.map((listing) => (
          <ProductCard
            key={listing.uuid || listing.id || listing.slug}
            listing={listing}
          />
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
