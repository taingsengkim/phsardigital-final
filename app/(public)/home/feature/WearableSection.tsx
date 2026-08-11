"use client";

import { mockWearableListings } from "../listing-mock";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";

/**
 * TODO when your API is ready: swap mockWearableListings for
 * `const { data } = useGetWearableListingsQuery(); const listings = data?.data ?? [];`
 */
export function WearableSection() {
  const listings = mockWearableListings;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader title="Wearable" className="mb-5" />
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {listings.map((listing) => (
          <div key={listing.id} className="w-40 flex-shrink-0 sm:w-48">
            <ProductCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
