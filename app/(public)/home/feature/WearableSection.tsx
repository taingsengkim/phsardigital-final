"use client";

import { Loader2, Shirt } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { useGetListingsByCategoryQuery } from "@/lib/api/homeApi";

type Props = {
  /** category slug to pull from — must match a real category on the API */
  categorySlug?: string;
  title?: string;
};

/**
 * A homepage rail for one category.
 *
 * Until the API gained real filtering this passed a category id that was
 * silently ignored, so the rail showed the whole catalogue. It now filters for
 * real — which means the slug has to match a category that actually exists.
 */
export function WearableSection({
  categorySlug = "wearable",
  title = "Wearable",
}: Props) {
  const { data: response, isLoading } =
    useGetListingsByCategoryQuery(categorySlug);

  const listings =
    response?.data || (response as unknown as { content?: unknown[] })?.content || [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 font-sans">
      <SectionHeader title={title} className="mb-5" />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
          Loading {title.toLowerCase()} items...
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EDEBF3] bg-white p-8 text-center">
          <Shirt className="mb-2 size-10 text-[#6C4CD8]/50" />
          <p className="text-sm font-semibold text-gray-700">
            No {title.toLowerCase()} products yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Products in this category will appear here.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {listings.map((listing: any, index: number) => (
            <div
              key={listing.uuid || listing.id || index}
              className="w-40 shrink-0 sm:w-48"
            >
              <ProductCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
