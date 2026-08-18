"use client";

import { Loader2, Shirt } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { useGetWearableListingsQuery } from "@/lib/api/homeApi";

export function WearableSection() {
  const { data: response, isLoading } = useGetWearableListingsQuery();
  const listings = response?.data || (response as any)?.content || [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 font-sans">
      <SectionHeader title="Wearable" className="mb-5" />

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500 gap-2">
          <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
          Loading wearable items...
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center border border-[#EDEBF3]">
          <Shirt className="size-10 text-[#6C4CD8]/50 mb-2" />
          <p className="text-sm font-semibold text-gray-700">No wearable products found</p>
          <p className="text-xs text-gray-400 mt-1">Wearable items will be listed here.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {listings.map((listing: any, index: number) => (
            <div key={listing.uuid || listing.id || index} className="w-40 flex-shrink-0 sm:w-48">
              <ProductCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
