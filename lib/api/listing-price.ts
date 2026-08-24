type ListingPriceFields = {
  price?: number | null
  fullPrice?: number | null
  discountPrice?: number | null
}

/** Resolve both the current API price fields and the legacy frontend field. */
export function getListingPrice(listing?: ListingPriceFields | null): number {
  if (!listing) return 0

  const value = listing.discountPrice ?? listing.price ?? listing.fullPrice
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export function getListingFullPrice(listing?: ListingPriceFields | null): number {
  if (!listing) return 0

  const value = listing.fullPrice ?? listing.price
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export function hasListingDiscount(listing?: ListingPriceFields | null): boolean {
  if (!listing || listing.discountPrice == null) return false
  return getListingPrice(listing) < getListingFullPrice(listing)
}
