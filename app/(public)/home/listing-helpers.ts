import { getFileUrl } from "@/lib/utils";

/**
 * Safely resolves the primary display image for a product/listing item.
 * Supports live API shapes (thumbnailUri, images array), ERD Listing shapes,
 * and mock product fallback objects.
 */
export function getPrimaryImage(item: any): string {
  if (!item) return "/picture/product_dress_blue_floral.jpg";
  if (typeof item === "string") return getFileUrl(item);

  if (typeof item.thumbnailUri === "string" && item.thumbnailUri) {
    return getFileUrl(item.thumbnailUri);
  }
  if (item.thumbnailUri?.uri) {
    return getFileUrl(item.thumbnailUri.uri);
  }
  if (item.thumbnailObjectName) {
    return getFileUrl(item.thumbnailObjectName);
  }

  if (Array.isArray(item.images) && item.images.length > 0) {
    const primary =
      item.images.find((img: any) => img?.isPrimary || img?.is_primary) ??
      item.images[0];
    const url = primary?.uri ?? primary?.url ?? primary?.objectName;
    if (url) return getFileUrl(url);
  }

  if (item.image && typeof item.image === "string") {
    return getFileUrl(item.image);
  }

  return "/picture/product_dress_blue_floral.jpg";
}

export function getEffectivePrice(item: any): number {
  if (!item) return 0;
  const val = item.discountPrice ?? item.price ?? item.fullPrice ?? 0;
  return typeof val === "number" && Number.isFinite(val) ? val : 0;
}

export function getOriginalPrice(item: any): number | null {
  if (!item) return null;
  if (item.discountPrice && (item.fullPrice || item.price)) {
    return item.fullPrice ?? item.price;
  }
  return null;
}
