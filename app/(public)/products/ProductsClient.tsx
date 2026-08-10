"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, List, ChevronDown, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/mock-products";

const TOTAL    = 17;
const PER_PAGE = 10;
const PAGES    = Math.ceil(TOTAL / PER_PAGE);

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductsClient() {
  const [view,  setView]  = useState<"grid" | "list">("grid");
  const [sort,  setSort]  = useState("popular");
  const [page,  setPage]  = useState(1);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  function toggleSave(id: number) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const start = (page - 1) * PER_PAGE + 1;
  const end   = Math.min(page * PER_PAGE, TOTAL);

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
              {v === "grid"
                ? <LayoutGrid size={14} />
                : <List       size={14} />
              }
            </button>
          ))}
        </div>

        {/* divider */}
        <div className="h-px flex-1 bg-[#E5E2EC]" />

        {/* sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-lg border border-[#E2DFEC] bg-white py-2 pl-3 pr-8 text-[12px] text-[#3F3A52] outline-none focus:border-[#6C4CD8]"
          >
            <option value="popular">Sort by</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B85A0]"
          />
        </div>
      </div>

      {/* ── product grid ── */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {MOCK_PRODUCTS.map((p) => {
            const isSaved = saved.has(p.id);
            return (
              <article
                key={p.id}
                className="group overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.08)] transition-all hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(108,76,216,0.14)]"
              >
                {/* image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F3FA]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width:640px) 50vw, 200px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
                    unoptimized={p.image.startsWith("http")}
                  />
                  {/* discount badge */}
                  {p.discountPercent && (
                    <span className="absolute left-2 top-2 rounded-[5px] bg-[#6C4CD8] px-[7px] py-[3px] text-[10px] font-bold text-white">
                      -{p.discountPercent}%
                    </span>
                  )}
                  {/* save button */}
                  <button
                    onClick={() => toggleSave(p.id)}
                    aria-label={isSaved ? "Remove from saved" : "Save"}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110"
                  >
                    <Heart
                      size={13}
                      color="#6C4CD8"
                      fill={isSaved ? "#6C4CD8" : "none"}
                    />
                  </button>
                </div>

                {/* info */}
                <div className="p-2.5">
                  <Link
                    href={`/products/${p.slug}`}
                    className="line-clamp-2 text-sm font-semibold text-[#241F35] hover:text-[#6C4CD8]"
                  >
                    {p.title}
                  </Link>

                  {/* prices */}
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xs text-[#B3ADC4] line-through">
                      {usd(p.originalPrice)}
                    </span>
                    <span className="text-base font-bold text-[#6C4CD8]">
                      {usd(p.price)}
                    </span>
                  </div>

                  {/* stars */}
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} fill="#F5B301" color="#F5B301" />
                    ))}
                    <span className="ml-1 text-xs text-[#8B85A0]">
                      ({p.reviewCount})
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-[#8B85A0]">
                    {p.storeName}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ── list view ── */
        <div className="flex flex-col gap-3">
          {MOCK_PRODUCTS.map((p) => {
            const isSaved = saved.has(p.id);
            return (
              <div
                key={p.id}
                className="flex gap-3 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.08)]"
              >
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden bg-[#F5F3FA]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover object-center"
                    unoptimized={p.image.startsWith("http")}
                  />
                  {p.discountPercent && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-[#6C4CD8] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      -{p.discountPercent}%
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center py-3 pr-3">
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-sm font-semibold text-[#241F35] hover:text-[#6C4CD8]"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs text-[#B3ADC4] line-through">
                      {usd(p.originalPrice)}
                    </span>
                    <span className="text-base font-bold text-[#6C4CD8]">
                      {usd(p.price)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} fill="#F5B301" color="#F5B301" />
                    ))}
                    <span className="ml-1 text-xs text-[#8B85A0]">
                      ({p.reviewCount})
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#8B85A0]">{p.storeName}</p>
                </div>
                <button
                  onClick={() => toggleSave(p.id)}
                  aria-label={isSaved ? "Remove from saved" : "Save"}
                  className="mr-3 self-center flex h-8 w-8 items-center justify-center rounded-full border border-[#E2DFEC] bg-white transition hover:border-[#6C4CD8]"
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
      <div className="mt-6 mb-10 flex items-center justify-between text-[12px] text-[#8B85A0]">
        <span>Showing {start}–{end} of {TOTAL} item(s)</span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md bg-[#EDEBF3] px-3 py-1.5 text-[11px] font-medium text-[#8B85A0] transition hover:bg-[#E0DCF0] disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: PAGES }).map((_, i) => {
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
            onClick={() => setPage((p) => Math.min(PAGES, p + 1))}
            disabled={page === PAGES}
            className="rounded-md bg-[#8FC93A] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#7AB82E] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
