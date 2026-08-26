"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  List,
  ChevronDown,
  Check,
  Heart,
  Star,
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetListingsQuery } from "@/lib/api/homeApi";
import { ProductCard } from "@/app/(public)/home/ProductCard";
import { getPrimaryImage } from "@/app/(public)/home/listing-helpers";

function usd(n: number) {
  return (n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function PageSizeDropdown({
  value,
  onChange,
  options = [15, 30, 50, 75, 100, 150],
}: {
  value: number;
  onChange: (val: number) => void;
  options?: number[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9.5 items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-[#F4F4F6] dark:bg-[#18181B] px-4 py-2 text-sm font-semibold text-[#1A1330] dark:text-white transition hover:bg-gray-200 dark:hover:bg-[#27272A] focus:outline-none shadow-xs"
      >
        <span>{value}</span>
        <ChevronDown size={16} className={cn("text-gray-500 dark:text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[125px] overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#18181B] py-2 shadow-xl shadow-black/20 animate-in fade-in-0 zoom-in-95">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition text-left",
                opt === value
                  ? "bg-[#6C4CD8]/10 text-[#6C4CD8] dark:bg-[#6C4CD8]/20 dark:text-purple-300 font-semibold"
                  : "text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-[#27272A]"
              )}
            >
              <span>{opt}</span>
              {opt === value && <Check size={16} className="text-[#6C4CD8] dark:text-purple-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") || searchParams.get("categorySlug") || "";
  const initialSort = searchParams.get("sort") || "popular";
  const initialPageSize = Number(searchParams.get("pageSize") || searchParams.get("size")) || 75;

  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState(initialSort);
  const [pageSize, setPageSize] = useState(initialPageSize);
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
    pageSize: pageSize,
  });

  const apiListings = (apiData?.content || apiData?.data || []) as any[];
  const pageObj = typeof apiData?.page === "object" ? apiData.page : null;
  const totalElements = pageObj?.totalElements ?? apiData?.total ?? apiListings.length ?? 0;
  const totalPages = Math.max(
    1,
    pageObj?.totalPages ?? apiData?.totalPages ?? Math.ceil(totalElements / pageSize) ?? 1
  );

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

  // Display items: use real API listings
  const displayItems = apiListings;

  const start = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, Math.max(totalElements, displayItems.length));

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <>
      {/* ── toolbar ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
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
                  ? "bg-[#6C4CD8] text-white shadow-sm"
                  : "text-[#8B85A0] hover:bg-[#F1EFFA]"
              )}
            >
              {v === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>

        {/* divider */}
        <div className="h-px flex-1 bg-[#E5E2EC]" />

        {/* page size selector (top toolbar) */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Rows per page</span>
          <PageSizeDropdown
            value={pageSize}
            onChange={handlePageSizeChange}
            options={[15, 30, 50, 75, 100, 150]}
          />
        </div>

        {/* sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort order"
            className="appearance-none rounded-lg border border-[#E2DFEC] dark:border-[#2C2442] bg-white dark:bg-[#1A1429] py-2 pl-3 pr-8 text-xs font-semibold text-[#3F3A52] dark:text-[#E2DFEC] outline-none focus:border-[#6C4CD8] focus:ring-2 focus:ring-[#6C4CD8]/20 transition cursor-pointer hover:border-[#6C4CD8]/50"
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
            const itemUuid = item.uuid || item.id || item.slug || String(index);
            const title = item.title || "Untitled Product";
            const slug = item.slug || itemUuid;
            const targetUuid = item.uuid || item.id || slug;
            const fullPrice = item.fullPrice ?? item.price ?? 0;
            const discountPrice = item.discountPrice;
            const price = discountPrice ?? fullPrice;
            const originalPrice = discountPrice ? fullPrice : item.originalPrice || null;
            const discountPercent =
              discountPrice && fullPrice > 0
                ? Math.round(((fullPrice - discountPrice) / fullPrice) * 100)
                : item.discountPercent || null;

            const image = getPrimaryImage(item);

            const storeName =
              item.sellerProfile?.businessName ||
              item.storeName ||
              item.sellerName ||
              "Phsar Store";

            const rating = item.averageRating ?? item.rating ?? 0;
            const reviewCount = item.reviewCount ?? item.review_count ?? 0;
            const isSaved =
              favoriteMap[itemUuid] !== undefined
                ? favoriteMap[itemUuid]
                : Boolean(item.isFavorite ?? item.is_favorite);

            return (
              <div
                key={itemUuid}
                className="group relative flex gap-3 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.08)] transition hover:shadow-md"
              >
                <Link href={`/products/${targetUuid}`} className="flex flex-1 gap-3">
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden bg-[#F5F3FA]">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
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

      {/* ── pagination bar ── */}
      {!isLoading && displayItems.length > 0 && (
        <div className="mt-10 mb-12 flex flex-col sm:flex-row items-center justify-between gap-5 py-3 text-sm font-sans border-t border-gray-100 dark:border-zinc-800/80 pt-7">
          {/* Left section: Rows per page [ 75 v ] Showing 1–75 of 52 */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 text-gray-600 dark:text-zinc-400">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Rows per page</span>

            <PageSizeDropdown
              value={pageSize}
              onChange={handlePageSizeChange}
              options={[15, 30, 50, 75, 100, 150]}
            />

            <span className="text-sm font-medium">
              Showing {start}–{end} of {totalElements}
            </span>
          </div>

          {/* Right section: < 1 2 3 > circular buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Prev button */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-zinc-200 transition hover:bg-gray-200 dark:hover:bg-[#3F3F46] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page numbers */}
            {getPageNumbers(page, totalPages).map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-zinc-500 font-semibold text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition",
                    page === p
                      ? "bg-[#6C4CD8] text-white shadow-sm shadow-[#6C4CD8]/30 font-semibold"
                      : "bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-[#3F3F46]"
                  )}
                >
                  {p}
                </button>
              )
            )}

            {/* Next button */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-zinc-200 transition hover:bg-gray-200 dark:hover:bg-[#3F3F46] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}


