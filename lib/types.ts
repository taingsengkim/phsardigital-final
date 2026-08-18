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
  slug: string;
  title: string;
  description: string;
  price: number;
  category_id?: number;
  categoryUuid?: string;
  stock?: number;
  stockQty?: number;
  isFeatured?: boolean;
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
export type ListingsQuery = {
  categoryId?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "top_rated";
  page?: number;
  pageSize?: number;
  search?: string;
};

export type PaginatedListings = {
  data: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
