export type StoreProduct = {
  id: number;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
};

export type StoreReview = {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
};

export type StoreDetails = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  fullStory?: string;
  avatarUrl: string;
  coverUrl: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  followersCount: number;
  verified: boolean;
  location: string;
  fullAddress?: string;
  businessHours?: string;
  joinedYear: string;
  responseRate: string;
  shippingTime: string;
  categories: string[];
  products: StoreProduct[];
  reviews: StoreReview[];
};
