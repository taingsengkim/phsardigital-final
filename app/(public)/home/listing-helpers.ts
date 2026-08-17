import type { Listing } from "@/lib/types";

export function getPrimaryImage(listing: Listing): string {
  const primary = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  return primary?.url ?? "/picture/pic1.jpg";
}

export function getAverageRating(listing: Listing): number {
  const reviews = listing.reviews ?? [];
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getActiveDiscountPercent(listing: Listing): number | null {
  const now = Date.now();
  const active = listing.discounts?.find(
    (d) => new Date(d.starts_at).getTime() <= now && new Date(d.ends_at).getTime() >= now
  );
  return active?.discount_percent ?? null;
}

export function getDiscountedPrice(listing: Listing): number {
  const pct = getActiveDiscountPercent(listing);
  if (!pct) return listing.price;
  return Math.round(listing.price * (1 - pct / 100) * 100) / 100;
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
