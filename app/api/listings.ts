import type { Listing, ListingsQuery, PaginatedListings, ListingImage, ListingAttribute, Review } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Category-specific high resolution photo sets from /public/picture/
 */
const CATEGORY_IMAGES: Record<string, string[]> = {
  phone: ["/picture/pic1.jpg", "/picture/pic1.jpg", "/picture/pic1.jpg", "/picture/pic1.jpg"],
  laptop: ["/picture/pic7.jpg", "/picture/pic7.jpg", "/picture/pic8.jpg", "/picture/pic8.jpg"],
  watch: ["/picture/pic4.jpg", "/picture/pic4.jpg", "/picture/pic4.jpg", "/picture/pic4.jpg"],
  fashion: ["/picture/pic2.jpg", "/picture/pic3.jpg", "/picture/pic6.jpg", "/picture/pic7.jpg"],
  shoes: ["/picture/pic5.jpg", "/picture/pic5.jpg", "/picture/pic5.jpg", "/picture/pic5.jpg"],
  kitchen: ["/picture/pic3.jpg", "/picture/pic3.jpg", "/picture/pic3.jpg", "/picture/pic3.jpg"],
  default: ["/picture/pic1.jpg", "/picture/pic2.jpg", "/picture/pic3.jpg", "/picture/pic4.jpg"],
};

function getCategoryImages(slug: string): string[] {
  const s = slug.toLowerCase();
  if (s.includes("phone") || s.includes("poco") || s.includes("iphone")) return CATEGORY_IMAGES.phone;
  if (s.includes("macbook") || s.includes("laptop") || s.includes("computer")) return CATEGORY_IMAGES.laptop;
  if (s.includes("watch") || s.includes("fitbit") || s.includes("versa") || s.includes("vivosmart") || s.includes("wearable")) return CATEGORY_IMAGES.watch;
  if (s.includes("shoe") || s.includes("sneaker") || s.includes("boot") || s.includes("sandal")) return CATEGORY_IMAGES.shoes;
  if (s.includes("kitchen") || s.includes("tongs") || s.includes("pan") || s.includes("skillet") || s.includes("knife") || s.includes("bowl")) return CATEGORY_IMAGES.kitchen;
  if (s.includes("dress") || s.includes("shirt") || s.includes("blouse") || s.includes("fashion") || s.includes("belt")) return CATEGORY_IMAGES.fashion;
  return CATEGORY_IMAGES.default;
}

/**
 * Typed Mock Product Preset Dictionary matching real API schemas
 */
const REALISTIC_PRODUCT_MOCKS: Record<string, Partial<Listing>> = {
  "poco-smart-phone": {
    title: "POCO Smart Phone — 8GB RAM / 256GB Storage (5G Dual SIM)",
    price: 255.00,
    description: "The POCO Smart Phone features a stunning 6.67-inch Full HD+ 120Hz AMOLED display with ultra-thin bezels, supercharged by an octa-core high-speed processor and 8GB RAM. Capture vivid 108MP photos with dual OIS stabilization and enjoy all-day power with a 5000mAh battery supporting 67W Turbo Charge technology. Comes factory unlocked with 5G dual SIM support and dual stereo speakers.",
    attributes: [
      { id: 1, listing_id: 1, key: "Brand", value: "POCO Official Store" },
      { id: 2, listing_id: 1, key: "Screen", value: "6.67\" 120Hz Full HD+ AMOLED" },
      { id: 3, listing_id: 1, key: "Processor", value: "Octa-Core 5G High Performance" },
      { id: 4, listing_id: 1, key: "Storage", value: "8GB RAM / 256GB Storage" },
      { id: 5, listing_id: 1, key: "Camera", value: "108MP + 8MP + 2MP Triple AI Camera" },
      { id: 6, listing_id: 1, key: "Battery", value: "5000mAh / 67W Fast Charging" },
      { id: 7, listing_id: 1, key: "Warranty", value: "1-Year Official Local Warranty" },
      { id: 8, listing_id: 1, key: "Shipping", value: "Phnom Penh Express Delivery" },
    ],
  },
  "macbook-laptops": {
    title: "MacBook Laptop — M2 Chip (16GB RAM / 512GB SSD)",
    price: 399.00,
    description: "Reengineered around the next-generation M2 chip, the MacBook combines unbelievable speed and up to 18 hours of battery life inside a thin, silent, fanless aluminum enclosure. Featuring a 13.6-inch Liquid Retina display with 500 nits brightness, 1080p FaceTime HD camera, four-speaker sound system with Spatial Audio, and MagSafe 3 charging port.",
    attributes: [
      { id: 1, listing_id: 2, key: "Brand", value: "Apple Authorized Store" },
      { id: 2, listing_id: 2, key: "Processor", value: "Apple M2 (8-Core CPU / 10-Core GPU)" },
      { id: 3, listing_id: 2, key: "Memory", value: "16GB Unified RAM" },
      { id: 4, listing_id: 2, key: "Storage", value: "512GB Ultra-Fast SSD" },
      { id: 5, listing_id: 2, key: "Display", value: "13.6\" Liquid Retina 500 nits" },
      { id: 6, listing_id: 2, key: "Ports", value: "MagSafe 3, 2x Thunderbolt 4 / USB-C" },
      { id: 7, listing_id: 2, key: "Battery Life", value: "Up to 18 Hours Continuous Use" },
      { id: 8, listing_id: 2, key: "Warranty", value: "1-Year Apple Care Official" },
    ],
  },
  "fitbit-versa-4": {
    title: "Fitbit Versa 4 Fitness & Health Smartwatch",
    price: 108.00,
    description: "Reach your health and fitness goals faster with the Fitbit Versa 4. Features built-in GPS, 40+ workout modes, 24/7 continuous heart rate monitoring, SpO2 blood oxygen sensing, and Daily Readiness Score. Water resistant up to 50 meters with 6+ days battery life.",
    attributes: [
      { id: 1, listing_id: 3, key: "Brand", value: "Fitbit Official Store" },
      { id: 2, listing_id: 3, key: "Compatibility", value: "iOS & Android Compatible" },
      { id: 3, listing_id: 3, key: "Sensors", value: "Built-in GPS, Heart Rate, SpO2" },
      { id: 4, listing_id: 3, key: "Water Rating", value: "50 Meters (5 ATM Waterproof)" },
      { id: 5, listing_id: 3, key: "Battery Life", value: "Up to 6+ Days" },
      { id: 6, listing_id: 3, key: "Warranty", value: "12 Months Local Warranty" },
    ],
  },
  "1pc-stainless-steel-kitchen-food-tongs": {
    title: "1pc Stainless Steel Kitchen Food Tongs — Non-Stick Heat Resistant",
    price: 7.00,
    description: "High-grade 304 food-grade stainless steel kitchen tongs. Designed with heat-resistant ergonomic silicone grips, heavy-duty locking mechanism, and non-stick silicone tips. Ideal for grilling steaks, frying, tossing salads, and serving hot food safely.",
    attributes: [
      { id: 1, listing_id: 4, key: "Material", value: "Food-Grade 304 Stainless Steel" },
      { id: 2, listing_id: 4, key: "Feature", value: "Heat Resistant & Easy To Clean" },
      { id: 3, listing_id: 4, key: "Locking", value: "Pull-Ring Safety Lock System" },
      { id: 4, listing_id: 4, key: "Length", value: "9 Inch / 12 Inch Utility Tongs" },
      { id: 5, listing_id: 4, key: "Dishwasher", value: "100% Dishwasher Safe" },
    ],
  },
};

export function generateDynamicMockListing(slug: string): Listing {
  const preset = REALISTIC_PRODUCT_MOCKS[slug];

  const title =
    preset?.title ??
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace("Poco", "POCO")
      .replace("Macbook", "MacBook")
      .replace("Htc", "HTC")
      .replace("1pc", "1pc");

  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const absHash = Math.abs(hash);

  const imagePaths = getCategoryImages(slug);
  const images: ListingImage[] = imagePaths.map((url, index) => ({
    id: index + 1,
    listing_id: absHash + 100,
    url,
    alt_text: `${title} view ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
  }));

  const priceBase =
    preset?.price ??
    [7.99, 15.00, 29.00, 45.00, 68.00, 79.00, 108.00, 129.00, 199.00, 255.00, 399.00, 1199.00][absHash % 12];

  const description =
    preset?.description ??
    `The ${title} is precision engineered using top-quality materials to provide exceptional performance, convenience, and durability. Ideal for daily use, home, office, or travel. Comes complete with factory-tested safety features, official packaging, and full buyer protection guaranteed by Phsar Digital.`;

  const attributes: ListingAttribute[] = preset?.attributes ?? [
    { id: 1, listing_id: absHash + 100, key: "Material", value: "Premium High Grade Build" },
    { id: 2, listing_id: absHash + 100, key: "Warranty", value: "1 Year Official Merchant Warranty" },
    { id: 3, listing_id: absHash + 100, key: "Condition", value: "100% Brand New In Box" },
    { id: 4, listing_id: absHash + 100, key: "Shipping", value: "Express Phnom Penh Delivery Available" },
    { id: 5, listing_id: absHash + 100, key: "Seller Store", value: "Phsar Digital Verified Store" },
  ];

  const reviews: Review[] = [
    {
      id: 101,
      listing_id: absHash + 100,
      user_id: 201,
      rating: 5,
      body: "Very satisfied with this product! Super fast delivery to Phnom Penh and high quality exactly as shown.",
      created_at: "2026-02-10T10:00:00.000Z",
    },
    {
      id: 102,
      listing_id: absHash + 100,
      user_id: 202,
      rating: 5,
      body: "Great item and wonderful customer service from the store team.",
      created_at: "2026-02-12T14:30:00.000Z",
    },
    {
      id: 103,
      listing_id: absHash + 100,
      user_id: 203,
      rating: 5,
      body: "100% recommended! Authentic item, nicely packed and shipped within 24 hours.",
      created_at: "2026-02-14T09:15:00.000Z",
    },
  ];

  const STORES = ["TechHub KH", "Van Shop", "Fashion By Srey", "Sneaker World", "Leather Craft Co."];
  const storeName = STORES[absHash % STORES.length];

  return {
    id: absHash + 100,
    slug,
    title,
    description,
    price: priceBase,
    category_id: (absHash % 8) + 1,
    stock: 24,
    store_id: (absHash % STORES.length) + 1,
    store_name: storeName,
    created_at: new Date().toISOString(),
    images,
    discounts: [
      {
        id: 1,
        listing_id: absHash + 100,
        discount_percent: 10,
        starts_at: "2026-01-01T00:00:00.000Z",
        ends_at: "2027-01-01T00:00:00.000Z",
      },
    ],
    attributes,
    reviews,
  };
}

/**
 * Fetch a paginated, filtered, sorted list of listings.
 */
export async function getListings(
  query: ListingsQuery = {}
): Promise<PaginatedListings> {
  if (BASE_URL) {
    try {
      const params = new URLSearchParams();
      if (query.categoryUuid) params.set("categoryUuid", query.categoryUuid);
      if (query.categorySlug) params.set("categorySlug", query.categorySlug);
      if (query.sellerId) params.set("sellerId", query.sellerId);
      if (query.search) params.set("search", query.search);
      if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
      if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
      if (query.sort) params.set("sort", query.sort);
      if (query.pageNumber !== undefined) params.set("pageNumber", String(query.pageNumber));
      if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize));

      const res = await fetch(`${BASE_URL}/api/listings?${params.toString()}`, {
        next: { revalidate: 30 },
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback below
    }
  }

  const slugs = [
    "poco-smart-phone",
    "macbook-laptops",
    "fitbit-versa-4",
    "vivosmart-5",
    "pixel-watch-2",
    "htc-vive-focus",
    "1pc-stainless-steel-kitchen-food-tongs",
  ];
  return {
    data: slugs.map(generateDynamicMockListing),
    total: slugs.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };
}

/**
 * Fetch a single listing by slug, with all relations included.
 */
export async function getListingBySlug(slug: string): Promise<any> {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "https://phsardigital.quizzy.it.com";

  // 1. Try fetching directly by uuid/slug endpoint
  try {
    const res = await fetch(`${baseUrl}/api/v1/listings/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.uuid || data.id || data.title)) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error fetching listing by uuid/slug endpoint:", err);
  }

  // 2. Search all listings from API to match slug/uuid/id
  try {
    const res = await fetch(`${baseUrl}/api/v1/listings?pageNumber=0&pageSize=100`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const listings = data?.content || data?.data || (Array.isArray(data) ? data : []);
      const matched = listings.find(
        (item: any) =>
          item.uuid === slug ||
          item.slug === slug ||
          String(item.id) === slug
      );
      if (matched) return matched;
    }
  } catch (err) {
    console.error("Error searching listing in listings list:", err);
  }

  return null;
}
