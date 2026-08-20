import { cache } from "react";
import type { ApiListing, ApiReview, ProductDetail, ReviewSummary } from "@/lib/types";
import {
  apiGet,
  getListingReviews,
  getRelatedListings,
  getSellerListings,
  getSellerProfile,
} from "@/app/api/sellers";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a listing from a URL segment. The API exposes a dedicated slug
 * endpoint, so both a UUID and a pretty slug cost exactly one request.
 */
export const getListing = cache(async function getListing(
  identifier: string
): Promise<ApiListing | null> {
  if (!identifier) return null;

  const path = UUID_RE.test(identifier)
    ? `/api/v1/listings/${identifier}`
    : `/api/v1/listings/slug/${encodeURIComponent(identifier)}`;

  const { data } = await apiGet<ApiListing>(path, { revalidate: 30 });
  return data?.uuid ? data : null;
});

/**
 * Rating breakdown for the review histogram.
 *
 * The listing carries server-computed `averageRating` / `reviewCount` covering
 * every review, while `reviews` is only the first page — so the totals come
 * from the listing and the per-star bars from whatever page we have.
 */
export function summariseReviews(
  reviews: ApiReview[],
  listing?: ApiListing
): ReviewSummary {
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let counted = 0;

  for (const review of reviews) {
    const rating = Number(review.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    breakdown[Math.round(rating)] += 1;
    sum += rating;
    counted += 1;
  }

  const serverAverage =
    typeof listing?.averageRating === "number" && listing.averageRating > 0
      ? listing.averageRating
      : null;
  const serverCount =
    typeof listing?.reviewCount === "number" ? listing.reviewCount : null;

  return {
    average: serverAverage ?? (counted > 0 ? sum / counted : null),
    total: serverCount ?? reviews.length,
    breakdown,
  };
}

/**
 * Everything the product page renders, fetched concurrently:
 * listing → seller profile + store products + reviews + recommendations.
 */
export const getProductDetail = cache(async function getProductDetail(
  identifier: string
): Promise<ProductDetail | null> {
  const listing = await getListing(identifier);
  if (!listing) return null;

  const sellerId = listing.sellerProfile?.sellerId ?? null;

  const [seller, storeResult, reviews, relatedListings] = await Promise.all([
    getSellerProfile(sellerId),
    getSellerListings(sellerId, { size: 12 }),
    getListingReviews(listing.uuid),
    getRelatedListings(listing.uuid, 8),
  ]);

  return {
    listing,
    seller,
    storeListings: storeResult.listings.filter(
      (item) => item.uuid !== listing.uuid
    ),
    storeProductCount: storeResult.total,
    reviews,
    reviewSummary: summariseReviews(reviews, listing),
    relatedListings,
  };
});
