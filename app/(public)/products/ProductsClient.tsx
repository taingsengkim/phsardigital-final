"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetListingsQuery } from "@/lib/api/homeApi";
import { ProductCard } from "@/app/(public)/home/ProductCard";
import { getPrimaryImage } from "@/app/(public)/home/listing-helpers";
import { useLanguage } from "@/lib/context/LanguageContext";
import { getCategoryTranslation } from "@/lib/i18n/translations";

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
  const { t } = useLanguage();
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
        className="flex h-9.5 items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-[#F4F4F6] dark:bg-[#18181B] px-4 py-2 text-xs sm:text-sm font-semibold text-[#1A1330] dark:text-white transition hover:bg-gray-200 dark:hover:bg-[#27272A] focus:outline-none shadow-xs cursor-pointer"
      >
        <span>{value} {t("rows_per_page")}</span>
        <ChevronDown size={16} className={cn("text-gray-500 dark:text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[135px] overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#18181B] py-2 shadow-xl shadow-black/20 animate-in fade-in-0 zoom-in-95">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-medium transition text-left cursor-pointer",
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
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL search params
  const categorySlug = searchParams.get("category") || searchParams.get("categorySlug") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const initialSort = searchParams.get("sort") || "popular";
  const initialPageSize = Number(searchParams.get("pageSize") || searchParams.get("size")) || 75;

  // Local state
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [minPriceInput, setMinPriceInput] = useState(initialMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(initialMaxPrice);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState(initialSort);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});

  // Synchronize local search input with URL search param changes
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setMinPriceInput(searchParams.get("minPrice") || "");
    setMaxPriceInput(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Helper to push URL params
  const updateUrlParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === "") {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      // Reset page to 1 when filters change
      if (!updates.hasOwnProperty("page")) {
        params.delete("page");
        setPage(1);
      }

      const queryString = params.toString();
      const newPath = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.replace(newPath, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounced search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlSearch = searchParams.get("search") || "";
      if (searchInput !== currentUrlSearch) {
        updateUrlParams({ search: searchInput || null });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, updateUrlParams]);

  // Map sort UI selection to backend query
  const mappedSort =
    sort === "price_asc" || sort === "priceAsc"
      ? "fullPrice,asc"
      : sort === "price_desc" || sort === "priceDesc"
        ? "fullPrice,desc"
        : sort === "newest"
          ? "createdAt,desc"
          : undefined;

  const minPriceNum = minPriceInput ? Number(minPriceInput) : undefined;
  const maxPriceNum = maxPriceInput ? Number(maxPriceInput) : undefined;

  const { data: apiData, isLoading } = useGetListingsQuery({
    categorySlug: categorySlug || undefined,
    search: searchInput.trim() || undefined,
    minPrice: minPriceNum && !isNaN(minPriceNum) ? minPriceNum : undefined,
    maxPrice: maxPriceNum && !isNaN(maxPriceNum) ? maxPriceNum : undefined,
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

  const handleApplyPriceFilter = () => {
    updateUrlParams({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
  };

  const handleQuickPriceRange = (min: number | null, max: number | null) => {
    const newMin = min !== null ? String(min) : "";
    const newMax = max !== null ? String(max) : "";
    setMinPriceInput(newMin);
    setMaxPriceInput(newMax);
    updateUrlParams({
      minPrice: newMin || null,
      maxPrice: newMax || null,
    });
  };

  const handleClearAllFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setSort("popular");
    router.replace(pathname, { scroll: false });
  };

  const displayItems = apiListings;
  const start = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, Math.max(totalElements, displayItems.length));

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateUrlParams({ pageSize: newSize });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    updateUrlParams({ sort: newSort });
  };

  const hasActiveFilters = Boolean(
    categorySlug || searchInput || minPriceInput || maxPriceInput
  );

  return (
    <>
      {/* ── SEARCH & FILTER CONTROLS BAR ── */}
      <div className="mb-6 rounded-2xl border border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-[#120F1D] p-4 sm:p-5 shadow-sm transition-all">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-[#1A1429] py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none transition focus:border-[#6C4CD8] focus:bg-white dark:focus:bg-[#1A1429] focus:ring-4 focus:ring-[#6C4CD8]/15"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateUrlParams({ search: null });
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Right Action Controls: Price filter toggle & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Price Filter Button Toggle */}
            <button
              type="button"
              onClick={() => setShowPriceFilter((prev) => !prev)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl border px-4 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs",
                minPriceInput || maxPriceInput || showPriceFilter
                  ? "border-[#6C4CD8] bg-[#6C4CD8]/10 text-[#6C4CD8] dark:bg-[#6C4CD8]/20 dark:text-purple-300"
                  : "border-gray-200 dark:border-zinc-800 bg-[#F4F4F6] dark:bg-[#18181B] text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-[#27272A]"
              )}
            >
              <SlidersHorizontal size={15} />
              <span>{t("price_filter")}</span>
              {(minPriceInput || maxPriceInput) && (
                <span className="flex size-2 rounded-full bg-[#6C4CD8]" />
              )}
            </button>

            {/* Grid / List View Toggle */}
            <div className="flex h-10 gap-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-[#F4F4F6] dark:bg-[#18181B] p-1">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-label={v === "grid" ? "Grid view" : "List view"}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
                    view === v
                      ? "bg-[#6C4CD8] text-white shadow-xs"
                      : "text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
                  )}
                >
                  {v === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label="Sort order"
                className="h-10 appearance-none rounded-xl border border-gray-200 dark:border-zinc-800 bg-[#F4F4F6] dark:bg-[#18181B] py-2 pl-3.5 pr-9 text-xs sm:text-sm font-semibold text-[#1A1330] dark:text-white outline-none focus:border-[#6C4CD8] focus:ring-2 focus:ring-[#6C4CD8]/20 transition cursor-pointer hover:bg-gray-200 dark:hover:bg-[#27272A]"
              >
                <option value="popular">{t("sort_popular")}</option>
                <option value="price_asc">{t("sort_price_asc")}</option>
                <option value="price_desc">{t("sort_price_desc")}</option>
                <option value="newest">{t("sort_newest")}</option>
              </select>
              <ChevronsUpDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Expandable Price Filter Panel */}
        {showPriceFilter && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80 animate-in fade-in-0 zoom-in-95">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">{t("price_range")}:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder={t("min_price")}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-24 sm:w-28 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-[#1A1429] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-[#6C4CD8]"
                  />
                  <span className="text-gray-400 font-bold">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={t("max_price")}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-24 sm:w-28 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-[#1A1429] px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-[#6C4CD8]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPriceFilter}
                    className="rounded-lg bg-[#6C4CD8] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#5B3EC4] cursor-pointer"
                  >
                    {t("apply")}
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 mr-1">{t("presets")}:</span>
                {[
                  { label: t("preset_under_25"), min: null, max: 25 },
                  { label: t("preset_25_50"), min: 25, max: 50 },
                  { label: t("preset_50_100"), min: 50, max: 100 },
                  { label: t("preset_over_100"), min: 100, max: null },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQuickPriceRange(preset.min, preset.max)}
                    className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-zinc-300 hover:bg-[#6C4CD8]/10 hover:text-[#6C4CD8] transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE FILTERS CHIPS BAR */}
        {hasActiveFilters && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Filter size={12} /> {t("active_filters")}:
            </span>

            {/* Category Filter Badge */}
            {categorySlug && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CD8]/10 dark:bg-[#6C4CD8]/20 px-3 py-1 text-xs font-bold text-[#6C4CD8] dark:text-purple-300">
                <Tag size={12} />
                <span>{getCategoryTranslation(categorySlug, language)}</span>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ category: null, categorySlug: null })}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {/* Search Query Badge */}
            {searchInput && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CD8]/10 dark:bg-[#6C4CD8]/20 px-3 py-1 text-xs font-bold text-[#6C4CD8] dark:text-purple-300">
                <Search size={12} />
                <span>"{searchInput}"</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrlParams({ search: null });
                  }}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {/* Price Range Badge */}
            {(minPriceInput || maxPriceInput) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6C4CD8]/10 dark:bg-[#6C4CD8]/20 px-3 py-1 text-xs font-bold text-[#6C4CD8] dark:text-purple-300">
                <span>{minPriceInput ? `$${minPriceInput}` : "$0"} – {maxPriceInput ? `$${maxPriceInput}` : "Any"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput("");
                    setMaxPriceInput("");
                    updateUrlParams({ minPrice: null, maxPrice: null });
                  }}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{t("reset_all")}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── LOADING STATE ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="size-8 animate-spin text-[#6C4CD8] mb-3" />
          <p className="text-sm font-semibold text-[#3F3A52] dark:text-zinc-300">{t("searching_products")}</p>
        </div>
      ) : displayItems.length === 0 ? (
        /* ── EMPTY STATE ── */
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-[#120F1D] p-12 text-center border border-[#EDEBF3] dark:border-zinc-800">
          <PackageX className="size-12 text-[#6C4CD8]/40 mb-3" />
          <h3 className="text-base font-extrabold text-[#1A1330] dark:text-white">{t("no_products_found")}</h3>
          <p className="mt-1 text-xs text-[#8B85A0] dark:text-zinc-400 max-w-sm">
            {t("no_products_desc")}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6C4CD8] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#5B3EC4] cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{t("reset_all")}</span>
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        /* ── PRODUCT GRID VIEW ── */
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 font-sans">
          {displayItems.map((item: any, index: number) => (
            <ProductCard
              key={item.uuid || item.id || index}
              listing={item}
            />
          ))}
        </div>
      ) : (
        /* ── PRODUCT LIST VIEW ── */
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
                className="group relative flex gap-3 overflow-hidden rounded-xl bg-white dark:bg-[#120F1D] border border-gray-100 dark:border-zinc-800 shadow-[0_1px_4px_rgba(36,31,53,0.08)] transition hover:shadow-md"
              >
                <Link href={`/products/${targetUuid}`} className="flex flex-1 gap-3">
                  <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden bg-[#F5F3FA] dark:bg-zinc-800">
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
                    <h3 className="text-sm font-semibold text-[#241F35] dark:text-white transition-colors group-hover:text-[#6C4CD8]">
                      {title}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-[#6C4CD8]">{usd(price)}</span>
                      {originalPrice && (
                        <span className="text-xs text-[#B3ADC4] dark:text-zinc-500 line-through">
                          {usd(originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} fill="#F5B301" color="#F5B301" />
                      ))}
                      <span className="ml-1 text-xs text-[#8B85A0] dark:text-zinc-400">({reviewCount})</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#8B85A0] dark:text-zinc-400">{storeName}</p>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(itemUuid, isSaved);
                  }}
                  aria-label={isSaved ? "Remove from saved" : "Save"}
                  className="mr-3 self-center z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E2DFEC] dark:border-zinc-700 bg-white dark:bg-zinc-800 transition hover:border-[#6C4CD8] cursor-pointer"
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

      {/* ── PAGINATION BAR ── */}
      {!isLoading && displayItems.length > 0 && (
        <div className="mt-10 mb-12 flex flex-col sm:flex-row items-center justify-between gap-5 py-3 text-sm font-sans border-t border-gray-100 dark:border-zinc-800/80 pt-7">
          {/* Left section: Rows per page & showing count */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 text-gray-600 dark:text-zinc-400">
            <PageSizeDropdown
              value={pageSize}
              onChange={handlePageSizeChange}
              options={[15, 30, 50, 75, 100, 150]}
            />

            <span className="text-xs sm:text-sm font-medium">
              {t("showing_count", { start, end, total: totalElements })}
            </span>
          </div>

          {/* Right section: < 1 2 3 > circular buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => {
                const p = Math.max(1, page - 1);
                setPage(p);
                updateUrlParams({ page: p });
              }}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-zinc-200 transition hover:bg-gray-200 dark:hover:bg-[#3F3F46] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {getPageNumbers(page, totalPages).map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-zinc-500 font-semibold text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p as number);
                    updateUrlParams({ page: p as number });
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition cursor-pointer",
                    page === p
                      ? "bg-[#6C4CD8] text-white shadow-xs shadow-[#6C4CD8]/30 font-semibold"
                      : "bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-[#3F3F46]"
                  )}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => {
                const p = Math.min(totalPages, page + 1);
                setPage(p);
                updateUrlParams({ page: p });
              }}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-zinc-200 transition hover:bg-gray-200 dark:hover:bg-[#3F3F46] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
