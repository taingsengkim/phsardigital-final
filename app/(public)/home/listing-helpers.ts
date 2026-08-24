import type { Listing } from "@/lib/types";
import { getListingPrice } from "@/lib/api/listing-price";

export function getPrimaryImage(listing: any): string {
  if (!listing) return "/picture/pic1.jpg";
  if (typeof listing === "string") return listing;

  const primary =
    listing.thumbnailUri?.uri ||
    listing.thumbnail_url ||
    listing.images?.find((img: any) => img.is_primary || img.isPrimary)?.url ||
    listing.images?.find((img: any) => img.is_primary || img.isPrimary)?.uri ||
    listing.images?.[0]?.url ||
    listing.images?.[0]?.uri;

  return primary ?? "/picture/pic1.jpg";
}

export function getAverageRating(listing: any): number {
  if (!listing) return 4.8;
  const reviews = listing.reviews ?? [];
  if (reviews.length === 0) return listing.rating || 4.8;
  const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getActiveDiscountPercent(listing: any): number | null {
  if (!listing) return null;
  if (listing.discountPercent || listing.discount_percent) {
    return listing.discountPercent || listing.discount_percent;
  }
  const now = Date.now();
  const active = listing.discounts?.find(
    (d: any) =>
      new Date(d.starts_at || d.startsAt).getTime() <= now &&
      new Date(d.ends_at || d.endsAt).getTime() >= now
  );
  return active?.discount_percent ?? active?.discountPercent ?? null;
}

export function getDiscountedPrice(listing: any): number {
  if (!listing) return 0;
  // New responses contain a server-calculated discountPrice. Legacy responses
  // contain price plus a discounts collection.
  if (typeof listing.discountPrice === "number") return listing.discountPrice;
  const price = getListingPrice(listing);
  const pct = getActiveDiscountPercent(listing);
  if (!pct) return price;
  return Math.round(price * (1 - pct / 100) * 100) / 100;
}

export function formatPrice(value: number): string {
  return `$${(value || 0).toFixed(2)}`;
}
