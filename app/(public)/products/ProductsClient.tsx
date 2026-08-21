"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, ChevronsUpDown, Heart, Star, Loader2, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetListingsQuery } from "@/lib/api/homeApi";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { ProductCard } from "@/app/(public)/home/ProductCard";

function usd(n: number) {
  return (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || searchParams.get("categorySlug") || "";
  const initialSort = searchParams.get("sort") || "popular";

  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});

  // Map sort UI selection to backend query
  const mappedSort =
    sort === "price_asc" || sort === "priceAsc"
      ? "fullPrice,asc"
      : sort === "price_desc" || sort === "priceDesc"
        ? "fullPrice,desc"
        : sort === "newest"
          ? "createdAt,desc"
          : undefined;

  const { data: apiData, isLoading } = useGetListingsQuery({
    categorySlug: categorySlug || undefined,
    sort: mappedSort,
    pageNumber: page - 1,
    pageSize: 20,
  });

  const apiListings = (apiData?.content || apiData?.data || []) as any[];
  const pageObj = typeof apiData?.page === "object" ? apiData.page : null;
  const totalElements = pageObj?.totalElements ?? apiData?.total ?? apiListings.length ?? MOCK_PRODUCTS.length;
  const totalPages = pageObj?.totalPages ?? apiData?.totalPages ?? Math.ceil(totalElements / 20) ?? 1;

  async function toggleFavorite(uuid: string, currentFav: boolean) {
    const nextStatus = !currentFav;
    setFavoriteMap((prev) => ({ ...prev, [uuid]: nextStatus }));

    try {
      if (nextStatus) {
        await fetch(`/api/favorites/${uuid}`, { method: "POST" });
      } else {
        await fetch(`/api/favorites/${uuid}`, { method: "DELETE" });
      }
    } catch (err) {
      console.error("Failed to update favorite status:", err);
      setFavoriteMap((prev) => ({ ...prev, [uuid]: currentFav }));
    }
  }

  // Display items: use real API listings if available, else fallback to MOCK_PRODUCTS when API array is empty on initial load
  const displayItems =
    apiListings.length > 0
      ? apiListings
      : !categorySlug && !isLoading
        ? MOCK_PRODUCTS
        : [];

  const start = (page - 1) * 20 + 1;
  const end = Math.min(page * 20, Math.max(totalElements, displayItems.length));

  return (
    <>
      {/* ── toolbar ── */}
      <div className="mb-5 flex items-center gap-3">
        {/* grid / list toggle */}
        <div className="flex gap-1 rounded-lg border border-[#E2DFEC] bg-white p-1">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={v === "grid" ? "Grid view" : "List view"}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                view === v
                  ? "bg-[#6C4CD8] text-white"
                  : "text-[#8B85A0] hover:bg-[#F1EFFA]"
              )}
            >
              {v === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>

        {/* divider */}
        <div className="h-px flex-1 bg-[#E5E2EC]" />

        {/* sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-lg border border-[#E2DFEC] bg-white py-2 pl-3 pr-8 text-[12px] font-semibold text-[#3F3A52] outline-none focus:border-[#6C4CD8]"
          >
            <option value="popular">Sort by Popularity</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <ChevronsUpDown
            size={12}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B85A0]"
          />
        </div>
      </div>

      {/* ── loading state ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="size-8 animate-spin text-[#6C4CD8] mb-3" />
          <p className="text-sm font-semibold text-[#3F3A52]">Loading products...</p>
        </div>
      ) : displayItems.length === 0 ? (
        /* ── empty state ── */
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center border border-[#EDEBF3]">
          <PackageX className="size-12 text-[#6C4CD8]/40 mb-3" />
          <h3 className="text-base font-extrabold text-[#1A1330]">No Products Found</h3>
          <p className="mt-1 text-xs text-[#8B85A0] max-w-sm">
            There are no active products available in this category yet. Please check back soon or try another category.
          </p>
        </div>
      ) : view === "grid" ? (
        /* ── product grid view ── */
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 font-sans">
          {displayItems.map((item: any, index: number) => (
            <ProductCard
              key={item.uuid || item.id || index}
              listing={item}
            />
          ))}
        </div>
      ) : (
        /* ── product list view ── */
        <div className="flex flex-col gap-3 font-sans">
          {displayItems.map((item: any, index: number) => {
            const itemUuid = item.uuid || item.id || String(index);
            const title = item.title || "Untitled Product";
            const slug = item.slug || itemUuid;
            const fullPrice = item.fullPrice ?? item.price ?? 0;
            const discountPrice = item.discountPrice;
            const price = discountPrice ?? fullPrice;
            const originalPrice = discountPrice ? fullPrice : item.originalPrice || null;
            const discountPercent =
              discountPrice && fullPrice > 0
                ? Math.round(((fullPrice - discountPrice) / fullPrice) * 100)
                : item.discountPercent || null;

            const image =
              item.thumbnailUri?.uri ||
              item.thumbnailUri?.url ||
              (typeof item.thumbnailUri === "string" ? item.thumbnailUri : null) ||
              item.images?.[0]?.uri ||
              item.images?.[0]?.url ||
              item.image ||
              "/picture/pic1.jpg";

            const storeName =
              item.sellerProfile?.businessName ||
              item.storeName ||
              item.sellerName ||
              "Phsar Store";

            const rating = item.averageRating ?? item.rating ?? 4.8;
            const reviewCount = item.reviewCount ?? item.review_count ?? 12;
            const isSaved =
              favoriteMap[itemUuid] !== undefined
                ? favoriteMap[itemUuid]
                : Boolean(item.isFavorite ?? item.is_favorite);

            return (
              <div
                key={itemUuid}
                className="group relative flex gap-3 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.08)] transition hover:shadow-md"
              >
                <Link href={`/products/${slug}`} className="flex flex-1 gap-3">
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden bg-[#F5F3FA]">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      unoptimized={Boolean(image?.startsWith("http"))}
                    />
                    {discountPercent && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-[#6C4CD8] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center py-3 pr-3">
                    <h3 className="text-sm font-semibold text-[#241F35] transition-colors group-hover:text-[#6C4CD8]">
                      {title}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-[#6C4CD8]">{usd(price)}</span>
                      {originalPrice && (
                        <span className="text-xs text-[#B3ADC4] line-through">
                          {usd(originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} fill="#F5B301" color="#F5B301" />
                      ))}
                      <span className="ml-1 text-xs text-[#8B85A0]">({reviewCount})</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#8B85A0]">{storeName}</p>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(itemUuid, isSaved);
                  }}
                  aria-label={isSaved ? "Remove from saved" : "Save"}
                  className="mr-3 self-center z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E2DFEC] bg-white transition hover:border-[#6C4CD8]"
                >
                  <Heart
                    size={14}
                    color="#6C4CD8"
                    fill={isSaved ? "#6C4CD8" : "none"}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── pagination ── */}
      {!isLoading && displayItems.length > 0 && (
        <div className="mt-8 mb-10 flex items-center justify-between text-[12px] text-[#8B85A0] font-sans">
          <span>
            Showing {start}–{end} of {totalElements} item(s)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md bg-[#EDEBF3] px-3 py-1.5 text-[11px] font-medium text-[#8B85A0] transition hover:bg-[#E0DCF0] disabled:opacity-40"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11px] font-semibold transition",
                    page === n
                      ? "bg-[#8FC93A] text-white"
                      : "bg-[#EDEBF3] text-[#8B85A0] hover:bg-[#E0DCF0]"
                  )}
                >
                  {n}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md bg-[#8FC93A] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#7AB82E] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
