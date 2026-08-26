import type { Metadata } from "next";
import type { ApiListing } from "@/lib/types";
import { getPrimaryImage } from "@/app/(public)/home/listing-helpers";

/**
 * Returns the base site URL for metadata & absolute links.
 * Checks NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL, BETTER_AUTH_URL, or falls back to production domain.
 */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://phsardigital.com";
  return url.replace(/\/$/, "");
}

/**
 * Ensures an image URL is a fully qualified absolute URL (e.g. starting with http:// or https://).
 * Social media link preview crawlers (Telegram, Facebook, Twitter/X, WhatsApp, Discord, iMessage)
 * REQUIRE fully qualified absolute URLs to render preview thumbnails.
 */
export function toAbsoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) {
    return `${getSiteUrl()}/picture/product_dress_blue_floral.jpg`;
  }

  // Already an absolute HTTP/HTTPS URL
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  // Handle relative paths (e.g., /picture/dress.jpg or picture/dress.jpg)
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${cleanPath}`;
}

/**
 * Resolves the primary thumbnail image for a listing as a fully qualified absolute URL for SEO metadata.
 */
export function getAbsoluteProductImageUrl(listing?: ApiListing | null): string {
  if (!listing) {
    return `${getSiteUrl()}/picture/product_dress_blue_floral.jpg`;
  }
  const rawImage = getPrimaryImage(listing);
  return toAbsoluteUrl(rawImage);
}

/**
 * Strips HTML tags or excess whitespace from string for clean SEO description.
 */
export function cleanDescription(desc?: string | null, fallback?: string): string {
  if (!desc || !desc.trim()) return fallback ?? "";
  const cleaned = desc.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 160 ? `${cleaned.slice(0, 157)}...` : cleaned;
}

/**
 * Builds rich Metadata for a product listing detail page.
 */
export function buildProductMetadata(listing: ApiListing | null, slug: string): Metadata {
  const siteUrl = getSiteUrl();

  if (!listing) {
    return {
      title: "Product not found · Phsar Digital",
      description: "The requested product could not be found on Phsar Digital.",
    };
  }

  const title = listing.title ?? "Product";
  const defaultDesc = `Buy ${title} on Phsar Digital, Cambodia's premier online marketplace. Best prices, quality products, and fast delivery.`;
  const description = cleanDescription(listing.description, defaultDesc);

  const absoluteImageUrl = getAbsoluteProductImageUrl(listing);
  const canonicalUrl = `${siteUrl}/products/${slug}`;
  const price = listing.price ?? listing.discountPrice ?? listing.fullPrice ?? 0;

  return {
    title: `${title} · Phsar Digital`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} · Phsar Digital`,
      description,
      url: canonicalUrl,
      siteName: "Phsar Digital",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl.startsWith("https://") ? absoluteImageUrl : undefined,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Phsar Digital`,
      description,
      images: [absoluteImageUrl],
    },
    other: {
      "product:price:amount": price.toString(),
      "product:price:currency": "USD",
      "product:availability": (listing.stockQty ?? 0) > 0 ? "in stock" : "out of stock",
    },
  };
}
