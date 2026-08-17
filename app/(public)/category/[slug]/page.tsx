"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ChevronsUpDown, Headphones, ShieldCheck, RotateCcw, LayoutGrid, List, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

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
  rating: number;
  reviews: number;
};
type ListItem = { title: string; price: number; img?: string };

/* ── local photos ────────────────────────────────────────────────────────── */
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

const CAT_TITLES = [
  "iPhone 12 Pro — Pacific Blue",
  "Premium Leather Tote Bag",
  "Women's Floral Summer Dress",
  "Rose Gold Square Watch",
  "Men's Classic White Sneakers",
  "Minimalist Canvas Backpack",
  "Pinstripe Wrap-Tie Blouse",
  "Wireless Headphones",
  "Smart LED Light Strip",
  "Stainless Steel Bottle 1L",
  "Women's Gold Earring Set",
  "Men's Slim Fit Polo Shirt",
  "Kids' Ceramic Bowl Set",
  "Men's Leather Belt — Brown",
  "Women's Casual Maxi Dress",
  "Layer Ankle Strap Sandals",
];

function makeProducts(offset: number, count = 4): Product[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: offset + i,
    slug: `product-${offset + i}`,
    title: CAT_TITLES[(offset + i - 1) % CAT_TITLES.length],
    image: PICS[(offset + i) % PICS.length],
    price: [399, 89, 45, 129, 79, 55, 39, 199, 35, 28, 210, 68, 24, 38, 55, 42][(offset + i - 1) % 16],
    oldPrice: [999, 139, 75, 199, 120, 85, 65, 299, 59, 45, 320, 110, 40, 65, 90, 70][(offset + i - 1) % 16],
    discount: 10,
    store: ["TechHub KH", "Leather Craft Co.", "Fashion By Srey", "Jewel & Co.", "Sneaker World", "Urban Carry", "Cider Fashion", "Sound Studio", "Smart Home KH", "Eco Life", "Gold Corner", "Men's Hub", "Kids Corner", "Belt Studio", "Style Srey", "Sole House"][(offset + i - 1) % 16],
    rating: 4.5,
    reviews: [248, 87, 312, 56, 194, 73, 421, 139, 28, 65, 183, 94, 47, 112, 76, 201][(offset + i - 1) % 16],
  }));
}

const ROW_A = makeProducts(1);
const ROW_B = makeProducts(5);
const ROW_C = makeProducts(9);
const ROW_D = makeProducts(13);

const TRENDING: ListItem[] = [
  { title: "Men's Fashion Product Shirt", price: 129, img: PICS[0] },
  { title: "Kid's Kitchen Product Bowl",  price: 24,  img: PICS[1] },
  { title: "Men's Leather Belt",          price: 38,  img: PICS[2] },
];
const TOP_RATED: ListItem[] = [
  { title: "Phsar Gold Earring",       price: 210, img: PICS[3] },
  { title: "Men's Straw Fitted Shirt", price: 68,  img: PICS[4] },
  { title: "Women's Casual Dress",     price: 55,  img: PICS[5] },
];
const TOP_SELLING: ListItem[] = [
  { title: "Layer Ankle Sandal",         price: 42, img: PICS[6] },
  { title: "Women's Ankle Boot Shoes",   price: 76, img: PICS[7] },
  { title: "Long Lasting Perfume",       price: 33, img: PICS[0] },
];

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ── ProductCard ─────────────────────────────────────────────────────────── */
function ProductCard({
  p, saved, onSave,
}: { p: Product; saved: boolean; onSave: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]">

      {/* image area */}
      <div className="relative aspect-[4/4] w-full overflow-hidden bg-[#F5F3FA]">
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes="(max-width:640px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.06]"
        />

        {/* discount badge */}
        <span className="absolute left-3 top-3 rounded-lg bg-[#6C4CD8] px-2.5 py-1 text-[13px] font-bold text-white shadow-md">
          -{p.discount}%
        </span>

        {/* wishlist button */}
        <button
          onClick={onSave}
          aria-label={saved ? "Remove from saved" : "Save"}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all",
            saved ? "bg-[#6C4CD8]" : "bg-white/95 hover:bg-[#F1EFFA]"
          )}
        >
          <Heart size={16} color={saved ? "#fff" : "#6C4CD8"} fill={saved ? "#fff" : "none"} />
        </button>

        {/* hover overlay — add to cart */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#6C4CD8] py-3 text-center transition-transform duration-300 group-hover:translate-y-0">
          <button className="flex w-full items-center justify-center gap-2 text-[14px] font-bold text-white">
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* info */}
      <div className="p-4">
        <Link
          href={`/products/${p.slug}`}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#241F35] transition-colors hover:text-[#6C4CD8]"
        >
          {p.title}
        </Link>

        {/* stars */}
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              fill={i < Math.floor(p.rating) ? "#F5B301" : "none"}
              color="#F5B301"
            />
          ))}
          <span className="ml-1 text-[13px] text-[#8B85A0]">({p.reviews})</span>
        </div>

        {/* price row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[18px] font-extrabold text-[#6C4CD8]">{usd(p.price)}</span>
          <span className="text-[13px] text-[#B3ADC4] line-through">{usd(p.oldPrice)}</span>
        </div>

        <p className="mt-1 text-[13px] text-[#8B85A0]">{p.store}</p>
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
      <div className="flex flex-col gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex gap-4 overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(36,31,53,0.08)] transition-all hover:shadow-[0_6px_20px_rgba(108,76,216,0.13)]"
          >
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-[#F5F3FA]">
              <Image src={p.image} alt={p.title} fill className="object-cover object-top" />
              <span className="absolute left-2 top-2 rounded-md bg-[#6C4CD8] px-2 py-0.5 text-[12px] font-bold text-white">
                -{p.discount}%
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center py-4 pr-4">
              <Link
                href={`/products/${p.slug}`}
                className="text-[16px] font-semibold text-[#241F35] hover:text-[#6C4CD8]"
              >
                {p.title}
              </Link>
              <div className="mt-1.5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} fill="#F5B301" color="#F5B301" />
                ))}
                <span className="ml-1 text-[13px] text-[#8B85A0]">({p.reviews})</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[18px] font-extrabold text-[#6C4CD8]">{usd(p.price)}</span>
                <span className="text-[13px] text-[#B3ADC4] line-through">{usd(p.oldPrice)}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-[#8B85A0]">{p.store}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* 2 cols mobile → 3 md → 4 lg — max 4 per row */
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
      <h3 className="mb-4 flex items-center gap-2 text-[18px] font-bold text-[#241F35]">
        <span className="h-5 w-1 rounded-full bg-[#6C4CD8]" />
        {title}
      </h3>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#F1EFFA]">
              {it.img && (
                <Image src={it.img} alt={it.title} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-snug text-[#3F3A52]">{it.title}</p>
              <p className="mt-0.5 text-[15px] font-bold text-[#6C4CD8]">{usd(it.price)}</p>
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
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [view, setView]   = useState<"grid" | "list">("grid");
  const [sort, setSort]   = useState("popular");
  const [page, setPage]   = useState(1);

  const toggleSave = (id: number) =>
    setSaved((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const categoryName = slug
    .replace(/-and-/g, " & ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#F6F5FA]">
      <div className="mx-auto max-w-[1240px] px-6 py-6">

        {/* ── breadcrumb ── */}
        <nav className="mb-5 flex items-center gap-1.5 text-[15px] text-[#8B85A0]">
          <Link href="/home" className="hover:text-[#6C4CD8]">Home</Link>
          <ChevronsUpDown size={13} />
          <Link href="/products" className="hover:text-[#6C4CD8]">Products</Link>
          <ChevronsUpDown size={13} />
          <span className="font-semibold text-[#241F35]">{categoryName}</span>
        </nav>

        {/* ── page title ── */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold text-[#1A1330]">{categoryName}</h1>
          <span className="text-[15px] text-[#8B85A0]">Showing 16 items</span>
        </div>

        {/* ── toolbar ── */}
        <div className="mb-6 flex items-center gap-4">
          {/* view toggle */}
          <div className="flex gap-1 rounded-xl border border-[#E2DFEC] bg-white p-1.5">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  view === v ? "bg-[#6C4CD8] text-white shadow-sm" : "text-[#8B85A0] hover:bg-[#F1EFFA]"
                )}
              >
                {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>

          <div className="h-px flex-1 bg-[#E5E2EC]" />

          {/* sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-[#E2DFEC] bg-white py-2.5 pl-4 pr-10 text-[15px] text-[#3F3A52] outline-none focus:border-[#6C4CD8]"
            >
              <option value="popular">Sort by</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronsUpDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B85A0]" />
          </div>
        </div>

        {/* ── rows A & B ── */}
        <ProductGrid products={ROW_A} saved={saved} onSave={toggleSave} view={view} />
        <div className="mt-5">
          <ProductGrid products={ROW_B} saved={saved} onSave={toggleSave} view={view} />
        </div>

        {/* ── pagination ── */}
        <div className="my-8 flex items-center justify-between text-[15px] text-[#8B85A0]">
          <span>Showing 1–8 of 16 item(s)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-[#E2DFEC] bg-white px-4 py-2 text-[14px] font-semibold text-[#3F3A52] disabled:opacity-40 hover:border-[#6C4CD8] hover:text-[#6C4CD8] transition-colors"
            >
              Prev
            </button>
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cn(
                  "h-9 w-9 rounded-xl text-[14px] font-bold transition-colors",
                  page === n
                    ? "bg-[#6C4CD8] text-white shadow-md"
                    : "border border-[#E2DFEC] bg-white text-[#3F3A52] hover:border-[#6C4CD8]"
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(2, p + 1))}
              disabled={page === 2}
              className="rounded-xl bg-[#6C4CD8] px-4 py-2 text-[14px] font-bold text-white disabled:opacity-40 hover:bg-[#5B3DC0] transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* ── promo banner ── */}
        <div className="mb-8 flex min-h-[200px] overflow-hidden rounded-2xl shadow-md">
          <div className="relative w-2/5 flex-shrink-0">
            <Image src={PICS[2]} alt="" fill className="object-cover" />
          </div>
          <div
            className="flex flex-1 flex-col justify-center px-10 py-8"
            style={{ background: "linear-gradient(135deg, #E8E4F8, #C9BAF2)" }}
          >
            <p className="text-[26px] font-extrabold leading-tight text-[#1A1330]">Shopping Today</p>
            <p className="text-[26px] font-extrabold leading-tight text-[#1A1330]">Fashion Sale</p>
            <p className="mt-2 text-[18px] text-[#5A5470]">30% off — Hurry up!</p>
            <button className="mt-5 self-start rounded-xl bg-[#6C4CD8] px-6 py-2.5 text-[15px] font-bold text-white hover:bg-[#5B3DC0] transition-colors">
              Shop Now
            </button>
          </div>
        </div>

        {/* ── trending / top rated / top selling ── */}
        <div className="mb-8 grid grid-cols-1 gap-8 rounded-2xl bg-white p-7 shadow-sm sm:grid-cols-3">
          <SideList title="Trending Items" items={TRENDING} />
          <SideList title="Top Rated"      items={TOP_RATED} />
          <SideList title="Top Selling"    items={TOP_SELLING} />
        </div>

        {/* ── service badges ── */}
        <div className="mb-8 flex flex-wrap justify-around gap-6 rounded-2xl bg-white px-8 py-7 shadow-sm">
          {[
            { Icon: Headphones,  title: "24/7 Support",   body: "Answer your questions 24 hours a day, 7 days a week." },
            { Icon: ShieldCheck, title: "Payment Secure", body: "We ensure secure payment with PEV." },
            { Icon: RotateCcw,   title: "30 Days Return", body: "Simply return it within 30 days for an exchange." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex max-w-[220px] flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1EFFA]">
                <Icon size={24} className="text-[#6C4CD8]" />
              </div>
              <p className="text-[18px] font-bold text-[#241F35]">{title}</p>
              <p className="mt-1 text-[14px] leading-snug text-[#8B85A0]">{body}</p>
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
            { img: PICS[5], title: "Men's Sport Shoes",  sub: "Sale Off" },
          ].map(({ img, title, sub }) => (
            <div key={title} className="relative min-h-[160px] overflow-hidden rounded-2xl">
              <Image src={img} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#EDE8FA]/95 via-[#EDE8FA]/65 to-transparent" />
              <div className="relative p-6">
                <p className="text-[20px] font-extrabold text-[#3B2A85]">{title}</p>
                <p className="mt-1 mb-4 text-[18px] font-bold text-[#6C4CD8]">{sub}</p>
                <button className="rounded-xl bg-[#6C4CD8] px-5 py-2 text-[14px] font-bold text-white hover:bg-[#5B3DC0] transition-colors">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── row D ── */}
        <div className="mb-10">
          <ProductGrid products={ROW_D} saved={saved} onSave={toggleSave} view={view} />
        </div>

      </div>
    </div>
  );
}
