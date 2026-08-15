/**
 * Listing API — maps to /api/v1/listings
 * Real endpoints from: https://phsardigital.quizzy.it.com/swagger-ui/index.html
 *
 * ListingResponse shape (from Swagger):
 *   uuid, title, slug, description, price, stockQty, status,
 *   isFeatured, sold, thumbnailUri, images[], listingAttributes[],
 *   sellerProfile, category, createdAt, lastModifiedAt
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

export type ListingImage = {
  uuid: string;
  uri: string;
  objectName: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ListingAttribute = {
  uuid: string;
  key: string;
  value: string;
  sortOrder: number;
  listingUuid: string;
};

export type SellerProfileSummary = {
  sellerId: string;
  phoneNumber?: string;
  biography?: string;
  businessName?: string;
  businessType?: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  isActive?: boolean;
  socialLink?: string[];
};

export type CategorySummary = {
  name: string;
  slug: string;
};

export type ThumbnailImage = {
  uuid: string;
  objectName: string;
  uri: string;
};

export type Listing = {
  uuid: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  stockQty: number;
  status: "DRAFT" | "ACTIVE" | "SOLD_OUT" | "ARCHIVED";
  isFeatured: boolean;
  sold: number;
  thumbnailUri?: ThumbnailImage;
  images: ListingImage[];
  listingAttributes: ListingAttribute[];
  sellerProfile?: SellerProfileSummary;
  category?: CategorySummary;
  createdAt: string;
  lastModifiedAt: string;
};

export type PageMeta = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type PagedListings = {
  content: Listing[];
  page: PageMeta;
};

export type ListingsQuery = {
  status?: string;      // e.g. "ACTIVE"
  pageNumber?: number;  // 0-based
  pageSize?: number;
};

/**
 * GET /api/v1/listings
 * Public — no auth required.
 */
export async function getListings(query: ListingsQuery = {}): Promise<PagedListings> {
  const params = new URLSearchParams();
  if (query.status)     params.set("status",     query.status);
  if (query.pageNumber !== undefined) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize   !== undefined) params.set("pageSize",   String(query.pageSize));

  const url = `${BASE}/api/v1/listings?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`getListings failed: ${res.status}`);
  return res.json();
}

/**
 * GET /api/v1/listings/{uuid}
 * Fetch a single listing by UUID.
 */
export async function getListingByUuid(uuid: string): Promise<Listing> {
  const res = await fetch(`${BASE}/api/v1/listings/${uuid}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`getListingByUuid failed: ${res.status}`);
  return res.json();
}

/**
 * Convenience: fetch all listings then find by slug.
 * The API doesn't have a slug-lookup endpoint, so we search client-side.
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  // Fetch enough items to find the slug
  const data = await getListings({ status: "ACTIVE", pageSize: 100 });
  return data.content.find((l) => l.slug === slug) ?? null;
}
