"use client";

import { mockTopRatedListings } from "../listing-mock";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";

/**
 * TODO when your API is ready: swap mockTopRatedListings for
 * `const { data } = useGetTopRatedListingsQuery(); const listings = data?.data ?? [];`
 */
export function TopRatedSection() {
  const listings = mockTopRatedListings;

  return (
    <section className="bg-accent/60 py-8">
      <div className="mx-auto max-w-7xl space-y-5 px-4">
        <SectionHeader title="Top Rated Products" />
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {listings.map((listing) => (
            <div key={listing.id} className="w-40 flex-shrink-0 sm:w-48">
              <ProductCard listing={listing} sellerName="Store1Name" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
