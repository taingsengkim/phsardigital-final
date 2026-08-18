export type SavedItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  category: string;
  image: string;
  storeName: string;
  inStock: boolean;
};
