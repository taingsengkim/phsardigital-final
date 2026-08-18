"use client";

import { mockWearableListings } from "../listing-mock";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { useGetWearableListingsQuery } from "@/lib/api/homeApi";

export function WearableSection() {
  const { data: response } = useGetWearableListingsQuery();
  const apiListings = response?.data || (response as any)?.content || [];
  const listings = apiListings.length > 0 ? apiListings : mockWearableListings;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 font-sans">
      <SectionHeader title="Wearable" className="mb-5" />
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {listings.map((listing: any, index: number) => (
          <div key={listing.uuid || listing.id || index} className="w-40 flex-shrink-0 sm:w-48">
            <ProductCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
