/**
 * Static product data for the home/products page.
 *
 * HOW TO ADD YOUR OWN IMAGES:
 * 1. Drop your image files into  /public/products/
 * 2. Replace each `image` value below with "/products/your-filename.jpg"
 *
 * All other fields (title, price, originalPrice, discount, rating, store)
 * are placeholder values — update them to match your real data.
 */

export type MockProduct = {
  id: number;
  slug: string;
  title: string;
  image: string;         // path relative to /public
  price: number;
  originalPrice: number;
  discountPercent: number | null;
  rating: number;
  reviewCount: number;
  storeName: string;
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    slug: "macbook-pro-14",
    title: "MacBook Laptops",
    image: "/products/product-1.jpg",   // ← replace with your filename
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 2,
    slug: "macbook-z",
    title: "MacBook z",
    image: "/products/product-2.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 3,
    slug: "macbook-pro-13",
    title: "MacBook Laptops",
    image: "/products/product-3.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 4,
    slug: "macbook-air",
    title: "MacBook Laptops",
    image: "/products/product-4.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 5,
    slug: "macbook-m2",
    title: "MacBook Laptops",
    image: "/products/product-5.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 6,
    slug: "macbook-pro-16",
    title: "MacBook Laptops",
    image: "/products/product-6.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 7,
    slug: "macbook-pro-max",
    title: "MacBook z",
    image: "/products/product-7.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 8,
    slug: "macbook-studio",
    title: "MacBook Laptops",
    image: "/products/product-8.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 9,
    slug: "macbook-mini",
    title: "MacBook Laptops",
    image: "/products/product-9.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
  {
    id: 10,
    slug: "macbook-ultra",
    title: "MacBook Laptops",
    image: "/products/product-10.jpg",
    price: 399.00,
    originalPrice: 1399.00,
    discountPercent: 10,
    rating: 5,
    reviewCount: 1,
    storeName: "Store1Name",
  },
];
