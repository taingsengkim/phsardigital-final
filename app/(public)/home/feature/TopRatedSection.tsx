"use client";

import { mockTopRatedListings } from "../listing-mock";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { useGetTopRatedListingsQuery } from "@/lib/api/homeApi";

export function TopRatedSection() {
  const { data: response } = useGetTopRatedListingsQuery();
  const apiListings = response?.data || (response as any)?.content || [];
  const listings = apiListings.length > 0 ? apiListings : mockTopRatedListings;

  return (
    <section className="bg-[#F1EFFA]/60 py-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-5 px-4">
        <SectionHeader title="Top Rated Products" />
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {listings.map((listing: any, index: number) => (
            <div key={listing.uuid || listing.id || index} className="w-40 flex-shrink-0 sm:w-48">
              <ProductCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
