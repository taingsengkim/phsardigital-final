/**
 * Static product data for the products page.
 *
 * To use your own images:
 *   1. Drop files into  /public/picture/
 *   2. Replace the `image` value with  "/picture/your-file.jpg"
 */

export type MockProduct = {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  discountPercent: number | null;
  rating: number;
  reviewCount: number;
  storeName: string;
};

// Bag / fashion images matching the mockup screenshot
 const IMAGES = [
//   "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80",
//   "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
//   "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
//   "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
//   "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80",
//   "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80",
//   "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=400&q=80",
//   "https://images.unsplash.com/photo-1594938298603-c8148c4b4de3?w=400&q=80",
//   "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=400&q=80",
//   "https://images.unsplash.com/photo-1614179818547-6e3e31e4e7e2?w=400&q=80",
  "/picture/pic1.jpg",
  "/picture/pic2.jpg",
  "/picture/pic3.jpg",
  "/picture/pic4.jpg",
  "/picture/pic5.jpg",
  "/picture/pic6.jpg",
  "/picture/pic7.jpg",
  "/picture/pic8.jpg",
];

const TITLES = [
  "iPhone 12 Pro — Pacific Blue 128GB",
  "Premium Leather Tote Bag",
  "Women's Floral Summer Dress",
  "Rose Gold Square Watch & Bracelet Set",
  "Men's Classic White Sneakers",
  "Minimalist Canvas Backpack",
  "Pinstripe Wrap-Tie Blouse",
  "Wireless Noise-Cancelling Headphones",
  "Stainless Steel Water Bottle 1L",
  "Smart Home LED Light Strip",
];

const PRICES = [649, 89, 45, 129, 79, 55, 39, 199, 28, 35];
const ORIGINAL_PRICES = [999, 139, 75, 199, 120, 85, 65, 299, 45, 59];
const STORES = [
  "TechHub KH",
  "Leather Craft Co.",
  "Fashion By Srey",
  "Jewel & Co.",
  "Sneaker World",
  "Urban Carry",
  "Cider Fashion",
  "Sound Studio",
  "Eco Life Store",
  "Smart Home KH",
];

export const MOCK_PRODUCTS: MockProduct[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: i + 1,
    slug: `product-${i + 1}`,
    title: TITLES[i],
    image: IMAGES[i % IMAGES.length],
    price: PRICES[i],
    originalPrice: ORIGINAL_PRICES[i],
    discountPercent: Math.round((1 - PRICES[i] / ORIGINAL_PRICES[i]) * 100),
    rating: [4.8, 4.5, 4.2, 4.9, 4.1, 4.6, 4.3, 4.7, 4.4, 4.0][i],
    reviewCount: [248, 87, 312, 56, 194, 73, 421, 139, 65, 28][i],
    storeName: STORES[i],
  })
);
