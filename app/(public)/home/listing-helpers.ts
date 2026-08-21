import { getFileUrl } from "@/lib/api/utils";

export function getPrimaryImage(listing: any): string {
  if (!listing) return "/picture/pic1.jpg";
  if (typeof listing === "string") return listing;

  const rawUri =
    listing.thumbnailUri?.uri ||
    (typeof listing.thumbnailUri === "string" ? listing.thumbnailUri : null) ||
    (listing.thumbnailUri?.objectName ? getFileUrl(listing.thumbnailUri.objectName) : null) ||
    listing.thumbnail_url ||
    listing.images?.find((img: any) => img.is_primary || img.isPrimary)?.url ||
    listing.images?.find((img: any) => img.is_primary || img.isPrimary)?.uri ||
    listing.images?.[0]?.url ||
    listing.images?.[0]?.uri ||
    listing.image;

  if (rawUri && typeof rawUri === "string" && rawUri.length > 5) {
    return rawUri;
  }

  return "/picture/pic1.jpg";
}

export function getAverageRating(listing: any): number | null {
  if (!listing) return null;
  if (typeof listing.averageRating === "number") return listing.averageRating;
  if (typeof listing.rating === "number") return listing.rating;
  return null;
}

export function getPrices(listing: any) {
  if (!listing) return { currentPrice: 0, originalPrice: null, discountPercent: null };

  const rawFull = typeof listing.fullPrice === "number" ? listing.fullPrice : (typeof listing.price === "number" ? listing.price : null);
  const rawDiscount = typeof listing.discountPrice === "number" ? listing.discountPrice : null;

  // Purple main price: discountPrice if present, otherwise 0 if discountPrice is null, or listing.price
  const currentPrice = rawDiscount !== null ? rawDiscount : (listing.discountPrice === null && typeof listing.fullPrice === "number" ? 0 : (listing.price ?? 0));

  // Gray strikethrough price: fullPrice if present and greater than currentPrice
  const originalPrice = rawFull !== null && rawFull > currentPrice ? rawFull : null;

  // Calculate discount percentage ONLY if discountPrice was explicitly provided and is less than fullPrice
  let discountPercent: number | null = null;
  if (rawDiscount !== null && rawFull !== null && rawFull > rawDiscount && rawFull > 0) {
    discountPercent = Math.round(((rawFull - rawDiscount) / rawFull) * 100);
  } else if (listing.discountPercent || listing.discount_percent) {
    discountPercent = listing.discountPercent || listing.discount_percent;
  }

  return {
    currentPrice,
    originalPrice,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : null,
  };
}

export function formatPrice(value: number): string {
  return `$${(value || 0).toFixed(2)}`;
}
