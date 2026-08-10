"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RatingStars from "@/components/product/RatingStars";
import ProductBadge from "@/components/product/ProductBadge";
import SavedButton from "@/components/saved/SavedButton";
import { addToCart } from "@/app/api/cart";
import type { Listing } from "@/lib/types";

type Props = {
  listing: Listing;
};

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
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) /
        listing.reviews.length
      : 0;

  const activeDiscount = getActiveDiscount(listing);
  const discountedPrice = activeDiscount
    ? listing.price * (1 - activeDiscount.discount_percent / 100)
    : null;

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addToCart(listing.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // silently handle — user can retry
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* title + save */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold leading-snug text-[#2a1c63]">
          {listing.title}
        </h1>
        <SavedButton listingId={listing.id} className="shrink-0 mt-0.5" />
      </div>

      {/* rating */}
      {avgRating > 0 && (
        <div className="flex items-center gap-2.5">
          <RatingStars rating={avgRating} size={16} />
          <span className="text-sm text-muted-foreground">
            {avgRating.toFixed(1)}
          </span>
          {listing.reviews && listing.reviews.length > 0 && (
            <span className="text-sm text-muted-foreground border-l border-border pl-2.5">
              {listing.reviews.length} ratings
              {listing.sku ? ` · SKU ${listing.sku}` : ""}
            </span>
          )}
        </div>
      )}

      {/* price block */}
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-3xl font-bold text-[#4a7c59]">
            ${(discountedPrice ?? listing.price).toFixed(2)}
          </span>
          {activeDiscount && (
            <span className="rounded-md bg-[#e6f0e6] px-2 py-0.5 text-xs font-bold text-[#4a7c59]">
              SAVE {activeDiscount.discount_percent}%
            </span>
          )}
          <ProductBadge discounts={listing.discounts} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {discountedPrice && (
            <span>
              M.R.P.{" "}
              <s className="font-mono">${listing.price.toFixed(2)}</s>
            </span>
          )}
          <span
            className={cn(
              "font-semibold",
              listing.stock > 0 ? "text-[#4a7c59]" : "text-destructive"
            )}
          >
            {listing.stock > 0
              ? `● In stock · ${listing.stock} available`
              : "● Out of stock"}
          </span>
        </div>
      </div>

      {/* attributes grid */}
      {listing.attributes && listing.attributes.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-0 list-none m-0 p-0">
          {listing.attributes.map((attr) => (
            <li
              key={attr.id}
              className="border-b border-dashed border-border py-2 text-sm"
            >
              <span className="font-semibold text-[#2a1c63]">{attr.key}</span>
              <span className="text-muted-foreground"> — {attr.value}</span>
            </li>
          ))}
        </ul>
      )}

      {/* buy row */}
      <div className="flex items-center gap-3 pt-1">
        {/* qty stepper */}
        <div className="flex items-center overflow-hidden rounded-lg border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-11 w-10 items-center justify-center bg-background text-[#2a1c63] transition hover:bg-[#efe9fb] disabled:opacity-40"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center font-mono text-sm font-semibold">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-11 w-10 items-center justify-center bg-background text-[#2a1c63] transition hover:bg-[#efe9fb]"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* add to cart */}
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={adding || listing.stock === 0}
          className={cn(
            "flex-1 gap-2 font-bold transition-all",
            added
              ? "bg-[#4a7c59] hover:bg-[#4a7c59]"
              : "bg-[#3d2b87] hover:bg-[#2a1c63]"
          )}
        >
          <ShoppingCart size={17} />
          {adding ? "Adding…" : added ? "Added!" : "Add to cart"}
        </Button>
      </div>

      {/* description */}
      {listing.description && (
        <p className="text-sm leading-relaxed text-muted-foreground border-t border-border pt-4">
          {listing.description}
        </p>
      )}
    </div>
  );
}
