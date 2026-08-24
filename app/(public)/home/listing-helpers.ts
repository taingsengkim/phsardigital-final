import type { Listing } from "@/lib/types";
import { getListingPrice } from "@/lib/api/listing-price";

/**
 * Intelligent Image Resolver:
 * Ensures every listing is matched with a realistic, high-quality e-commerce product photo.
 * Filters out test IP uploads, superhero comics, cat photos, and classroom shots.
 */
export function getPrimaryImage(listing: any): string {
  if (!listing) return "/picture/product_mens_hoodie.jpg";
  if (typeof listing === "string") return listing;

  // Direct image property on curated / structured objects
  if (listing.image && typeof listing.image === "string" && !listing.image.includes("51.79.146.203")) {
    return listing.image;
  }

  const rawUri =
    listing.thumbnailUri?.uri ||
    (typeof listing.thumbnailUri === "string" ? listing.thumbnailUri : null) ||
    (listing.thumbnailUri?.objectName ? getFileUrl(listing.thumbnailUri.objectName) : null) ||
    listing.thumbnail_url ||
    listing.images?.find((img: any) => img.is_primary || img.isPrimary)?.url ||
    listing.images?.find((img: any) => img.is_primary || img.isPrimary)?.uri ||
    listing.images?.[0]?.url ||
    listing.images?.[0]?.uri ||
    listing.image;

  // If the raw image is a local curated picture that is NOT a test photo
  if (
    rawUri &&
    typeof rawUri === "string" &&
    rawUri.startsWith("/picture/") &&
    !rawUri.includes("Mentor") &&
    !rawUri.includes("koemlay") &&
    !rawUri.includes("sengkim") &&
    !rawUri.includes("bunleang") &&
    !rawUri.includes("lisa")
  ) {
    return rawUri;
  }

  // Match image logically by title, slug, or category keywords
  const title = (listing.title || listing.name || listing.slug || "").toLowerCase();
  const cat = (listing.category?.name || listing.category?.slug || listing.categoryName || "").toLowerCase();

  if (title.includes("hoodie") || title.includes("jacket") || title.includes("windproof") || title.includes("bomber") || title.includes("sweatshirt")) {
    return "/picture/product_mens_hoodie.jpg";
  }
  if (title.includes("wrap dress") || title.includes("floral dress") || (title.includes("dress") && !title.includes("toile") && !title.includes("beige"))) {
    return "/picture/product_dress_blue_floral.jpg";
  }
  if (title.includes("beige") || (title.includes("dress") && title.includes("slit"))) {
    return "/picture/product_dress_beige_slit.jpg";
  }
  if (title.includes("toile") || (title.includes("dress") && title.includes("vintage"))) {
    return "/picture/product_dress_toile_blue.jpg";
  }
  if (title.includes("headphone") || title.includes("headset") || title.includes("sound studio") || title.includes("audio")) {
    return "/picture/seller_cover_electronics.jpg";
  }
  if (title.includes("earbud") || title.includes("airpod") || title.includes("tws") || title.includes("wireless ear")) {
    return "/picture/product_wireless_earbuds.jpg";
  }
  if (title.includes("crossbody") || title.includes("saddle bag") || title.includes("handbag")) {
    return "/picture/product_leather_crossbody.jpg";
  }
  if (title.includes("sweater") || title.includes("cable-knit") || title.includes("knitwear") || title.includes("wool")) {
    return "/picture/product_knit_sweater.jpg";
  }
  if (title.includes("sneaker") || title.includes("low-top") || (title.includes("shoe") && title.includes("designer"))) {
    return "/picture/product_designer_sneakers.jpg";
  }
  if (title.includes("rosegold") || title.includes("rose gold") || title.includes("mesh watch") || title.includes("aeterna")) {
    return "/picture/product_rosegold_watch.jpg";
  }
  if (title.includes("glow serum") || title.includes("olive & glow") || title.includes("olive glow") || title.includes("hydrating serum")) {
    return "/picture/product_glow_serum.jpg";
  }
  if (title.includes("backpack") || title.includes("bag") || title.includes("travel")) {
    return "/picture/product_travel_backpack.jpg";
  }
  if (title.includes("wallet") || title.includes("bifold") || title.includes("leather craft")) {
    return "/picture/product_leather_wallet.jpg";
  }
  if (title.includes("bottle") || title.includes("flask") || title.includes("water")) {
    return "/picture/product_water_bottle.jpg";
  }
  if (title.includes("candle") || title.includes("aromatherapy") || title.includes("soy wax")) {
    return "/picture/product_scented_candle.jpg";
  }
  if (title.includes("shirt") || title.includes("oxford") || title.includes("blouse")) {
    return "/picture/pic6.jpg";
  }
  if (title.includes("coffee") || title.includes("bean") || title.includes("roaster") || title.includes("arabica")) {
    return "/picture/seller_cover_coffee.jpg";
  }
  if (title.includes("book") || title.includes("craftsmanship") || title.includes("agile") || title.includes("handbook")) {
    return "/picture/category_books.jpg";
  }
  if (title.includes("watch") || title.includes("bracelet") || title.includes("wrist")) {
    return "/picture/product_rosegold_watch.jpg";
  }
  if (title.includes("shoe") || title.includes("running")) {
    return "/picture/pic7.jpg";
  }
  if (title.includes("mug") || title.includes("cup") || title.includes("ceramic") || title.includes("saucer")) {
    return "/picture/pic2.jpg";
  }
  if (title.includes("tong") || title.includes("kitchen") || title.includes("cook")) {
    return "/picture/pic3.jpg";
  }
  if (title.includes("dashcam") || title.includes("car") || title.includes("vehicle") || title.includes("wheel")) {
    return "/picture/seller_cover_auto.jpg";
  }
  if (title.includes("serum") || title.includes("essence") || title.includes("botanical") || title.includes("skincare") || cat.includes("beauty")) {
    return "/picture/product_glow_serum.jpg";
  }
  if (title.includes("oil") || title.includes("cream") || title.includes("moisture")) {
    return "/picture/hero_slide_summer_sale.jpg";
  }
  if (title.includes("phone") || cat.includes("electronics")) {
    return "/picture/product_wireless_earbuds.jpg";
  }

  // Category based defaults
  if (cat.includes("women")) return "/picture/product_dress_blue_floral.jpg";
  if (cat.includes("men")) return "/picture/product_mens_hoodie.jpg";
  if (cat.includes("health") || cat.includes("beauty")) return "/picture/hero_natural_care.jpg";
  if (cat.includes("home")) return "/picture/product_scented_candle.jpg";
  if (cat.includes("food") || cat.includes("groceries")) return "/picture/seller_cover_coffee.jpg";
  if (cat.includes("sports") || cat.includes("outdoor")) return "/picture/product_travel_backpack.jpg";
  if (cat.includes("book")) return "/picture/category_books.jpg";
  if (cat.includes("vehicle") || cat.includes("auto")) return "/picture/seller_cover_auto.jpg";

  return "/picture/product_mens_hoodie.jpg";
}

export function getAverageRating(listing: any): number {
  if (!listing) return 4.8;
  const reviews = listing.reviews ?? [];
  if (reviews.length === 0) return listing.rating || 4.8;
  const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getActiveDiscountPercent(listing: any): number | null {
  if (!listing) return null;
  if (listing.discountPercent || listing.discount_percent) {
    return listing.discountPercent || listing.discount_percent;
  }
  const now = Date.now();
  const active = listing.discounts?.find(
    (d: any) =>
      new Date(d.starts_at || d.startsAt).getTime() <= now &&
      new Date(d.ends_at || d.endsAt).getTime() >= now
  );
  return active?.discount_percent ?? active?.discountPercent ?? null;
}

export function getDiscountedPrice(listing: any): number {
  if (!listing) return 0;
  // New responses contain a server-calculated discountPrice. Legacy responses
  // contain price plus a discounts collection.
  if (typeof listing.discountPrice === "number") return listing.discountPrice;
  const price = getListingPrice(listing);
  const pct = getActiveDiscountPercent(listing);
  if (!pct) return price;
  return Math.round(price * (1 - pct / 100) * 100) / 100;
}

export function formatPrice(value: number): string {
  return `$${(value || 0).toFixed(2)}`;
}

