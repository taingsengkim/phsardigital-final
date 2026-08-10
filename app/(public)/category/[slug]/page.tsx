"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Star, ChevronRight, Headphones, ShieldCheck,
  RotateCcw, LayoutGrid, List, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryIconRow from "@/app/(public)/products/CategoryIconRow";

/* ── types ──────────────────────────────────────────────────────────────── */
type Product = {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  store: string;
};
type ListItem = { title: string; price: number; img?: string };

/* ── local photos —  /public/picture/pic1.jpg … pic8.jpg ────────────────── */
const PICS = [
  "/picture/pic1.jpg",
  "/picture/pic2.jpg",
  "/picture/pic3.jpg",
  "/picture/pic4.jpg",
  "/picture/pic5.jpg",
  "/picture/pic6.jpg",
  "/picture/pic7.jpg",
  "/picture/pic8.jpg",
];

function makeProducts(offset: number, count = 5): Product[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: offset + i,
    slug: `product-${offset + i}`,
    title: i === 1 ? "MacBook z" : "MacBook Laptops",
    image: PICS[(offset + i) % PICS.length],
    price: 399,
    oldPrice: 1399,
    discount: 10,
    store: "Store Name",
  }));
}

const ROW_A = makeProducts(1);
const ROW_B = makeProducts(6);
const ROW_C = makeProducts(11);
const ROW_D = makeProducts(16);

const TRENDING: ListItem[] = [
  { title: "Men's Fashion Product Shirt", price: 129, img: PICS[0] },
  { title: "Kid's Kitchen Product Bowl", price: 24, img: PICS[1] },
  { title: "Men's Leather Belt", price: 38, img: PICS[2] },
];
const TOP_RATED: ListItem[] = [
  { title: "Phsar Gold Earring", price: 210, img: PICS[3] },
  { title: "Men's Straw Fitted Shirt", price: 68, img: PICS[4] },
  { title: "Women's Casual Dress", price: 55, img: PICS[5] },
];
const TOP_SELLING: ListItem[] = [
  { title: "Layer Ankle Sandal", price: 42, img: PICS[6] },
  { title: "Women's Ankle Boot Shoes", price: 76, img: PICS[7] },
  { title: "Long Lasting Perfume", price: 33, img: PICS[0] },
];

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ── ProductCard ─────────────────────────────────────────────────────────── */
function ProductCard({
  p, saved, onSave,
}: { p: Product; saved: boolean; onSave: () => void }) {
  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.09)] transition-all hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(108,76,216,0.15)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F3FA]">
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes="(max-width:640px) 50vw, 200px"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute left-2 top-2 rounded-[5px] bg-[#6C4CD8] px-[7px] py-[3px] text-[10px] font-bold text-white">
          -{p.discount}%
        </span>
        <button
          onClick={onSave}
          aria-label={saved ? "Remove from saved" : "Save"}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <Heart size={13} color="#6C4CD8" fill={saved ? "#6C4CD8" : "none"} />
        </button>
      </div>
      <div className="p-3">
        <Link
          href={`/products/${p.slug}`}
          className="line-clamp-2 text-[12.5px] font-semibold text-[#241F35] hover:text-[#6C4CD8]"
        >
          {p.title}
        </Link>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[11px] text-[#B3ADC4] line-through">{usd(p.oldPrice)}</span>
          <span className="text-[14px] font-bold text-[#6C4CD8]">{usd(p.price)}</span>
        </div>
        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={9} fill="#F5B301" color="#F5B301" />
          ))}
          <span className="ml-1 text-[10px] text-[#8B85A0]">(1)</span>
        </div>
        <p className="mt-0.5 text-[10px] text-[#8B85A0]">{p.store}</p>
      </div>
    </div>
  );
}

/* ── ProductGrid ─────────────────────────────────────────────────────────── */
function ProductGrid({
  products, saved, onSave, view,
}: { products: Product[]; saved: Set<number>; onSave: (id: number) => void; view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(36,31,53,0.09)]"
          >
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-[#F5F3FA]">
              <Image src={p.image} alt={p.title} fill className="object-cover object-top" />
              <span className="absolute left-1.5 top-1.5 rounded bg-[#6C4CD8] px-1.5 py-0.5 text-[9px] font-bold text-white">
                -{p.discount}%
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center p-3">
              <Link href={`/products/${p.slug}`} className="text-[13px] font-semibold text-[#241F35] hover:text-[#6C4CD8]">
                {p.title}
              </Link>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[11px] text-[#B3ADC4] line-through">{usd(p.oldPrice)}</span>
                <span className="text-[13px] font-bold text-[#6C4CD8]">{usd(p.price)}</span>
              </div>
              <div className="mt-1 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={9} fill="#F5B301" color="#F5B301" />)}
                <span className="ml-1 text-[10px] text-[#8B85A0]">(1)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} saved={saved.has(p.id)} onSave={() => onSave(p.id)} />
      ))}
    </div>
  );
}

/* ── SideList ────────────────────────────────────────────────────────────── */
function SideList({ title, items }: { title: string; items: ListItem[] }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1 text-[13px] font-bold text-[#241F35]">
        <ChevronRight size={12} className="text-[#6C4CD8]" /> {title}
      </h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#F1EFFA]">
              {it.img && (
                <Image src={it.img} alt={it.title} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="text-[11.5px] font-medium leading-tight text-[#3F3A52]">{it.title}</p>
              <p className="mt-0.5 text-[12px] font-bold text-[#6C4CD8]">{usd(it.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [saved, setSaved]   = useState<Set<number>>(new Set());
  const [view, setView]     = useState<"grid" | "list">("grid");
  const [sort, setSort]     = useState("popular");
  const [page, setPage]     = useState(1);

  const toggleSave = (id: number) =>
    setSaved((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const categoryName = slug
    .replace(/-and-/g, " & ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#F6F5FA]">

      {/* ── category icon row (same as products page) ── */}
      <CategoryIconRow />

      <div className="mx-auto max-w-[1240px] px-6 py-4">

        {/* ── breadcrumb ── */}
        <nav className="mb-4 flex items-center gap-1 text-[11px] text-[#8B85A0]">
          <Link href="/home" className="hover:text-[#6C4CD8]">Home</Link>
          <ChevronRight size={10} />
          <Link href="/products" className="hover:text-[#6C4CD8]">Products</Link>
          <ChevronRight size={10} />
          <span className="font-semibold text-[#241F35]">{categoryName}</span>
        </nav>

        {/* ── toolbar ── */}
        <div className="mb-4 flex items-center gap-3">
          {/* view toggle */}
          <div className="flex gap-1 rounded-lg border border-[#E2DFEC] bg-white p-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  view === v ? "bg-[#6C4CD8] text-white" : "text-[#8B85A0] hover:bg-[#F1EFFA]"
                )}
              >
                {v === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>

          <div className="flex-1 h-px bg-[#E5E2EC]" />

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
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B85A0]" />
          </div>
        </div>

        {/* ── row A ── */}
        <ProductGrid products={ROW_A} saved={saved} onSave={toggleSave} view={view} />

        {/* ── row B ── */}
        <div className="mt-3">
          <ProductGrid products={ROW_B} saved={saved} onSave={toggleSave} view={view} />
        </div>

        {/* ── pagination ── */}
        <div className="my-5 flex items-center justify-between text-[12px] text-[#8B85A0]">
          <span>Showing 1–10 of 17 item(s)</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md bg-[#EDEBF3] px-3 py-1 text-[11px] disabled:opacity-40"
            >
              Prev
            </button>
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-semibold",
                  page === n ? "bg-[#8FC93A] text-white" : "bg-[#EDEBF3] text-[#8B85A0]"
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(2, p + 1))}
              disabled={page === 2}
              className="rounded-md bg-[#8FC93A] px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {/* ── promo banner ── */}
        <div className="mb-8 flex min-h-[180px] overflow-hidden rounded-2xl">
          <div className="relative w-2/5 flex-shrink-0">
            <Image src={PICS[2]} alt="" fill className="object-cover" />
          </div>
          <div
            className="flex flex-1 flex-col justify-center px-8 py-7"
            style={{ background: "linear-gradient(135deg, #E8E4F8, #C9BAF2)" }}
          >
            <p className="text-[22px] font-extrabold leading-tight text-[#1A1330]">Shopping Today</p>
            <p className="text-[22px] font-extrabold leading-tight text-[#1A1330]">Fashion sale</p>
            <p className="mt-2 text-[13px] text-[#5A5470]">30% off — Hurry up!!!</p>
            <button className="mt-4 self-start rounded-lg bg-[#6C4CD8] px-5 py-2 text-[12px] font-bold text-white hover:bg-[#5B3DC0] transition-colors">
              Shop now
            </button>
          </div>
        </div>

        {/* ── trending / top rated / top selling ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-3">
          <SideList title="Trending Items" items={TRENDING} />
          <SideList title="Top Rated"      items={TOP_RATED} />
          <SideList title="Top Selling"    items={TOP_SELLING} />
        </div>

        {/* ── service badges ── */}
        <div className="mb-8 flex flex-wrap justify-around gap-6 rounded-2xl bg-white px-6 py-5 shadow-sm">
          {[
            { Icon: Headphones,  title: "24/7 Support",   body: "Answer your questions 24 hours a day, 7 days a week." },
            { Icon: ShieldCheck, title: "Payment Secure", body: "We ensure secure payment with PEV." },
            { Icon: RotateCcw,   title: "30 Days Return", body: "Simply return it within 30 days for an exchange." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex max-w-[200px] flex-col items-center text-center">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#F1EFFA]">
                <Icon size={20} className="text-[#6C4CD8]" />
              </div>
              <p className="text-[12.5px] font-bold text-[#241F35]">{title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#8B85A0]">{body}</p>
            </div>
          ))}
        </div>

        {/* ── row C ── */}
        <div className="mb-6">
          <ProductGrid products={ROW_C} saved={saved} onSave={toggleSave} view={view} />
        </div>

        {/* ── two split promo banners ── */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { img: PICS[4], title: "Digital Smartwatch", sub: "30% Off" },
            { img: PICS[5], title: "Men's Sport Shoes",  sub: "Sale off" },
          ].map(({ img, title, sub }) => (
            <div
              key={title}
              className="relative min-h-[140px] overflow-hidden rounded-xl"
            >
              <Image src={img} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#EDE8FA]/92 via-[#EDE8FA]/60 to-transparent" />
              <div className="relative p-5">
                <p className="text-[16px] font-bold text-[#3B2A85]">{title}</p>
                <p className="mt-1 mb-3 text-[12px] font-bold text-[#6C4CD8]">{sub}</p>
                <button className="rounded-lg bg-[#6C4CD8] px-4 py-1.5 text-[11px] font-bold text-white hover:bg-[#5B3DC0] transition-colors">
                  Shop now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── row D ── */}
        <div className="mb-8">
          <ProductGrid products={ROW_D} saved={saved} onSave={toggleSave} view={view} />
        </div>

      </div>
    </div>
  );
}