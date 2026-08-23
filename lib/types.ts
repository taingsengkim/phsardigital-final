// TS types mirroring ERD tables

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url?: string;
};

export type Seller = {
  id: number | string;
  name: string;
  slug: string;
  bannerImage?: string;
  logoImage?: string;
  avatar_url?: string;
  rating: number;
  reviewCount?: number;
  review_count?: number;
  productCount?: number;
  product_count?: number;
};

export type ListingImage = {
  id: number;
  listing_id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
};

export type ListingDiscount = {
  id: number;
  listing_id: number;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
};

export type ListingAttribute = {
  id: number;
  listing_id: number;
  key: string;
  value: string;
};

export type Review = {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number; // 1–5
  body: string;
  created_at: string;
};



export type Listing = {
  id: number;
  uuid?: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  fullPrice?: number;
  discountPrice?: number;
  category_id?: number;
  categoryUuid?: string;
  stock?: number;
  stockQty?: number;
  isFeatured?: boolean;
  isFavorite?: boolean;
  is_favorite?: boolean;
  thumbnailObjectName?: string;
  store_id?: number;
  store_name?: string;
  created_at?: string;
  // joined relations (optional, present when fetched with includes)
  images?: ListingImage[];
  discounts?: ListingDiscount[];
  attributes?: ListingAttribute[];
  reviews?: Review[];
};

export type CartItem = {
  id: number;
  cart_id: number;
  listing_id: number;
  quantity: number;
  listing?: Listing;
};

export type Cart = {
  id: number;
  user_id: number;
  items: CartItem[];
};

export type SavedListing = {
  id: number;
  user_id: number;
  listing_id: number;
  listing?: Listing;
};

export type OrderItem = {
  id: number;
  order_id: number;
  listing_id: number;
  quantity: number;
  unit_price: number;
  listing?: Listing;
};

export type Order = {
  id: number;
  user_id: number;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  total: number;
  created_at: string;
  items: OrderItem[];
};

// Query params for listing fetches
/** Mirrors the query parameters GET /api/v1/listings actually honours. */
export type ListingsQuery = {
  categoryUuid?: string;
  categorySlug?: string;
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Spring sort expression, e.g. "price,asc" or "createdAt,desc" */
  sort?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type PaginatedListings = {
  data?: Listing[];
  content?: any[];
  total?: number;
  page?: {
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  } | number;
  pageSize?: number;
  totalPages?: number;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Live API shapes (phsardigital /api/v1) — mirrors the OpenAPI schemas.
 * These are the payloads the product detail page actually renders.
 * ──────────────────────────────────────────────────────────────────────────── */

export type ApiImage = {
  uuid?: string;
  uri?: string | null;
  objectName?: string | null;
  /** gallery position; the API reorders via PATCH /listings/{uuid}/images/order */
  sortOrder?: number | null;
};

export type ApiListingAttribute = {
  uuid?: string;
  key: string;
  value: string;
  sortOrder?: number | null;
  listingUuid?: string;
};

export type ApiCategorySummary = {
  id?: number | string;
  uuid?: string;
  name?: string | null;
  slug?: string | null;
};

export type ApiSellerSummary = {
  sellerId?: string | null;
  businessName?: string | null;
  logoUri?: string | null;
  phoneNumber?: string | null;
  biography?: string | null;
  socialLink?: string[] | null;
};

export type ApiListing = {
  id?: number | string;
  uuid: string;
  sellerProfile?: ApiSellerSummary | null;
  category?: ApiCategorySummary | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  price?: number | null;
  fullPrice?: number | null;
  discountPrice?: number | null;
  stockQty?: number | null;
  status?: string | null;
  isFeatured?: boolean | null;
  isFavorite?: boolean | null;
  thumbnailUri?: ApiImage | null;
  sold?: number | null;
  images?: ApiImage[] | null;
  listingAttributes?: ApiListingAttribute[] | null;
  createdAt?: string | null;
  lastModifiedAt?: string | null;
  /** server-computed aggregate — no need to derive it from fetched reviews */
  averageRating?: number | null;
  reviewCount?: number | null;
};

export type ApiSellerProfile = {
  id?: string | null;
  businessName?: string | null;
  businessType?: string | null;
  description?: string | null;
  logoObjectName?: string | null;
  logoUri?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapUrl?: string | null;
  isActive?: boolean | null;
  phoneNumber?: string | null;
  biography?: string | null;
  socialLink?: string[] | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
};

export type ApiReviewAuthor = {
  id?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export type ApiReviewReply = {
  uuid?: string;
  comment?: string | null;
  seller?: ApiSellerProfile | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  parentReplyUuid?: string | null;
  childReplies?: ApiReviewReply[] | null;
};

export type ApiReview = {
  uuid?: string;
  listing?: ApiListing | null;
  buyer?: ApiReviewAuthor | null;
  seller?: ApiSellerProfile | null;
  rating?: number | null;
  comment?: string | null;
  photo?: { uri?: string | null; objectName?: string | null } | null;
  isEdited?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  replies?: ApiReviewReply[] | null;
};

/** Why the API surfaced a related product — drives the rail's grouping label. */
export type RelatedReason = "BOUGHT_TOGETHER" | "SAME_CATEGORY" | "SAME_SHOP";

/**
 * GET /listings/{uuid}/related. Deliberately lighter than ApiListing —
 * note `thumbnailUri` is a plain URL string here, not an object.
 */
export type RelatedListing = {
  uuid: string;
  title?: string | null;
  slug?: string | null;
  price?: number | null;
  stockQty?: number | null;
  sold?: number | null;
  thumbnailUri?: string | null;
  category?: ApiCategorySummary | null;
  sellerId?: string | null;
  businessName?: string | null;
  reason?: RelatedReason | null;
};

export type ReviewSummary = {
  average: number | null;
  total: number;
  /** counts keyed 1–5 */
  breakdown: Record<number, number>;
};

export type ProductDetail = {
  listing: ApiListing;
  seller: ApiSellerProfile | null;
  /** other live products from the same store (current one excluded) */
  storeListings: ApiListing[];
  /** total products the store has published, when the API reports it */
  storeProductCount: number | null;
  reviews: ApiReview[];
  reviewSummary: ReviewSummary;
  /** server-ranked recommendations, each tagged with why it was picked */
  relatedListings: RelatedListing[];
};
