import type { Listing, ListingImage, Review } from "@/lib/types";

let nextId = 1;
const now = new Date().toISOString();

const LOCAL_IMAGES = [
  "/picture/pic1.jpg",
  "/picture/pic2.jpg",
  "/picture/pic3.jpg",
  "/picture/pic4.jpg",
  "/picture/pic5.jpg",
  "/picture/pic6.jpg",
  "/picture/pic7.jpg",
  "/picture/pic8.jpg",
];

function makeImage(listingId: number, seed: string): ListingImage {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imgPath = LOCAL_IMAGES[Math.abs(hash) % LOCAL_IMAGES.length];

  return {
    id: nextId++,
    listing_id: listingId,
    url: imgPath,
    alt_text: seed,
    is_primary: true,
    sort_order: 0,
  };
}

function makeReviews(listingId: number, rating: number, count: number): Review[] {
  return Array.from({ length: count }, (_, i) => ({
    id: nextId++,
    listing_id: listingId,
    user_id: 100 + i,
    rating,
    body: "Great product.",
    created_at: now,
  }));
}

function makeListing(opts: {
  title: string;
  price: number;
  categoryId: number;
  seed: string;
  rating?: number;
  reviewCount?: number;
  discountPercent?: number;
}): Listing {
  const id = nextId++;
  const listing: Listing = {
    id,
    slug: opts.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: opts.title,
    description: `${opts.title} — placeholder description, swap for real copy once the API is wired up.`,
    price: opts.price,
    category_id: opts.categoryId,
    stock: 24,
    created_at: now,
    images: [makeImage(id, opts.seed)],
    reviews: makeReviews(id, opts.rating ?? 5, opts.reviewCount ?? 1),
  };

  if (opts.discountPercent) {
    listing.discounts = [
      {
        id: nextId++,
        listing_id: id,
        discount_percent: opts.discountPercent,
        starts_at: "2026-01-01T00:00:00.000Z",
        ends_at: "2027-01-01T00:00:00.000Z",
      },
    ];
  }

  return listing;
}

// "Featured Products" grid (Recommended For You section)
export const mockFeaturedListings: Listing[] = Array.from({ length: 15 }, (_, i) =>
  makeListing({
    title: "POCO Smart Phone",
    price: 255,
    categoryId: 5,
    seed: `featured-${i}`,
    rating: 4,
    reviewCount: 6,
  })
);

// "Top Rated Products"
export const mockTopRatedListings: Listing[] = [
  makeListing({ title: "MacBook Laptops", price: 399, categoryId: 8, seed: "top-1", rating: 5, reviewCount: 1 }),
  makeListing({ title: "MacBook Laptops", price: 399, categoryId: 8, seed: "top-2", rating: 5, reviewCount: 1, discountPercent: 10 }),
  makeListing({ title: "MacBook Laptops", price: 399, categoryId: 8, seed: "top-3", rating: 5, reviewCount: 1, discountPercent: 10 }),
  makeListing({ title: "MacBook Laptops", price: 399, categoryId: 8, seed: "top-4", rating: 5, reviewCount: 1 }),
  makeListing({ title: "MacBook Laptops", price: 399, categoryId: 8, seed: "top-5", rating: 5, reviewCount: 1 }),
];

// "Wearable"
export const mockWearableListings: Listing[] = [
  makeListing({ title: "Fitbit Versa 4", price: 108, categoryId: 5, seed: "wear-1", discountPercent: 10 }),
  makeListing({ title: "Vivosmart 5", price: 80, categoryId: 5, seed: "wear-2" }),
  makeListing({ title: "Fitbit Inspire 3", price: 68, categoryId: 5, seed: "wear-3" }),
  makeListing({ title: "Pixel Watch 2", price: 120, categoryId: 5, seed: "wear-4" }),
  makeListing({ title: "HTC Vive Focus", price: 1199, categoryId: 5, seed: "wear-5" }),
];

// Small 4-thumbnail sets for the "Find What You Need" category panels
export const mockCategoryPanelListings: Record<string, Listing[]> = {
  "personal-care": ["Filter", "Soap", "Shampoo", "Baby oil"].map((title, i) =>
    makeListing({ title, price: 12, categoryId: 1, seed: `pc-${i}` })
  ),
  "sports-outdoor": ["Basketball", "Toy set", "Baseball", "Water bottle"].map((title, i) =>
    makeListing({ title, price: 18, categoryId: 2, seed: `sp-${i}` })
  ),
  shoes: ["Runner", "Heel", "Loafer", "Boot"].map((title, i) =>
    makeListing({ title, price: 45, categoryId: 3, seed: `sh-${i}` })
  ),
  kitchen: ["Pan set", "Skillet", "Knife", "Pot"].map((title, i) =>
    makeListing({ title, price: 30, categoryId: 4, seed: `kt-${i}` })
  ),
};
