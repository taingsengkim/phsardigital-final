import type {
  ApiListing,
  ApiReview,
  ApiSellerProfile,
  RelatedListing,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

/** Revalidation window for public catalogue data (seconds). */
const CATALOGUE_TTL = 60;

type FetchOptions = {
  /** cache for N seconds; omit for no-store */
  revalidate?: number;
};

export type ApiResult<T> = {
  data: T | null;
  status: number;
};

/**
 * Read a public catalogue endpoint. Every endpoint used here is anonymous —
 * listings, seller profiles, reviews and recommendations are all public.
 */
async function apiGet<T>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  const { revalidate } = options;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      ...(revalidate === undefined
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
    });

    if (!res.ok) return { data: null, status: res.status };

    const text = await res.text();
    return {
      data: text ? (JSON.parse(text) as T) : null,
      status: res.status,
    };
  } catch (err) {
    console.error(`[api] GET ${path} failed:`, err);
    return { data: null, status: 0 };
  }
}

type PagedResponse<T> = {
  content?: T[] | null;
  page?: {
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  } | null;
};

/** Public seller profile — the source of the store's address and coordinates. */
export async function getSellerProfile(
  sellerId?: string | null
): Promise<ApiSellerProfile | null> {
  if (!sellerId) return null;
  const { data } = await apiGet<ApiSellerProfile>(
    `/api/v1/sellers/${encodeURIComponent(sellerId)}`,
    { revalidate: CATALOGUE_TTL }
  );
  return data;
}

/** Products published by a store, plus the store's total product count. */
export async function getSellerListings(
  sellerId?: string | null,
  { page = 0, size = 12 }: { page?: number; size?: number } = {}
): Promise<{ listings: ApiListing[]; total: number | null }> {
  if (!sellerId) return { listings: [], total: null };

  const { data } = await apiGet<PagedResponse<ApiListing>>(
    `/api/v1/sellers/${encodeURIComponent(sellerId)}/listings?page=${page}&size=${size}`,
    { revalidate: CATALOGUE_TTL }
  );

  return {
    listings: data?.content ?? [],
    total: data?.page?.totalElements ?? null,
  };
}

/** Reviews for one listing — public since the API update. */
export async function getListingReviews(
  listingUuid?: string | null,
  { page = 0, size = 20 }: { page?: number; size?: number } = {}
): Promise<ApiReview[]> {
  if (!listingUuid) return [];

  const { data } = await apiGet<PagedResponse<ApiReview>>(
    `/api/v1/reviews/listings/${encodeURIComponent(listingUuid)}?page=${page}&size=${size}`,
    { revalidate: CATALOGUE_TTL }
  );
  return data?.content ?? [];
}

/**
 * Server-ranked recommendations for a listing. Each entry carries a `reason`
 * (BOUGHT_TOGETHER / SAME_CATEGORY / SAME_SHOP) explaining why it was picked.
 */
export async function getRelatedListings(
  listingUuid?: string | null,
  limit = 8
): Promise<RelatedListing[]> {
  if (!listingUuid) return [];

  const { data } = await apiGet<RelatedListing[]>(
    `/api/v1/listings/${encodeURIComponent(listingUuid)}/related?limit=${limit}`,
    { revalidate: CATALOGUE_TTL }
  );
  return Array.isArray(data) ? data : [];
}

export { apiGet };
export type { PagedResponse };
