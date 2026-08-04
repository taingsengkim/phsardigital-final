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
  "MacBook Laptops",
  "MacBook z",
  "MacBook Laptops",
  "MacBook Laptops",
  "MacBook Laptops",
  "MacBook Laptops",
  "MacBook z",
  "MacBook Laptops",
  "MacBook Laptops",
  "MacBook Laptops",
];

export const MOCK_PRODUCTS: MockProduct[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: i + 1,
    slug: `product-${i + 1}`,
    title: TITLES[i],
    image: IMAGES[i % IMAGES.length],
    price: 399.0,
    originalPrice: 1399.0,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  })
);
