import type { Metadata } from "next";
import type { ApiListing } from "@/lib/types";
import { getPrimaryImage } from "@/app/(public)/home/listing-helpers";
import { displayImageUrl } from "@/lib/utils";

/**
 * Returns the base site URL for metadata & absolute links.
 * Automatically resolves Vercel production domain, custom domain, or local environment.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL;

  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://phsardigital-final.vercel.app";
  }

  return (envUrl || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Ensures an image URL is a fully qualified HTTPS absolute URL.
 * Social media link preview crawlers (Telegram, Facebook, Twitter/X, WhatsApp, Discord, iMessage)
 * REQUIRE fully qualified HTTPS absolute URLs to render preview thumbnails.
 */
export function toAbsoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) {
    return `${getSiteUrl()}/picture/product_dress_blue_floral.jpg`;
  }

  // Convert unencrypted http:// (e.g. backend MinIO IP http://51.79.146.203:9000) to HTTPS proxy URL
  if (pathOrUrl.startsWith("http://")) {
    const proxied = displayImageUrl(pathOrUrl);
    return proxied.startsWith("/") ? `${getSiteUrl()}${proxied}` : proxied;
  }

  // Already secure HTTPS URL
  if (pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  // Relative path
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${cleanPath}`;
}

/**
 * Resolves the primary thumbnail image for a listing as a fully qualified absolute HTTPS URL for SEO.
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
    const fallbackTitle = "Product Details · Phsar Digital";
    const fallbackDesc = "Buy products on Phsar Digital, Cambodia's online marketplace.";
    const fallbackImage = `${siteUrl}/picture/product_dress_blue_floral.jpg`;

    return {
      title: fallbackTitle,
      description: fallbackDesc,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        url: `${siteUrl}/products/${slug}`,
        siteName: "Phsar Digital",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
            alt: fallbackTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDesc,
        images: [fallbackImage],
      },
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
