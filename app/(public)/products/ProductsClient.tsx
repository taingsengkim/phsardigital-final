"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, List, ChevronDown, Heart, Star } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-products";

const BRAND  = "#6C4CD8";
const ACCENT = "#8FC93A";

const TOTAL  = 17;
const PER_PAGE = 10;
const PAGES  = Math.ceil(TOTAL / PER_PAGE);

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductsClient() {
  const [view, setView]   = useState<"grid" | "list">("grid");
  const [sort, setSort]   = useState("popular");
  const [page, setPage]   = useState(1);
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 16px" }}>
        {/* grid / list toggle */}
        <div
          style={{
            display: "flex", gap: 4,
            background: "#fff",
            border: "1px solid #E2DFEC",
            borderRadius: 8, padding: 3,
          }}
        >
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={v === "grid" ? "Grid view" : "List view"}
              style={{
                background: view === v ? BRAND : "transparent",
                border: "none",
                borderRadius: 6,
                width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {v === "grid"
                ? <LayoutGrid size={14} color={view === v ? "#fff" : "#8B85A0"} />
                : <List       size={14} color={view === v ? "#fff" : "#8B85A0"} />
              }
            </button>
          ))}
        </div>

        {/* divider */}
        <div style={{ flex: 1, height: 1, background: "#EDEBF3" }} />

        {/* sort select */}
        <div style={{ position: "relative" }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              appearance: "none",
              background: "#fff",
              border: "1px solid #E2DFEC",
              borderRadius: 8,
              padding: "8px 30px 8px 12px",
              fontSize: 13,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="popular">Sort by</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
          <ChevronDown
            size={13}
            color="#8B85A0"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
        </div>
      </div>

      {/* ── product grid / list ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(175px, 1fr))" : "1fr",
          gap: 16,
        }}
      >
        {MOCK_PRODUCTS.map((p) => {
          const isSaved = saved.has(p.id);
          return (
            <div
              key={p.id}
              style={{
                background: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(36,31,53,0.08)",
                display: view === "list" ? "flex" : "block",
                transition: "box-shadow .15s ease, transform .15s ease",
              }}
            >
              {/* image area */}
              <div
                style={{
                  position: "relative",
                  height: view === "list" ? 110 : 150,
                  width: view === "list" ? 140 : "auto",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width:640px) 50vw, 200px"
                  className="object-cover"
                  unoptimized={p.image.startsWith("http")}
                />
                {/* discount badge */}
                {p.discountPercent && (
                  <span
                    style={{
                      position: "absolute", top: 8, left: 8,
                      background: BRAND, color: "#fff",
                      fontSize: 10, fontWeight: 700,
                      padding: "3px 7px", borderRadius: 5,
                    }}
                  >
                    -{p.discountPercent}%
                  </span>
                )}
                {/* save button */}
                <button
                  onClick={() => toggleSave(p.id)}
                  aria-label={isSaved ? "Remove from saved" : "Save"}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(255,255,255,0.9)",
                    border: "none", borderRadius: 999,
                    width: 26, height: 26,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Heart size={12} fill={isSaved ? BRAND : "none"} color={BRAND} />
                </button>
              </div>

              {/* info */}
              <div style={{ padding: "10px 12px 12px", flex: 1 }}>
                <Link
                  href={`/products/${p.slug}`}
                  style={{ fontSize: 13, fontWeight: 600, color: "#241F35", textDecoration: "none", display: "block" }}
                >
                  {p.title}
                </Link>

                {/* prices */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#B3ADC4", textDecoration: "line-through" }}>
                    {usd(p.originalPrice)}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: BRAND }}>
                    {usd(p.price)}
                  </span>
                </div>

                {/* stars */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} fill="#F5B301" color="#F5B301" />
                  ))}
                  <span style={{ fontSize: 11, color: "#8B85A0" }}>({p.reviewCount})</span>
                </div>

                <p style={{ fontSize: 11, color: "#8B85A0", margin: "4px 0 0" }}>{p.storeName}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── pagination ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "22px 0 40px",
          fontSize: 13, color: "#8B85A0",
        }}
      >
        <span>Showing {start}–{end} of {TOTAL} item(s)</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              background: "#EDEBF3", border: "none",
              color: "#8B85A0", borderRadius: 6,
              padding: "6px 14px", fontSize: 12, cursor: "pointer",
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            Prev
          </button>
          {Array.from({ length: PAGES }).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  background: page === n ? ACCENT : "#EDEBF3",
                  border: "none",
                  color: page === n ? "#fff" : "#8B85A0",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: page === n ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(PAGES, p + 1))}
            disabled={page === PAGES}
            style={{
              background: ACCENT, border: "none",
              color: "#fff", borderRadius: 6,
              padding: "6px 14px", fontSize: 12, cursor: "pointer",
              opacity: page === PAGES ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
