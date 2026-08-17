"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart, Share2, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import RatingStars from "@/components/product/RatingStars";
import ProductBadge from "@/components/product/ProductBadge";
import SavedButton from "@/components/saved/SavedButton";
import { addToCart } from "@/app/api/cart";
import type { Listing } from "@/lib/types";

type Props = { listing: Listing };

function getActiveDiscount(listing: Listing) {
  if (!listing.discounts || listing.discounts.length === 0) return null;
  const now = Date.now();
  return (
    listing.discounts
      .filter(
        (d) =>
          new Date(d.starts_at).getTime() <= now &&
          new Date(d.ends_at).getTime() >= now
      )
      .sort((a, b) => b.discount_percent - a.discount_percent)[0] ?? null
  );
}

export default function ProductDetailClient({ listing }: Props) {
  const router = useRouter();
  const [qty, setQty]       = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);

  async function handleBuyNow() {
    try {
      await addToCart(listing.id, qty, listing.slug);
    } catch {
      // continue to checkout
    }
    router.push(`/checkout?slug=${encodeURIComponent(listing.slug)}&qty=${qty}`);
  }

  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length
      : 0;

  const activeDiscount  = getActiveDiscount(listing);
  const discountedPrice = activeDiscount
    ? listing.price * (1 - activeDiscount.discount_percent / 100)
    : null;

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addToCart(listing.id, qty, listing.slug);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // silently handle
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── title row ── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[28px] font-extrabold leading-tight text-[#1A1330] lg:text-[32px]">
          {listing.title}
        </h1>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <SavedButton listingId={listing.id} />
          <button
            aria-label="Share"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DFEC] bg-white text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* ── rating row ── */}
      {avgRating > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <RatingStars rating={avgRating} size={18} />
          <span className="text-[16px] font-bold text-[#F5B301]">
            {avgRating.toFixed(1)}
          </span>
          {listing.reviews && listing.reviews.length > 0 && (
            <span className="border-l border-[#E2DFEC] pl-3 text-[15px] text-[#8B85A0]">
              {listing.reviews.length} reviews
              {/* {listing.sku ? ` · SKU ${listing.sku}` : ""} */}
            </span>
          )}
        </div>
      )}

      {/* ── price block ── */}
      <div className="rounded-2xl bg-[#F6F5FA] px-6 py-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[36px] font-black text-[#6C4CD8] leading-none">
            ${(discountedPrice ?? listing.price).toFixed(2)}
          </span>
          {discountedPrice && (
            <>
              <span className="text-[20px] text-[#B3ADC4] line-through font-medium">
                ${listing.price.toFixed(2)}
              </span>
              <span className="rounded-lg bg-[#6C4CD8] px-3 py-1 text-[14px] font-bold text-white">
                SAVE {activeDiscount!.discount_percent}%
              </span>
            </>
          )}
          <ProductBadge discounts={listing.discounts} />
        </div>

        {/* stock status */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              listing.stock > 0 ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          <span
            className={cn(
              "text-[15px] font-semibold",
              listing.stock > 0 ? "text-emerald-600" : "text-red-500"
            )}
          >
            {listing.stock > 0
              ? `In stock · ${listing.stock} units available`
              : "Out of stock"}
          </span>
        </div>
      </div>

      {/* ── attributes grid ── */}
      {listing.attributes && listing.attributes.length > 0 && (
        <div className="rounded-2xl border border-[#E2DFEC] bg-white overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-y divide-[#F0EDFB]">
            {listing.attributes.map((attr, i) => (
              <div key={attr.id} className={cn("px-5 py-3.5", i % 2 === 0 ? "" : "")}>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8B85A0]">
                  {attr.key}
                </p>
                <p className="mt-0.5 text-[16px] font-semibold text-[#1A1330]">
                  {attr.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── quantity + add to cart ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* qty stepper */}
        <div className="flex items-center overflow-hidden rounded-xl border-2 border-[#E2DFEC] bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-12 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center text-[18px] font-bold text-[#1A1330]">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-12 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || listing.stock === 0}
          className={cn(
            "flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 text-[17px] font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50",
            added
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-[#6C4CD8] hover:bg-[#5B3DC0]"
          )}
        >
          <ShoppingCart size={20} />
          {adding ? "Adding…" : added ? "Added to cart!" : "Add to Cart"}
        </button>
      </div>

      {/* ── buy now ── */}
      <button
        onClick={handleBuyNow}
        disabled={listing.stock === 0}
        className="w-full rounded-xl border-2 border-[#6C4CD8] py-3.5 text-[17px] font-bold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white disabled:opacity-40"
      >
        Buy Now
      </button>

      {/* ── trust badges ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { Icon: Truck,        label: "Free Delivery",   sub: "Orders over $50" },
          { Icon: RotateCcw,    label: "30-Day Returns",  sub: "Hassle-free" },
          { Icon: ShieldCheck,  label: "Secure Payment",  sub: "100% Protected" },
        ].map(({ Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-[#F6F5FA] py-4 text-center"
          >
            <Icon size={20} className="text-[#6C4CD8]" />
            <p className="text-[13px] font-bold text-[#1A1330]">{label}</p>
            <p className="text-[12px] text-[#8B85A0]">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── description ── */}
      {listing.description && (
        <div className="border-t border-[#E2DFEC] pt-5">
          <h2 className="mb-2 text-[18px] font-bold text-[#1A1330]">About this item</h2>
          <p className="text-[16px] leading-relaxed text-[#5A5470]">
            {listing.description}
          </p>
        </div>
      )}
    </div>
  );
}
