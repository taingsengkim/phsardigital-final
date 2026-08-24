import { CURATED_PRODUCTS } from "./curated-products";

export type MockProduct = {
  id: number | string;
  uuid?: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  discountPercent: number | null;
  rating: number;
  reviewCount: number;
  storeName: string;
  category?: { name: string; slug: string };
  sellerProfile?: { businessName: string };
};

export const MOCK_PRODUCTS: MockProduct[] = CURATED_PRODUCTS.map((prod, i) => ({
  id: prod.uuid || i + 1,
  uuid: prod.uuid,
  slug: prod.slug,
  title: prod.title,
  image: prod.image,
  price: prod.discountPrice ?? prod.fullPrice,
  originalPrice: prod.fullPrice,
  discountPercent: prod.discountPrice
    ? Math.round(((prod.fullPrice - prod.discountPrice) / prod.fullPrice) * 100)
    : null,
  rating: prod.averageRating,
  reviewCount: prod.reviewCount,
  storeName: prod.sellerProfile.businessName,
  category: prod.category,
  sellerProfile: prod.sellerProfile,
}));

