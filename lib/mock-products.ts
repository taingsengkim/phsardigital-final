/**
 * Static product data for the products page.
 *
 * Images currently use Unsplash URLs so you can see real photos immediately.
 * To use your own images:
 *   1. Drop files into  /public/products/
 *   2. Replace the `image` value with  "/products/your-file.jpg"
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

const IMAGES = [
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
];

export const MOCK_PRODUCTS: MockProduct[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: i + 1,
    slug: `macbook-${i + 1}`,
    title: i % 5 === 1 || i % 5 === 4 ? "MacBook z" : "MacBook Laptops",
    image: IMAGES[i % IMAGES.length],
    price: 399.0,
    originalPrice: 1399.0,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  })
);
