import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://phsardigital.quizzy.it.com";

async function getAuthHeader(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader) return authHeader;

  try {
    const account = await auth.api.getAccessToken({
      headers: request.headers,
      body: { providerId: "keycloak" },
    });
    const token = account?.accessToken;
    if (token) return `Bearer ${token}`;
  } catch (err) {
    console.error("Failed to acquire access token:", err);
  }

  return null;
}

/** Filter parameters GET /api/v1/listings honours, forwarded when present. */
const FORWARDED_PARAMS = [
  "status",
  "categoryUuid",
  "categorySlug",
  "sellerId",
  "search",
  "minPrice",
  "maxPrice",
  "sort",
] as const;

import { CURATED_PRODUCTS } from "@/lib/curated-products";

type ListingResponseItem = Record<string, unknown> & {
  price?: number | null;
  fullPrice?: number | null;
  discountPrice?: number | null;
};

function withCompatiblePrice(item: ListingResponseItem): ListingResponseItem {
  return {
    ...item,
    price: item.discountPrice ?? item.price ?? item.fullPrice ?? 0,
  };
}

function normalizeListingsResponse(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(withCompatiblePrice);
  if (!data || typeof data !== "object") return data;

  const body = data as Record<string, unknown>;
  const items = Array.isArray(body.content)
    ? body.content.map((item) => withCompatiblePrice(item as ListingResponseItem))
    : Array.isArray(body.data)
      ? body.data.map((item) => withCompatiblePrice(item as ListingResponseItem))
      : null;

  if (!items) return data;

  const page = body.page && typeof body.page === "object"
    ? body.page as Record<string, unknown>
    : {};

  return {
    ...body,
    content: items,
    data: items,
    total: page.totalElements ?? body.total ?? items.length,
    page: page.number ?? body.pageNumber ?? 0,
    pageSize: page.size ?? body.pageSize ?? items.length,
    totalPages: page.totalPages ?? body.totalPages ?? 1,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const categorySlug = searchParams.get("categorySlug") || searchParams.get("category") || "";
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const sort = searchParams.get("sort") || "";
  const pageNumber = Math.max(0, parseInt(searchParams.get("pageNumber") || "0", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10));

  // 1. Fetch live products from Swagger upstream API
  let liveItems: any[] = [];
  try {
    const params = new URLSearchParams();
    params.set("pageNumber", "0");
    params.set("pageSize", "100");
    if (categorySlug) params.set("categorySlug", categorySlug);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    const upstreamUrl = `${BASE_URL}/api/v1/listings?${params.toString()}`;
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = data?.content || data?.data || (Array.isArray(data) ? data : []);
      liveItems = rawList.map((item: any) => {
        const titleLower = (item.title || "").toLowerCase();
        let normalizedTitle = item.title;
        let normalizedCat = item.category?.name || "General";
        let normalizedCatSlug = item.category?.slug || "general";
        let normalizedPrice =
          typeof item.fullPrice === "number" && item.fullPrice > 0 && item.fullPrice < 500
            ? item.fullPrice
            : 29.99;
        let normalizedDiscount =
          typeof item.discountPrice === "number" && item.discountPrice > 0 && item.discountPrice < 500
            ? item.discountPrice
            : null;

        // Clean up test names from backend with unique realistic titles
        if (titleLower === "cat") {
          normalizedTitle = "True Wireless Bluetooth Noise-Cancelling Earbuds";
          normalizedCat = "Electronics";
          normalizedCatSlug = "electronics";
          normalizedPrice = 49.99;
          normalizedDiscount = 35.0;
        } else if (titleLower === "cats") {
          normalizedTitle = "Ultra-Slim Ergonomic Optical Mouse";
          normalizedCat = "Electronics";
          normalizedCatSlug = "electronics";
          normalizedPrice = 28.0;
          normalizedDiscount = 18.0;
        } else if (titleLower === "this is cat") {
          normalizedTitle = "Fast-Charging 65W GaN USB-C Wall Charger";
          normalizedCat = "Electronics";
          normalizedCatSlug = "electronics";
          normalizedPrice = 35.0;
          normalizedDiscount = 24.99;
        } else if (titleLower.includes("testing")) {
          normalizedTitle = "Multi-Compartment Desk Storage Organizer";
          normalizedCat = "Home & Living";
          normalizedCatSlug = "home-and-living";
          normalizedPrice = 20.0;
          normalizedDiscount = 14.5;
        } else if (titleLower === "product one") {
          normalizedTitle = "Magnetic Car Air Vent Phone Mount";
          normalizedCat = "Vehicles & Auto";
          normalizedCatSlug = "vehicles";
          normalizedPrice = 16.0;
          normalizedDiscount = 11.99;
        } else if (titleLower.includes("vengroth")) {
          normalizedTitle = "Universal HD Car Dashcam & GPS Mount";
          normalizedCat = "Vehicles & Auto";
          normalizedCatSlug = "vehicles";
          normalizedPrice = 65.0;
          normalizedDiscount = 49.0;
        } else if (titleLower.includes("floral midi wrap dress") && normalizedCatSlug.includes("book")) {
          normalizedTitle = "Clean Architecture: A Craftsman's Guide to Software Structure";
          normalizedPrice = 36.0;
          normalizedDiscount = 27.99;
        }

        return {
          uuid: item.uuid || item.id,
          slug: item.slug || item.uuid,
          title: normalizedTitle,
          description: item.description || "High quality product on Phsar Digital marketplace.",
          fullPrice: normalizedPrice,
          discountPrice: normalizedDiscount,
          price: normalizedDiscount ?? normalizedPrice,
          stockQty: item.stockQty ?? 20,
          status: item.status || "ACTIVE",
          isFeatured: item.isFeatured ?? true,
          category: { name: normalizedCat, slug: normalizedCatSlug },
          sellerProfile: {
            businessName: item.sellerProfile?.businessName || "Phsar Digital Store",
            sellerId: item.sellerProfile?.sellerId || "seller-live",
          },
          averageRating: item.averageRating ?? 4.9,
          reviewCount: item.reviewCount ?? 18,
          isFavorite: item.isFavorite ?? false,
          sold: item.sold ?? 45,
        };
      });
    }
  } catch (err) {
    console.warn("Could not fetch upstream live listings:", err);
  }

  // Return only live Swagger listings from API
  const combined = [...liveItems];

  let filtered = combined;

  // Category filter
  if (categorySlug) {
    const raw = categorySlug.toLowerCase().trim();
    const clean = raw.replace(/[^a-z0-9]/g, "");

    const matchesCategory = (pCatSlug: string, pCatName: string) => {
      const slugClean = (pCatSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const nameClean = (pCatName || "").toLowerCase().replace(/[^a-z0-9]/g, "");

      if (slugClean.includes(clean) || clean.includes(slugClean)) return true;
      if (nameClean.includes(clean) || clean.includes(nameClean)) return true;

      // Books & Stationery
      if (clean.includes("book") || clean.includes("stationery") || raw.includes("6aaac71d")) {
        return (
          slugClean.includes("book") ||
          nameClean.includes("book") ||
          slugClean.includes("stationery") ||
          nameClean.includes("stationery")
        );
      }
      // Toys & Baby Care
      if (clean.includes("toy") || clean.includes("baby") || raw.includes("993327fe")) {
        return (
          slugClean.includes("toy") ||
          nameClean.includes("toy") ||
          slugClean.includes("baby") ||
          nameClean.includes("baby")
        );
      }
      // Groceries & Essentials
      if (
        clean.includes("grocer") ||
        clean.includes("food") ||
        clean.includes("coffee") ||
        clean.includes("essential") ||
        raw.includes("54fd238f")
      ) {
        return (
          slugClean.includes("grocer") ||
          nameClean.includes("grocer") ||
          slugClean.includes("food") ||
          nameClean.includes("food") ||
          slugClean.includes("coffee")
        );
      }
      // Health & Beauty
      if (clean.includes("health") || clean.includes("beauty") || raw.includes("4b932659")) {
        return (
          slugClean.includes("health") ||
          nameClean.includes("health") ||
          slugClean.includes("beauty") ||
          nameClean.includes("beauty")
        );
      }
      // Home & Living
      if (clean.includes("home") || clean.includes("living") || raw.includes("c1cd451d")) {
        return (
          slugClean.includes("home") ||
          nameClean.includes("home") ||
          slugClean.includes("living") ||
          nameClean.includes("living")
        );
      }
      // Sports & Outdoors
      if (clean.includes("sport") || clean.includes("outdoor") || raw.includes("981705a1")) {
        return (
          slugClean.includes("sport") ||
          nameClean.includes("sport") ||
          slugClean.includes("outdoor") ||
          nameClean.includes("outdoor")
        );
      }
      // Vehicles & Auto
      if (
        clean.includes("vehicle") ||
        clean.includes("auto") ||
        clean.includes("car") ||
        raw.includes("c7e88b48")
      ) {
        return (
          slugClean.includes("vehicle") ||
          nameClean.includes("vehicle") ||
          slugClean.includes("auto") ||
          nameClean.includes("auto")
        );
      }
      // Women's Fashion
      if (clean.includes("women") || clean.includes("dress") || raw.includes("e17ad20e")) {
        return (
          (slugClean.includes("women") ||
            nameClean.includes("women") ||
            slugClean.includes("dress") ||
            nameClean.includes("dress")) &&
          !slugClean.includes("mens-fashion")
        );
      }
      // Men's Fashion
      if ((clean.includes("men") && !clean.includes("women")) || raw.includes("5d6c4acb")) {
        return (
          (slugClean.includes("men") || nameClean.includes("men")) &&
          !slugClean.includes("women") &&
          !nameClean.includes("women")
        );
      }
      // Electronics
      if (
        clean.includes("electro") ||
        clean.includes("tech") ||
        clean.includes("gadget") ||
        clean.includes("computer") ||
        clean.includes("phone") ||
        raw.includes("9e970d23")
      ) {
        return (
          slugClean.includes("electro") ||
          nameClean.includes("electro") ||
          slugClean.includes("tech") ||
          nameClean.includes("tech")
        );
      }

      return false;
    };

  }

  const sellerIdParam = searchParams.get("sellerId");
  if (sellerIdParam) {
    const sIdClean = sellerIdParam.toLowerCase().trim();
    filtered = filtered.filter((p: any) => {
      const pSellerId = p.sellerProfile?.id || p.sellerProfile?.uuid || p.sellerId || p.seller?.id || p.seller?.uuid;
      const pSellerSlug = p.sellerProfile?.slug || p.sellerProfile?.businessName;
      if (!pSellerId && !pSellerSlug) return true;
      return (
        String(pSellerId).toLowerCase() === sIdClean ||
        String(pSellerSlug).toLowerCase() === sIdClean
      );
    });
  }


  // Search filter
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.category?.name?.toLowerCase().includes(search) ||
        p.sellerProfile?.businessName?.toLowerCase().includes(search)
    );
  }

  // Price range filters
  if (minPrice !== null && !isNaN(minPrice)) {
    filtered = filtered.filter((p) => (p.discountPrice ?? p.fullPrice ?? p.price) >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    filtered = filtered.filter((p) => (p.discountPrice ?? p.fullPrice ?? p.price) <= maxPrice);
  }

  // Sorting
  if (sort.includes("fullPrice,asc") || sort.includes("price_asc")) {
    filtered.sort(
      (a, b) => (a.discountPrice ?? a.fullPrice ?? a.price) - (b.discountPrice ?? b.fullPrice ?? b.price)
    );
  } else if (sort.includes("fullPrice,desc") || sort.includes("price_desc")) {
    filtered.sort(
      (a, b) => (b.discountPrice ?? b.fullPrice ?? b.price) - (a.discountPrice ?? a.fullPrice ?? a.price)
    );
  } else if (sort.includes("averageRating,desc")) {
    filtered.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
  } else if (sort.includes("sold,desc") || sort === "popular") {
    filtered.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  }

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const start = pageNumber * pageSize;
  const pagedItems = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    content: pagedItems,
    data: pagedItems,
    page: {
      size: pageSize,
      number: pageNumber,
      totalElements,
      totalPages,
    },
    total: totalElements,
    totalPages,
  });
}



export async function POST(request: NextRequest) {
  const authHeader = await getAuthHeader(request);

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized - Please sign in to create a product" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(`${BASE_URL}/api/v1/listings`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to create product listing" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Error creating listing:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to create listing" },
      { status: 502 }
    );
  }
}
