import { cache } from "react";
import type { ApiListing, ApiReview, ProductDetail, ReviewSummary } from "@/lib/types";
import {
  apiGet,
  getListingReviews,
  getRelatedListings,
  getSellerListings,
  getSellerProfile,
} from "@/app/api/sellers";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEMO_LISTINGS: Record<string, ApiListing> = {
  "vintage-floral-cottagecore-corset-mini-dress": {
    id: 101,
    uuid: "vintage-floral-cottagecore-corset-mini-dress",
    slug: "vintage-floral-cottagecore-corset-mini-dress",
    title: "Vintage Floral Cottagecore Corset Lace-Up Mini Dress with Puff Sleeves",
    description: `Crafted from lightweight breathable cotton blend, this romantic cottagecore mini dress features an all-over delicate blue floral blossom print. Designed with vintage-inspired puff sleeves, a flattering sweetheart neckline, and a structured lace-up corset front that accentuates your silhouette.

• Fabric: 100% Breathable Cotton / Rayon Blend
• Sweetheart neckline with delicate lace trim
• Functional front lace-up corset tie detail
• Elasticated puff sleeves with ruffled cuffs
• Ruffled flounce hemline with inner lining
• Hidden back zipper closure for a comfortable fit
• Machine wash cold gentle, hang to dry`,
    price: 45,
    fullPrice: 65,
    discountPrice: 45,
    stockQty: 28,
    sold: 142,
    status: "ACTIVE",
    isFeatured: true,
    isFavorite: true,
    thumbnailUri: { uri: "/picture/product_dress_blue_floral.jpg", sortOrder: 0 },
    images: [
      { uri: "/picture/product_dress_blue_floral.jpg", sortOrder: 0 },
      { uri: "/picture/product_dress_toile_blue.jpg", sortOrder: 1 },
      { uri: "/picture/product_dress_beige_slit.jpg", sortOrder: 2 },
    ],
    category: {
      id: 1,
      uuid: "womens-fashion",
      name: "Women's Fashion",
      slug: "womens-fashion",
    },
    sellerProfile: {
      sellerId: "dance-skirts",
      businessName: "Dance skirts",
      logoUri: "/picture/pic4.jpg",
    },
    averageRating: 4.9,
    reviewCount: 48,
    listingAttributes: [
      { key: "Material", value: "Cotton Rayon Blend" },
      { key: "Pattern", value: "Floral Print" },
      { key: "Neckline", value: "Sweetheart Neck" },
      { key: "Sleeve Length", value: "Short Puff Sleeve" },
      { key: "Dress Length", value: "Mini / Above Knee" },
      { key: "Occasion", value: "Summer, Vacation, Picnic, Daily Casual" },
    ],
  },
  "beige-floral-slit-sweetheart-midi-dress": {
    id: 102,
    uuid: "beige-floral-slit-sweetheart-midi-dress",
    slug: "beige-floral-slit-sweetheart-midi-dress",
    title: "Beige Floral Sweetheart Neckline Midi Dress with High Leg Slit",
    description: `An elegant and graceful summer staple. This midi dress is tailored in an artisanal beige base with soft pastel botanical motifs, featuring a cinched waistline, romantic sweetheart neckline, and a statement high front slit for effortless movement.

• Premium breathable modal-linen blend
• Contoured bust with ruched tie accent
• High side slit for a flattering silhouette
• Concealed side zipper closure
• Lined bodice for complete opacity`,
    price: 58,
    fullPrice: 85,
    discountPrice: 58,
    stockQty: 18,
    sold: 96,
    status: "ACTIVE",
    isFeatured: true,
    isFavorite: false,
    thumbnailUri: { uri: "/picture/product_dress_beige_slit.jpg", sortOrder: 0 },
    images: [
      { uri: "/picture/product_dress_beige_slit.jpg", sortOrder: 0 },
      { uri: "/picture/product_dress_blue_floral.jpg", sortOrder: 1 },
    ],
    category: {
      id: 1,
      uuid: "womens-fashion",
      name: "Women's Fashion",
      slug: "womens-fashion",
    },
    sellerProfile: {
      sellerId: "fashion-by-srey",
      businessName: "Fashion By Srey",
      logoUri: "/picture/pic3.jpg",
    },
    averageRating: 4.8,
    reviewCount: 29,
    listingAttributes: [
      { key: "Material", value: "Linen Modal Blend" },
      { key: "Length", value: "Midi" },
      { key: "Details", value: "High Thigh Slit" },
    ],
  },
  "french-toile-blue-porcelain-vintage-mini-dress": {
    id: 103,
    uuid: "french-toile-blue-porcelain-vintage-mini-dress",
    slug: "french-toile-blue-porcelain-vintage-mini-dress",
    title: "French Toile De Jouy Blue Porcelain Vintage Puff Sleeve Mini Dress",
    description: `Inspired by historic French porcelain prints and pastoral illustrations, this statement mini dress showcases cobalt blue botanical toile de Jouy patterns on crisp ivory fabric with puff sleeves and an open back bow-tie.

• 100% Woven Cotton Poplin
• Statement cutout back with self-tie satin ribbon
• Flattering gathered A-line skirt
• Perfect for brunches, garden parties and special events`,
    price: 52,
    fullPrice: 72,
    discountPrice: 52,
    stockQty: 20,
    sold: 84,
    status: "ACTIVE",
    isFeatured: true,
    isFavorite: false,
    thumbnailUri: { uri: "/picture/product_dress_toile_blue.jpg", sortOrder: 0 },
    images: [
      { uri: "/picture/product_dress_toile_blue.jpg", sortOrder: 0 },
      { uri: "/picture/product_dress_blue_floral.jpg", sortOrder: 1 },
    ],
    category: {
      id: 1,
      uuid: "womens-fashion",
      name: "Women's Fashion",
      slug: "womens-fashion",
    },
    sellerProfile: {
      sellerId: "dance-skirts",
      businessName: "Dance skirts",
      logoUri: "/picture/pic4.jpg",
    },
    averageRating: 4.9,
    reviewCount: 32,
    listingAttributes: [
      { key: "Pattern", value: "French Toile De Jouy" },
      { key: "Back Detail", value: "Open Back with Tie Bow" },
    ],
  },
  "luxury-organic-botanical-facial-serum": {
    id: 104,
    uuid: "luxury-organic-botanical-facial-serum",
    slug: "luxury-organic-botanical-facial-serum",
    title: "Luxury Organic Botanical Hydrating Facial Essence & Serum Set",
    description: `Rejuvenate and hydrate your skin barrier with Aura Naturals' flagship botanical care set. Infused with pure eucalyptus extract, hyaluronic acid, and plant-derived squalane.

• 100% Clean Organic Formula
• Dermatologist tested for sensitive skin
• Set includes 50ml Serum + 100ml Hydrating Essence`,
    price: 75,
    fullPrice: 110,
    discountPrice: 75,
    stockQty: 35,
    sold: 210,
    status: "ACTIVE",
    isFeatured: true,
    isFavorite: false,
    thumbnailUri: { uri: "/picture/hero_natural_care.jpg", sortOrder: 0 },
    images: [
      { uri: "/picture/hero_natural_care.jpg", sortOrder: 0 },
      { uri: "/picture/hero_skincare_slide2.jpg", sortOrder: 1 },
    ],
    category: {
      id: 2,
      uuid: "health-beauty",
      name: "Health & Beauty",
      slug: "health-beauty",
    },
    sellerProfile: {
      sellerId: "aura-naturals",
      businessName: "Aura Naturals",
      logoUri: "/picture/logo.png",
    },
    averageRating: 5.0,
    reviewCount: 64,
    listingAttributes: [
      { key: "Formulation", value: "Serum & Essence" },
      { key: "Skin Type", value: "All Skin Types" },
    ],
  },
};

import { CURATED_PRODUCTS } from "@/lib/curated-products";

/**
 * Resolve a listing from a URL segment. The API exposes a dedicated slug
 * endpoint, so both a UUID and a pretty slug cost exactly one request.
 */
import { getPrimaryImage } from "@/app/(public)/home/listing-helpers";

/**
 * Leftover seed rows that should not surface as real products. Matched whole,
 * not by substring — `includes("cat")` also rejected any genuine listing with
 * "cat" inside a word (Delicate, Education, Category), sending it to the
 * curated fallback complete with placeholder imagery.
 */
const PLACEHOLDER_TITLES = new Set(["cat", "cats", "this is cat", "vengroth"]);

function isPlaceholderTitle(title: string): boolean {
  return PLACEHOLDER_TITLES.has(title.trim().toLowerCase());
}

export const getListing = cache(async function getListing(
  identifier: string
): Promise<ApiListing | null> {
  if (!identifier) return null;

  try {
    const path = UUID_RE.test(identifier)
      ? `/api/v1/listings/${identifier}`
      : `/api/v1/listings/slug/${encodeURIComponent(identifier)}`;

    const { data } = await apiGet<ApiListing>(path, { revalidate: 30 });
    if (data?.uuid && data.title && !isPlaceholderTitle(data.title)) {
      const primaryImage = getPrimaryImage(data);
      // Real uploads live on the file host, so they are the images to show —
      // the gallery only falls back to the thumbnail when there are none.
      const gallery =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : [{ uri: primaryImage, sortOrder: 0 }];

      const fullPrice = typeof data.fullPrice === "number" ? data.fullPrice : (data.price ?? 0);
      const discountPrice = typeof data.discountPrice === "number" ? data.discountPrice : null;
      const effectivePrice =
        discountPrice !== null && fullPrice !== null && discountPrice < fullPrice
          ? discountPrice
          : fullPrice;

      return {
        ...data,
        thumbnailUri: data.thumbnailUri?.uri ? data.thumbnailUri : { uri: primaryImage, sortOrder: 0 },
        images: gallery,
        price: effectivePrice,
        fullPrice,
        discountPrice,
        averageRating: data.averageRating ?? null,
        reviewCount: data.reviewCount ?? 0,
      };
    }
  } catch (err) {
    console.warn("Live API listing fetch failed for identifier:", identifier, err);
  }

  return null;
});


export function summariseReviews(
  reviews: ApiReview[],
  listing?: ApiListing
): ReviewSummary {
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let counted = 0;

  for (const review of reviews) {
    const rating = Number(review.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    breakdown[Math.round(rating)] += 1;
    sum += rating;
    counted += 1;
  }

  const serverAverage =
    typeof listing?.averageRating === "number" && listing.averageRating > 0
      ? listing.averageRating
      : null;
  const serverCount =
    typeof listing?.reviewCount === "number" ? listing.reviewCount : null;

  return {
    average: serverAverage ?? (counted > 0 ? sum / counted : null),
    total: serverCount ?? (reviews.length > 0 ? reviews.length : 0),
    breakdown,
  };
}

export const getProductDetail = cache(async function getProductDetail(
  identifier: string
): Promise<ProductDetail | null> {
  const listing = await getListing(identifier);
  if (!listing) return null;

  const sellerId = listing.sellerProfile?.sellerId ?? null;

  try {
    const [seller, storeResult, reviews, relatedListings] = await Promise.all([
      getSellerProfile(sellerId),
      getSellerListings(sellerId, { size: 12 }),
      getListingReviews(listing.uuid),
      getRelatedListings(listing.uuid, 8),
    ]);

    return {
      listing,
      seller,
      storeListings: (storeResult?.listings || []).filter(
        (item) => item.uuid !== listing.uuid
      ),
      storeProductCount: storeResult?.total ?? 12,
      reviews: reviews || [],
      reviewSummary: summariseReviews(reviews || [], listing),
      relatedListings: relatedListings || [],
    };
  } catch (err) {
    console.warn("Auxiliary detail fetch failed, returning base listing detail:", err);
    return {
      listing,
      seller: null,
      storeListings: [],
      storeProductCount: 8,
      reviews: [],
      reviewSummary: summariseReviews([], listing),
      relatedListings: [],
    };
  }
});
