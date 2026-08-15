"use client";

import { useState } from "react";
import {
  Minus, Plus, ShoppingCart, Share2,
  ShieldCheck, RotateCcw, Truck, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCart } from "@/app/api/cart";
import type { Listing } from "@/app/api/listings";

type Props = { listing: Listing };

export default function ProductDetailClient({ listing }: Props) {
  const [qty,    setQty]    = useState(1);
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);
  const [copied, setCopied] = useState(false);

  const inStock = listing.stockQty > 0;

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addToCart(listing.uuid, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // handle silently — could show toast here
    } finally {
      setAdding(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── title + share ── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[28px] font-extrabold leading-tight text-[#1A1330] lg:text-[32px]">
          {listing.title}
        </h1>
        <button
          onClick={handleShare}
          aria-label="Share product"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2DFEC] bg-white text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
        >
          <Share2 size={16} />
        </button>
      </div>
      {copied && (
        <p className="text-[13px] text-emerald-600 -mt-4">Link copied to clipboard!</p>
      )}

      {/* ── category + sold count ── */}
      <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#8B85A0]">
        {listing.category && (
          <span className="rounded-lg bg-[#F0EDFB] px-3 py-1 font-semibold text-[#6C4CD8]">
            {listing.category.name}
          </span>
        )}
        {listing.sold > 0 && (
          <span>{listing.sold} sold</span>
        )}
        {listing.isFeatured && (
          <span className="flex items-center gap-1 text-[#F5B301] font-semibold">
            <Star size={13} fill="#F5B301" /> Featured
          </span>
        )}
      </div>

      {/* ── price block ── */}
      <div className="rounded-2xl bg-[#F6F5FA] px-6 py-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[40px] font-black leading-none text-[#6C4CD8]">
            ${listing.price.toFixed(2)}
          </span>
        </div>

        {/* stock status */}
        <div className="mt-3 flex items-center gap-2">
          <span className={cn(
            "h-2.5 w-2.5 rounded-full",
            inStock ? "bg-emerald-500" : "bg-red-500"
          )} />
          <span className={cn(
            "text-[15px] font-semibold",
            inStock ? "text-emerald-600" : "text-red-500"
          )}>
            {inStock
              ? `In stock · ${listing.stockQty} unit${listing.stockQty !== 1 ? "s" : ""} available`
              : "Out of stock"}
          </span>
        </div>
      </div>

      {/* ── attributes grid ── */}
      {listing.listingAttributes && listing.listingAttributes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#E2DFEC] bg-white">
          <div className="grid grid-cols-2">
            {[...listing.listingAttributes]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((attr, i) => (
                <div
                  key={attr.uuid}
                  className={cn(
                    "px-5 py-3.5",
                    i % 2 === 0 ? "bg-white" : "bg-[#F8F6FD]"
                  )}
                >
                  <p className="text-[12px] font-bold uppercase tracking-wide text-[#8B85A0]">
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

      {/* ── qty + add to cart ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* stepper */}
        <div className="flex items-center overflow-hidden rounded-xl border-2 border-[#E2DFEC] bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-12 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center text-[18px] font-bold text-[#1A1330]">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(listing.stockQty, q + 1))}
            disabled={qty >= listing.stockQty}
            aria-label="Increase quantity"
            className="flex h-12 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !inStock}
          className={cn(
            "flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 text-[17px] font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50",
            added ? "bg-emerald-500" : "bg-[#6C4CD8] hover:bg-[#5B3DC0]"
          )}
        >
          <ShoppingCart size={20} />
          {adding ? "Adding…" : added ? "Added to cart ✓" : "Add to Cart"}
        </button>
      </div>

      {/* ── buy now ── */}
      <button
        disabled={!inStock}
        className="w-full rounded-xl border-2 border-[#6C4CD8] py-3.5 text-[17px] font-bold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white disabled:opacity-40"
      >
        Buy Now
      </button>

      {/* ── trust badges ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { Icon: Truck,       label: "Free Delivery",  sub: "Orders over $50"  },
          { Icon: RotateCcw,   label: "30-Day Returns", sub: "Hassle-free"      },
          { Icon: ShieldCheck, label: "Secure Payment", sub: "100% Protected"   },
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
