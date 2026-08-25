"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Flame,
  Link2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  ShoppingBag,
  Star,
  Truck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RatingStars from "@/components/product/RatingStars";
import SavedButton from "@/components/saved/SavedButton";
import { authClient, useSession } from "@/lib/auth-client";
import { addToCart } from "@/app/api/cart";
import type { ApiListing, ReviewSummary } from "@/lib/types";
import {
  getListingFullPrice,
  getListingPrice,
  hasListingDiscount,
} from "@/lib/api/listing-price";

type Props = {
  listing: ApiListing;
  reviewSummary: ReviewSummary;
  sellerName?: string | null;
  sellerId?: string | null;
};

/** Indicative USD→KHR reference rate; shoppers in Cambodia price-check in riel. */
const KHR_PER_USD = 4100;

/** Below this, show scarcity messaging rather than a plain stock count. */
const LOW_STOCK_THRESHOLD = 5;

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function formatKhr(usd: number): string {
  const riel = Math.round((usd * KHR_PER_USD) / 100) * 100;
  return `៛${riel.toLocaleString("en-US")}`;
}

function formatListedDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProductDetailClient({
  listing,
  reviewSummary,
  sellerName,
  sellerId,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const listingId = listing.uuid;
  const productSlug = listing.slug || listing.uuid;

  const price = getListingPrice(listing);
  const fullPrice = getListingFullPrice(listing);
  const hasDiscount = hasListingDiscount(listing);
  const stock = typeof listing.stockQty === "number" ? listing.stockQty : 0;
  const sold = typeof listing.sold === "number" ? listing.sold : 0;

  const isActive = (listing.status ?? "ACTIVE").toUpperCase() === "ACTIVE";
  const inStock = isActive && stock > 0;
  const lowStock = inStock && stock <= LOW_STOCK_THRESHOLD;

  const attributes = useMemo(
    () =>
      [...(listing.listingAttributes ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
    [listing.listingAttributes],
  );

  const listedOn = formatListedDate(listing.createdAt);
  const { average, total } = reviewSummary;

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }

  async function handleAddToCart() {
    if (!isLoggedIn) {
      await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: typeof window !== "undefined" ? window.location.href : "/",
      });
      return;
    }
    setAdding(true);
    try {
      await addToCart(listingId, qty, productSlug ?? undefined);
      setAdded(true);
      triggerToast(`Added ${qty} × "${listing.title ?? "Item"}" to your cart!`);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // local fallback handles state
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    if (!isLoggedIn) {
      await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: typeof window !== "undefined" ? window.location.href : "/",
      });
      return;
    }
    try {
      await addToCart(listingId, qty, productSlug ?? undefined);
    } catch {
      // continue to checkout
    }
    router.push(
      `/checkout?slug=${encodeURIComponent(productSlug ?? "")}&qty=${qty}`,
    );
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: listing.title ?? "Phsar Digital",
      text: `${listing.title ?? "Check this out"} — ${formatUsd(price)} on Phsar Digital`,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user dismissed sheet
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="relative flex flex-col gap-6 font-sans">
      {/* ── Success Toast Alert Banner ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3.5 rounded-2xl bg-emerald-600 px-5 py-4 text-white shadow-[0_16px_40px_-10px_rgba(5,150,105,0.4)] border border-emerald-400/40 max-w-md backdrop-blur-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-xs">
              <CheckCircle2 size={22} className="text-white" />
            </div>

            <div className="flex-1 pr-1">
              <p className="text-base font-extrabold text-white leading-snug">
                Item Added to Cart!
              </p>
              <p className="text-xs sm:text-sm font-medium text-emerald-100 line-clamp-1 mt-0.5">
                {toastMessage}
              </p>
            </div>

            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-emerald-700 shadow-md transition-all hover:bg-emerald-50 shrink-0"
              >
                <span>View Cart</span>
                <ArrowRight size={14} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── category + status chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        {listing.category?.name && (
          <Link
            href={`/products?categorySlug=${listing.category.slug ?? ""}`}
            className="rounded-full bg-[#F1EFFA] px-3 py-1 text-[13px] font-bold text-[#6C4CD8] transition hover:bg-[#E4DEFA]"
          >
            {listing.category.name}
          </Link>
        )}
        {listing.isFeatured && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7E6] px-3 py-1 text-[13px] font-bold text-[#B7791F]">
            <Star size={12} fill="#B7791F" />
            Featured
          </span>
        )}
        {sold > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-[13px] font-bold text-emerald-600">
            <Flame size={12} />
            {sold} sold
          </span>
        )}
        {!isActive && (
          <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-[13px] font-bold text-red-500">
            Unavailable
          </span>
        )}
      </div>

      {/* ── title row ── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[28px] font-extrabold leading-tight text-[#1A1330] lg:text-[32px]">
          {listing.title || "Product details"}
        </h1>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <SavedButton listingId={listingId} initialSaved={Boolean(listing.isFavorite)} />
          <button
            type="button"
            onClick={handleShare}
            aria-label={shared ? "Link copied" : "Share this product"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DFEC] bg-white text-[#6C4CD8] transition hover:bg-[#F1EFFA]"
          >
            {shared ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Share2 size={16} />
            )}
          </button>
        </div>
      </div>

      {/* ── seller + rating line ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
        {sellerName && (
          <Link
            href={sellerId ? `/stores/${sellerId}` : "/stores"}
            className="inline-flex items-center gap-1.5 font-semibold text-[#6C4CD8] hover:underline"
          >
            <BadgeCheck size={15} />
            {sellerName}
          </Link>
        )}

        {average !== null ? (
          <span className="flex items-center gap-2 border-l border-[#E2DFEC] pl-4">
            <RatingStars rating={average} size={16} />
            <span className="font-bold text-[#F5B301]">
              {average.toFixed(1)}
            </span>
            <a href="#reviews" className="text-[#8B85A0] hover:text-[#6C4CD8]">
              ({total} {total === 1 ? "review" : "reviews"})
            </a>
          </span>
        ) : (
          <span className="border-l border-[#E2DFEC] pl-4 text-[#8B85A0]">
            No reviews yet
          </span>
        )}
      </div>

      {/* ── price block ── */}
      <div className="rounded-2xl bg-[#F6F5FA] px-6 py-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[36px] font-black leading-none text-[#6C4CD8]">
            {formatUsd(price)}
          </span>
          {hasDiscount && (
            <span className="text-[16px] font-semibold text-[#8B85A0] line-through">
              {formatUsd(fullPrice)}
            </span>
          )}
          <span className="text-[15px] font-medium text-[#8B85A0]">
            ≈ {formatKhr(price)}
          </span>
        </div>

        {/* stock status */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              inStock
                ? lowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500"
                : "bg-red-500",
            )}
          />
          <span
            className={cn(
              "text-[15px] font-semibold",
              inStock
                ? lowStock
                  ? "text-amber-600"
                  : "text-emerald-600"
                : "text-red-500",
            )}
          >
            {!isActive
              ? "This listing is not available right now"
              : stock > 0
                ? lowStock
                  ? `Only ${stock} left in stock — order soon`
                  : `In stock · ${stock} available`
                : "Out of stock"}
          </span>
        </div>

        {qty > 1 && inStock && (
          <p className="mt-2 text-[14px] text-[#5A5470]">
            Subtotal for {qty} items:{" "}
            <span className="font-bold text-[#1A1330]">
              {formatUsd(price * qty)}
            </span>
          </p>
        )}
      </div>

      {/* ── key specs ── */}
      {attributes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#E2DFEC] bg-white">
          <div className="grid grid-cols-1 divide-y divide-[#F0EDFB] sm:grid-cols-2 sm:divide-x">
            {attributes.slice(0, 6).map((attr, i) => (
              <div
                key={attr.uuid ?? `${attr.key}-${i}`}
                className="px-5 py-3.5"
              >
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8B85A0]">
                  {attr.key}
                </p>
                <p className="mt-0.5 text-[16px] font-semibold text-[#1A1330]">
                  {attr.value}
                </p>
              </div>
            ))}
          </div>
          {attributes.length > 6 && (
            <a
              href="#details"
              className="block border-t border-[#F0EDFB] px-5 py-3 text-center text-[14px] font-bold text-[#6C4CD8] hover:bg-[#FAF9FD]"
            >
              See all {attributes.length} specifications
            </a>
          )}
        </div>
      )}

      {/* ── quantity + add to cart ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center overflow-hidden rounded-xl border-2 border-[#E2DFEC] bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || !inStock}
            aria-label="Decrease quantity"
            className="flex h-12 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <span
            className="w-12 text-center text-[18px] font-bold text-[#1A1330]"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            disabled={!inStock || qty >= stock}
            aria-label="Increase quantity"
            className="flex h-12 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || !inStock}
          className={cn(
            "flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3.5 text-[17px] font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50",
            added
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-[#6C4CD8] hover:bg-[#5B3DC0]",
          )}
        >
          {added ? <Check size={20} /> : <ShoppingCart size={20} />}
          {adding ? "Adding…" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={!inStock}
        className="w-full rounded-xl border-2 border-[#6C4CD8] py-3.5 text-[17px] font-bold text-[#6C4CD8] transition hover:bg-[#6C4CD8] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Buy now
      </button>

      {/* ── trust badges ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            Icon: Truck,
            label: "Fast delivery",
            sub: "Phnom Penh & provinces",
          },
          { Icon: RotateCcw, label: "7-day returns", sub: "On damaged items" },
          {
            Icon: ShieldCheck,
            label: "Buyer protection",
            sub: "Secure checkout",
          },
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

      {/* ── description preview ── */}
      {listing.description && (
        <div className="border-t border-[#E2DFEC] pt-5">
          <h2 className="mb-2 text-[18px] font-bold text-[#1A1330]">
            About this item
          </h2>
          <p className="whitespace-pre-line text-[16px] leading-relaxed text-[#5A5470]">
            {listing.description}
          </p>
        </div>
      )}

      {/* ── listing meta ── */}
      <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#E2DFEC] pt-5 text-[13px] text-[#8B85A0]">
        <div className="flex items-center gap-1.5">
          <Package size={13} />
          <dt className="sr-only">Item code</dt>
          <dd className="font-mono">{listingId.slice(0, 8).toUpperCase()}</dd>
        </div>
        {listedOn && (
          <div className="flex items-center gap-1.5">
            <dt>Listed</dt>
            <dd className="font-semibold text-[#5A5470]">{listedOn}</dd>
          </div>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 font-semibold text-[#6C4CD8] hover:underline"
        >
          <Link2 size={13} />
          {shared ? "Link copied" : "Copy link"}
        </button>
      </dl>
    </div>
  );
}
