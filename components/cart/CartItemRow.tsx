"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCartItem, removeCartItem } from "@/app/api/cart";
import type { CartItem } from "@/app/api/cart";

type Props = {
  item: CartItem;
  sellerId: string;
  onUpdate: () => void;
};

/* local /picture/ images we can show as fallback */
const FALLBACKS = [
  "/picture/pic1.jpg",
  "/picture/pic2.jpg",
  "/picture/pic3.jpg",
  "/picture/pic4.jpg",
];

export default function CartItemRow({ item, sellerId, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  /* pick a deterministic fallback image from the title hash */
  const fallbackIdx = item.title.charCodeAt(0) % FALLBACKS.length;
  const imgSrc = FALLBACKS[fallbackIdx];

  async function changeQty(delta: number) {
    const next = item.quantity + delta;
    if (next < 1) return;
    setLoading(true);
    try {
      await updateCartItem(sellerId, item.uuid, next);
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      await removeCartItem(sellerId, item.uuid);
      onUpdate();
    } finally {
      setLoading(false);
    }
  }

  /* discount % — show only if lineTotal differs meaningfully from unitPrice × qty */
  const originalTotal = item.unitPrice * item.quantity;
  const discountPct =
    item.lineTotal > 0 && item.lineTotal < originalTotal
      ? Math.round((1 - item.lineTotal / originalTotal) * 100)
      : null;

  return (
    <div className="flex gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(36,31,53,0.07)] transition-all hover:shadow-[0_4px_20px_rgba(108,76,216,0.10)]">

<<<<<<< HEAD
      {/* image */}
      <div className="relative h-[110px] w-[110px] flex-shrink-0 overflow-hidden rounded-xl border-2 border-[#E2DFEC]">
        <Image
          src={imgSrc}
          alt={item.title}
          fill
          sizes="110px"
          className="object-cover"
        />
        {discountPct && (
          <span className="absolute left-2 top-2 rounded-lg bg-[#6C4CD8] px-2 py-0.5 text-[12px] font-bold text-white">
            -{discountPct}%
=======
      {/* details */}
      <div className="flex-1 min-w-0">
        {listing && (
          <>
            <Link
              href={`/products/${listing.slug}`}
              className="text-sm font-medium line-clamp-2 hover:underline"
            >
              {listing.title}
            </Link>
            {listing.store_name && (
              <span className="mt-0.5 inline-block text-[11px] font-bold text-[#6C4CD8]">
                Sold by {listing.store_name}
              </span>
            )}
          </>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          ${listing?.price.toFixed(2)} each
        </p>

        {/* quantity controls */}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => changeQty(-1)}
            disabled={loading}
            aria-label="Decrease quantity"
          >
            <MinusIcon size={12} />
          </Button>
          <span className="w-6 text-center text-sm font-medium">
            {item.quantity}
>>>>>>> origin/main
          </span>
        )}
      </div>

      {/* info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {/* title */}
            <p className="line-clamp-2 text-[16px] font-bold text-[#1A1330] leading-snug">
              {item.title}
            </p>

            {/* price row */}
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-[22px] font-extrabold text-[#6C4CD8]">
                ${(item.lineTotal > 0 ? item.lineTotal / item.quantity : item.unitPrice).toFixed(2)}
              </span>
              {discountPct && (
                <span className="text-[14px] text-[#B3ADC4] line-through">
                  ${item.unitPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* stars placeholder */}
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#F5B301">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            {/* seller */}
            <p className="mt-0.5 text-[13px] text-[#8B85A0]">
              Seller ID: {sellerId.slice(0, 8)}…
            </p>
          </div>

          {/* wishlist save */}
          <button
            onClick={() => setSaved((s) => !s)}
            aria-label={saved ? "Remove from saved" : "Save"}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#E2DFEC] bg-white transition hover:border-[#6C4CD8]"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                saved ? "fill-[#6C4CD8] text-[#6C4CD8]" : "text-[#6C4CD8]"
              )}
            />
          </button>
        </div>

        {/* qty stepper + line total */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[13px] text-[#8B85A0]">
            <span className="font-semibold">Qty:</span>
            <div className="ml-2 flex items-center overflow-hidden rounded-lg border border-[#E2DFEC]">
              <button
                onClick={() => changeQty(-1)}
                disabled={loading || item.quantity <= 1}
                aria-label="Decrease"
                className="flex h-7 w-7 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-[14px] font-bold text-[#1A1330]">
                {loading ? <Loader2 size={12} className="mx-auto animate-spin" /> : item.quantity}
              </span>
              <button
                onClick={() => changeQty(1)}
                disabled={loading}
                aria-label="Increase"
                className="flex h-7 w-7 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* line total + remove */}
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-extrabold text-[#1A1330]">
              ${item.lineTotal.toFixed(2)}
            </span>
            <button
              onClick={remove}
              disabled={loading}
              className="text-[13px] font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
