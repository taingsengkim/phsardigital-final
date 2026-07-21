import type { Listing, ListingsQuery, PaginatedListings } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Fetch a paginated, filtered, sorted list of listings.
 */
export async function getListings(
  query: ListingsQuery = {}
): Promise<PaginatedListings> {
  const params = new URLSearchParams();
  if (query.categoryId) params.set("category_id", String(query.categoryId));
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("page_size", String(query.pageSize));
  if (query.search) params.set("search", query.search);

  const res = await fetch(`${BASE_URL}/api/listings?${params.toString()}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

/**
 * Fetch a single listing by slug, with all relations included.
 */
export async function getListingBySlug(slug: string): Promise<Listing> {
  const res = await fetch(`${BASE_URL}/api/listings/${slug}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Listing not found: ${slug}`);
  return res.json();
}
