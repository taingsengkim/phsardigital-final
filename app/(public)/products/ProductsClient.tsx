"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, List, ChevronDown, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/mock-products";

const TOTAL    = MOCK_PRODUCTS.length;
const PER_PAGE = 8;
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

  /* sort */
  const sorted = [...MOCK_PRODUCTS].sort((a, b) => {
    if (sort === "priceAsc")  return a.price - b.price;
    if (sort === "priceDesc") return b.price - a.price;
    if (sort === "newest")    return b.id - a.id;
    return b.reviewCount - a.reviewCount; // popular
  });

  /* paginate */
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const start = (page - 1) * PER_PAGE + 1;
  const end   = Math.min(page * PER_PAGE, TOTAL);

  return (
    <>
      {/* ── toolbar ── */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-[#E2DFEC] bg-white p-1">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={v === "grid" ? "Grid view" : "List view"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                view === v ? "bg-[#6C4CD8] text-white" : "text-[#8B85A0] hover:bg-[#F1EFFA]"
              )}
            >
              {v === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>

        <div className="h-px flex-1 bg-[#E5E2EC]" />

        <span className="text-[14px] text-[#8B85A0]">{TOTAL} products</span>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="appearance-none rounded-xl border border-[#E2DFEC] bg-white py-2.5 pl-4 pr-9 text-[14px] text-[#3F3A52] outline-none focus:border-[#6C4CD8]"
          >
            <option value="popular">Most Popular</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B85A0]" />
        </div>
      </div>

      {/* ── grid ── */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {paginated.map((p) => {
            const isSaved = saved.has(p.id);
            return (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3FA]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  {p.discountPercent && (
                    <span className="absolute left-3 top-3 rounded-lg bg-[#6C4CD8] px-2.5 py-1 text-[13px] font-bold text-white shadow-sm">
                      -{p.discountPercent}%
                    </span>
                  )}
                  <button
                    onClick={() => toggleSave(p.id)}
                    aria-label={isSaved ? "Remove from saved" : "Save"}
                    className={cn(
                      "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all",
                      isSaved ? "bg-[#6C4CD8]" : "bg-white/95 hover:bg-[#F1EFFA]"
                    )}
                  >
                    <Heart size={16} color={isSaved ? "#fff" : "#6C4CD8"} fill={isSaved ? "#fff" : "none"} />
                  </button>
                </div>

                <div className="p-4">
                  <Link
                    href={`/products/${p.slug}`}
                    className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#241F35] transition-colors hover:text-[#6C4CD8]"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill="#F5B301" color="#F5B301" />
                    ))}
                    <span className="ml-1 text-[13px] text-[#8B85A0]">({p.reviewCount})</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[18px] font-extrabold text-[#6C4CD8]">{usd(p.price)}</span>
                    <span className="text-[13px] text-[#B3ADC4] line-through">{usd(p.originalPrice)}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-[#8B85A0]">{p.storeName}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ── list view ── */
        <div className="flex flex-col gap-3">
          {paginated.map((p) => {
            const isSaved = saved.has(p.id);
            return (
              <div
                key={p.id}
                className="flex gap-4 overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(36,31,53,0.08)]"
              >
                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-[#F5F3FA]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                  {p.discountPercent && (
                    <span className="absolute left-2 top-2 rounded bg-[#6C4CD8] px-1.5 py-0.5 text-[11px] font-bold text-white">
                      -{p.discountPercent}%
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center py-4 pr-4">
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-[15px] font-semibold text-[#241F35] hover:text-[#6C4CD8]"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} fill="#F5B301" color="#F5B301" />
                    ))}
                    <span className="ml-1 text-[13px] text-[#8B85A0]">({p.reviewCount})</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-[18px] font-extrabold text-[#6C4CD8]">{usd(p.price)}</span>
                    <span className="text-[13px] text-[#B3ADC4] line-through">{usd(p.originalPrice)}</span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-[#8B85A0]">{p.storeName}</p>
                </div>
                <button
                  onClick={() => toggleSave(p.id)}
                  aria-label={isSaved ? "Remove from saved" : "Save"}
                  className="mr-4 self-center flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DFEC] bg-white transition hover:border-[#6C4CD8]"
                >
                  <Heart size={15} color="#6C4CD8" fill={isSaved ? "#6C4CD8" : "none"} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── pagination ── */}
      <div className="mt-8 mb-10 flex items-center justify-between text-[14px] text-[#8B85A0]">
        <span>Showing {start}–{end} of {TOTAL} items</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-[#E2DFEC] bg-white px-4 py-2 font-semibold text-[#3F3A52] disabled:opacity-40 hover:border-[#6C4CD8] hover:text-[#6C4CD8] transition-colors"
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
                  "h-9 w-9 rounded-xl font-bold transition-colors",
                  page === n
                    ? "bg-[#6C4CD8] text-white shadow-sm"
                    : "border border-[#E2DFEC] bg-white text-[#3F3A52] hover:border-[#6C4CD8]"
                )}
              >
                {n}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(PAGES, p + 1))}
            disabled={page === PAGES}
            className="rounded-xl bg-[#6C4CD8] px-4 py-2 font-bold text-white disabled:opacity-40 hover:bg-[#5B3DC0] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
