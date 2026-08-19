"use client";

import { Loader2, Star } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { useGetTopRatedListingsQuery } from "@/lib/api/homeApi";

export function TopRatedSection() {
  const { data: response, isLoading } = useGetTopRatedListingsQuery();
  const listings = response?.data || (response as any)?.content || [];

  return (
    <section className="bg-[#F1EFFA]/60 py-8 font-sans">
      <div className="mx-auto max-w-[1240px] space-y-5 px-6">
        <SectionHeader title="Top Rated Products" />

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500 gap-2">
            <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
            Loading top rated products...
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center border border-[#EDEBF3]">
            <Star className="size-10 text-[#6C4CD8]/50 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No top rated products yet</p>
            <p className="text-xs text-gray-400 mt-1">Products will appear here once reviewed.</p>
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
      </div>
    </section>
  );
}
