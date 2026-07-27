"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Star, ChevronRight, Headphones, ShieldCheck, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────── */
type Product = {
  id: number;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  store: string;
};

type ListItem = { title: string; price: number };

/* ─────────────────────────────────────────────────────────────────────────
   Static mock data
   ───────────────────────────────────────────────────────────────────────── */
const IMAGES = [
  "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=300&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&q=80",
  "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300&q=80",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&q=80",
  "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=300&q=80",
];

function makeRow(offset: number): Product[] {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: offset + i,
    title: i === 1 ? "MacBook z" : "MacBook Laptops",
    image: IMAGES[(i + offset) % IMAGES.length],
    price: 399,
    oldPrice: 1399,
    discount: 10,
    store: "Store1Name",
  }));
}

const ROW_1 = makeRow(1);
const ROW_2 = makeRow(6);
const ROW_3 = makeRow(11);

const TRENDING: ListItem[] = [
  { title: "Men's Fashion Product Shirt", price: 129 },
  { title: "Kid's Kitchen Product Bowl",  price: 24  },
  { title: "Men's Leather Belt",          price: 38  },
];
const TOP_RATED: ListItem[] = [
  { title: "Phsar Gold Earring",       price: 210 },
  { title: "Men's Straw Fitted Shirt", price: 68  },
  { title: "Women's Casual Dress",     price: 55  },
];
const TOP_SELLING: ListItem[] = [
  { title: "Layer Ankle Sandal",        price: 42 },
  { title: "Women's Ankle Boot Shoes",  price: 76 },
  { title: "Long Lasting Perfume",      price: 33 },
];

const SERVICES = [
  { Icon: Headphones,  title: "24/7 Support",    body: "Dedicated to answer your questions 24 hours a day, 7 days a week." },
  { Icon: ShieldCheck, title: "Payment Secure",  body: "We ensure secure payment with PEV." },
  { Icon: RotateCcw,   title: "30 Days Return",  body: "Simply return it within 30 days for an exchange." },
];

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ─────────────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────────────── */
function ProductCard({
  p,
  saved,
  toggleSave,
}: {
  p: Product;
  saved: Set<number>;
  toggleSave: (id: number) => void;
}) {
  const isSaved = saved.has(p.id);
  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(36,31,53,0.08)] transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(36,31,53,0.14)]">
      {/* image */}
      <div className="relative h-[150px] w-full overflow-hidden bg-[#EDEBF3]">
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes="200px"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        {/* discount badge */}
        <span className="absolute left-2 top-2 rounded-[5px] bg-[#6C4CD8] px-[7px] py-[3px] text-[10px] font-bold text-white">
          -{p.discount}%
        </span>
        {/* save button */}
        <button
          aria-label={isSaved ? "Remove from saved" : "Save"}
          onClick={() => toggleSave(p.id)}
          className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/90"
        >
          <Heart
            size={12}
            color="#6C4CD8"
            fill={isSaved ? "#6C4CD8" : "none"}
          />
        </button>
      </div>

      {/* info */}
      <div className="px-3 pb-3 pt-2.5">
        <p className="text-[13px] font-semibold text-[#241F35]">{p.title}</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[11px] text-[#B3ADC4] line-through">{usd(p.oldPrice)}</span>
          <span className="text-[15px] font-bold text-[#6C4CD8]">{usd(p.price)}</span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={10} fill="#F5B301" color="#F5B301" />
          ))}
          <span className="text-[11px] text-[#8B85A0]">(1)</span>
        </div>
        <p className="mt-1 text-[11px] text-[#8B85A0]">{p.store}</p>
      </div>
    </div>
  );
}

function ProductRow({ products, saved, toggleSave }: { products: Product[]; saved: Set<number>; toggleSave: (id: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} saved={saved} toggleSave={toggleSave} />
      ))}
    </div>
  );
}

function SideList({ title, items }: { title: string; items: ListItem[] }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-[#241F35]">
        <ChevronRight size={13} color="#6C4CD8" />
        {title}
      </h3>
      {items.map((it) => (
        <div key={it.title} className="mb-3 flex items-center gap-2.5">
          <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-[#F1EFFA]" />
          <div>
            <p className="text-[12px] font-medium text-[#3F3A52]">{it.title}</p>
            <p className="mt-0.5 text-[13px] font-bold text-[#6C4CD8]">{usd(it.price)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Page — receives the dynamic [slug] from the URL
   The shared public layout provides the navbar, newsletter, and footer.
   ───────────────────────────────────────────────────────────────────────── */
export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const toggleSave = (id: number) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Format slug to a readable category name (e.g. "fashion-and-beauty" → "Fashion & Beauty")
  const categoryName = slug
    .replace(/-and-/g, " & ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#F6F5FA] text-[#241F35]">
      <div className="mx-auto max-w-[1240px] px-6 py-4">

        {/* ── breadcrumb ── */}
        <nav className="mb-4 flex items-center gap-1 text-[11px] text-[#8B85A0]">
          <Link href="/home" className="hover:text-[#6C4CD8]">Home</Link>
          <ChevronRight size={10} />
          <span className="text-[#241F35] font-medium">{categoryName}</span>
        </nav>

        {/* ── row 1 ── */}
        <ProductRow products={ROW_1} saved={saved} toggleSave={toggleSave} />

        {/* ── row 2 ── */}
        <div className="mt-3">
          <ProductRow products={ROW_2} saved={saved} toggleSave={toggleSave} />
        </div>

        {/* ── pagination ── */}
        <div className="my-5 flex items-center justify-between text-[12px] text-[#8B85A0]">
          <span>Showing 1–10 of 17 item(s)</span>
          <div className="flex gap-1.5">
            {[1, 2].map((n) => (
              <button
                key={n}
                className={cn(
                  "rounded-[5px] px-[10px] py-[4px] text-[11px] font-bold",
                  n === 1
                    ? "bg-[#B7E84A] text-white"
                    : "bg-[#EDEBF3] text-[#8B85A0]"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* ── fashion promo banner ── */}
        <div className="mb-8 flex min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#EDE8FA] to-[#C9BAF2]">
          {/* photo side */}
          <div
            className="flex-1 bg-cover bg-[center_20%]"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80)" }}
          />
          {/* text side */}
          <div className="flex flex-[1.4] flex-col justify-center px-9 py-8">
            <p className="text-[24px] font-bold leading-tight text-[#241F35]">
              Shopping Today
            </p>
            <p className="text-[24px] font-bold leading-tight text-[#241F35]">
              Fashion sale
            </p>
            <p className="mt-2 mb-4 text-[13px] text-[#3F3A52]">30% off — Hurry up!!!</p>
            <button className="self-start rounded-lg bg-[#6C4CD8] px-5 py-2 text-[12px] font-semibold text-white hover:bg-[#5B3DC0]">
              Shop now
            </button>
          </div>
        </div>

        {/* ── trending / top rated / top selling ── */}
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <SideList title="Trending Items" items={TRENDING} />
          <SideList title="Top Rated"      items={TOP_RATED} />
          <SideList title="Top Selling"    items={TOP_SELLING} />
        </div>

        {/* ── service badges ── */}
        <div className="mb-8 flex flex-wrap justify-around gap-5">
          {SERVICES.map(({ Icon, title, body }) => (
            <div key={title} className="max-w-[200px] text-center">
              <div className="mx-auto mb-2.5 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F1EFFA]">
                <Icon size={20} color="#6C4CD8" />
              </div>
              <p className="text-[13px] font-bold text-[#241F35]">{title}</p>
              <p className="mt-1 text-[11px] leading-snug text-[#8B85A0]">{body}</p>
            </div>
          ))}
        </div>

        {/* ── row 3 ── */}
        <div className="mb-8">
          <ProductRow products={ROW_3} saved={saved} toggleSave={toggleSave} />
        </div>

        {/* ── two promo banners ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80",
              title: "Digital Smartwatch",
              sub: "30% Off",
            },
            {
              img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
              title: "Men's Sport Shoes",
              sub: "Sale off",
            },
          ].map(({ img, title, sub }) => (
            <div
              key={title}
              className="relative min-h-[130px] overflow-hidden rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            >
              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#EDE8FA]/90 to-[#EDE8FA]/10" />
              <div className="relative p-6">
                <p className="text-[17px] font-bold text-[#3B2A85]">{title}</p>
                <p className="mb-3 mt-1 text-[12px] font-bold text-[#6C4CD8]">{sub}</p>
                <button className="rounded-md bg-[#6C4CD8] px-[14px] py-[6px] text-[11px] font-semibold text-white hover:bg-[#5B3DC0]">
                  Shop now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── row 4 (repeats row 1 as filler) ── */}
        <div className="mb-8">
          <ProductRow
            products={ROW_1.map((p) => ({ ...p, id: p.id + 100 }))}
            saved={saved}
            toggleSave={toggleSave}
          />
        </div>

      </div>
    </div>
  );
}
