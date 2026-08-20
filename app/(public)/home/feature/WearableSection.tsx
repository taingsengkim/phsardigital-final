"use client";

import { Loader2 } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { SectionHeader } from "../SectionHeader";
import { useGetListingsByCategoryQuery } from "@/lib/api/homeApi";

const FALLBACK_WEARABLE_LISTINGS = [
  {
    uuid: "w-1",
    title: "Women's Floral Summer Dress",
    slug: "womens-floral-summer-dress",
    fullPrice: 45,
    discountPrice: null,
    sellerProfile: { businessName: "Fashion By Srey" },
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    thumbnailUri: { uri: "/picture/pic3.jpg" },
    averageRating: null,
    reviewCount: 0,
    isFavorite: false,
  },
  {
    uuid: "w-2",
    title: "Floral Midi Wrap Dress",
    slug: "floral-midi-wrap-dress",
    fullPrice: 168,
    discountPrice: null,
    sellerProfile: { businessName: "SOMA Coffee & Roastery" },
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    thumbnailUri: { uri: "/picture/pic4.jpg" },
    averageRating: null,
    reviewCount: 0,
    isFavorite: true,
  },
  {
    uuid: "w-3",
    title: "Rose Gold Square Watch & Bracelet Set",
    slug: "rose-gold-square-watch-bracelet-set",
    fullPrice: 129,
    discountPrice: null,
    sellerProfile: { businessName: "Jewel & Co." },
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    thumbnailUri: { uri: "/picture/pic5.jpg" },
    averageRating: null,
    reviewCount: 0,
    isFavorite: false,
  },
  {
    uuid: "w-4",
    title: "Men's Classic White Sneakers",
    slug: "mens-classic-white-sneakers",
    fullPrice: 79,
    discountPrice: null,
    sellerProfile: { businessName: "Sneaker World" },
    category: { name: "Men's Fashion", slug: "mens-fashion" },
    thumbnailUri: { uri: "/picture/pic6.jpg" },
    averageRating: null,
    reviewCount: 0,
    isFavorite: false,
  },
  {
    uuid: "w-5",
    title: "Premium Leather Tote Bag",
    slug: "premium-leather-tote-bag",
    fullPrice: 89,
    discountPrice: null,
    sellerProfile: { businessName: "Leather Craft Co." },
    category: { name: "Women's Fashion", slug: "womens-fashion" },
    thumbnailUri: { uri: "/picture/pic2.jpg" },
    averageRating: null,
    reviewCount: 0,
    isFavorite: false,
  },
];

type Props = {
  categorySlug?: string;
  title?: string;
};

export function WearableSection({
  categorySlug = "womens-fashion",
  title = "Wearable",
}: Props) {
  const { data: womensResponse, isLoading: loadingWomens } =
    useGetListingsByCategoryQuery(categorySlug);

  const { data: mensResponse, isLoading: loadingMens } =
    useGetListingsByCategoryQuery("mens-fashion");

  const womensListings =
    womensResponse?.data || (womensResponse as unknown as { content?: unknown[] })?.content || [];

  const mensListings =
    mensResponse?.data || (mensResponse as unknown as { content?: unknown[] })?.content || [];

  const combinedApiListings = [...womensListings, ...mensListings];
  const listings = combinedApiListings.length > 0 ? combinedApiListings : FALLBACK_WEARABLE_LISTINGS;
  const isLoading = loadingWomens && loadingMens;

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-8 font-sans">
      <SectionHeader title={title} href="/products?category=womens-fashion" className="mb-5" />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="size-5 animate-spin text-[#6C4CD8]" />
          Loading {title.toLowerCase()} items...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {listings.map((listing: any, index: number) => (
            <ProductCard
              key={listing.uuid || listing.id || index}
              listing={listing}
            />
          ))}
        </div>
      )}
    </section>
  );
}
