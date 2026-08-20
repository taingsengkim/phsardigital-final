/**
 * Not in shared types.ts because there's no public "browse sellers"
 * endpoint on the backend yet — this stays mock-only for now, same as the
 * TopSellersSection component itself. Once that endpoint exists, move this
 * into types.ts and swap the mock array in homeApi.ts for a real query.
 */
export type Seller = {
  id: number;
  name: string;
  slug: string;
  avatar_url?: string;
  rating: number; // 0–5
  review_count: number;
  product_count: number;
};
