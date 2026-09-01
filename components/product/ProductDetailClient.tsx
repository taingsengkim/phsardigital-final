"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";
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
  MessageCircle,
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
import {
  formatAttributeKey,
  formatAttributeValue,
} from "@/lib/attribute-formatter";

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
  const { t } = useLanguage();
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
  const discountPercent =
    hasDiscount && fullPrice > 0
      ? Math.round(((fullPrice - price) / fullPrice) * 100)
      : null;
  const stock = typeof listing.stockQty === "number" ? listing.stockQty : 0;
  const sold = typeof listing.sold === "number" ? listing.sold : 0;

  const isActive = (listing.status ?? "ACTIVE").toUpperCase() === "ACTIVE";
  const inStock = isActive && stock > 0;
  const lowStock = inStock && stock <= LOW_STOCK_THRESHOLD;

  const attributes = useMemo(
    () =>
      [...(listing.listingAttributes ?? [])]
        .map((attr) => ({
          ...attr,
          formattedKey: formatAttributeKey(attr.key),
          formattedValue: formatAttributeValue(attr.value),
        }))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
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
            className="inline-flex items-center gap-1 rounded-full bg-[#F1EFFA] px-3.5 py-1.5 text-xs font-extrabold text-[#6C4CD8] transition-all hover:bg-[#E4DEFA] hover:shadow-xs"
          >
            <ShoppingBag size={13} />
            {listing.category.name}
          </Link>
        )}
        {listing.isFeatured && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-700 border border-amber-200/60 shadow-2xs">
            <Star size={13} className="fill-amber-500 text-amber-500" />
            Featured
          </span>
        )}
        {sold > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 border border-emerald-200/60 shadow-2xs">
            <Flame size={13} className="text-emerald-600" />
            {sold} sold
          </span>
        )}
        {!isActive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-extrabold text-rose-600 border border-rose-200 shadow-2xs">
            Unavailable
          </span>
        )}
      </div>

      {/* ── title row ── */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black leading-tight tracking-tight text-[#1A1330]">
          {listing.title || "Product details"}
        </h1>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <SavedButton listingId={listingId} initialSaved={Boolean(listing.isFavorite)} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleShare}
            aria-label={shared ? "Link copied" : "Share this product"}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E2DFEC] bg-white text-[#6C4CD8] shadow-xs transition hover:bg-[#F1EFFA] hover:border-[#6C4CD8]/40"
          >
            {shared ? (
              <Check size={18} className="text-emerald-500" />
            ) : (
              <Share2 size={18} />
            )}
          </motion.button>
        </div>
      </div>

      {/* ── seller + rating line ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
        {sellerName && (
          <Link
            href={sellerId ? `/stores/${sellerId}` : "/stores"}
            className="inline-flex items-center gap-1.5 font-bold text-[#6C4CD8] transition hover:underline"
          >
            <BadgeCheck size={16} className="text-[#6C4CD8]" />
            <span>{sellerName}</span>
          </Link>
        )}

        {average !== null ? (
          <span className="flex items-center gap-2 border-l border-[#E2DFEC] pl-4">
            <RatingStars rating={average} size={15} />
            <span className="font-black text-amber-600">
              {average.toFixed(1)}
            </span>
            <a href="#reviews" className="font-medium text-[#7C7596] hover:text-[#6C4CD8]">
              ({total} {total === 1 ? "review" : "reviews"})
            </a>
          </span>
        ) : (
          <span className="border-l border-[#E2DFEC] pl-4 text-xs sm:text-sm font-medium text-[#7C7596]">
            No reviews yet
          </span>
        )}
      </div>

      {/* ── price & stock hero block ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E8E4F4] bg-gradient-to-br from-[#FAF9FD] via-[#F6F4FA] to-[#F1EEFB] p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-3.5">
          <span className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-none text-[#6C4CD8] tracking-tight">
            {formatUsd(price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-base sm:text-lg font-bold text-[#8B85A0] line-through">
                {formatUsd(fullPrice)}
              </span>
              {discountPercent !== null && (
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                  -{discountPercent}% OFF
                </span>
              )}
            </>
          )}
          <span className="rounded-xl bg-white/80 px-2.5 py-1 text-xs sm:text-sm font-bold text-[#7C7596] border border-[#EDE8F6] shadow-2xs">
            ≈ {formatKhr(price)}
          </span>
        </div>

        {/* stock status with live dot */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            {inStock && (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  lowStock ? "bg-amber-400" : "bg-emerald-400",
                )}
              />
            )}
            <span
              className={cn(
                "relative inline-flex h-3 w-3 rounded-full",
                inStock
                  ? lowStock
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                  : "bg-rose-500",
              )}
            />
          </span>
          <span
            className={cn(
              "text-sm font-extrabold",
              inStock
                ? lowStock
                  ? "text-amber-700"
                  : "text-emerald-700"
                : "text-rose-600",
            )}
          >
            {!isActive
              ? "This listing is not available right now"
              : stock > 0
                ? lowStock
                  ? `Only ${stock} left in stock — order soon`
                  : `${t("in_stock")} · ${stock} available`
                : t("out_of_stock")}
          </span>
        </div>

        {qty > 1 && inStock && (
          <p className="mt-3 text-xs sm:text-sm font-semibold text-[#5A5470] border-t border-[#E8E4F4] pt-2.5">
            Subtotal for {qty} items:{" "}
            <span className="font-black text-[#1A1330]">
              {formatUsd(price * qty)}
            </span>
          </p>
        )}
      </div>

      {/* ── key specifications / attributes ── */}
      {attributes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#7C7596]">
              Key Specifications
            </h3>
            {attributes.length > 6 && (
              <a
                href="#details"
                className="text-xs font-bold text-[#6C4CD8] hover:underline"
              >
                View all ({attributes.length})
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {attributes.slice(0, 6).map((attr, i) => (
              <div
                key={attr.uuid ?? `${attr.key}-${i}`}
                className="group flex flex-col justify-between rounded-2xl border border-[#EDEBF3] bg-white p-4 shadow-2xs transition-all hover:border-[#6C4CD8]/40 hover:bg-[#FAF9FE] hover:shadow-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6C4CD8]" />
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#7C7596] truncate">
                    {attr.formattedKey}
                  </p>
                </div>
                <p className="mt-1.5 text-sm sm:text-base font-extrabold text-[#1A1330] break-words">
                  {attr.formattedValue}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── quantity + action buttons ── */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center overflow-hidden rounded-2xl border-2 border-[#E2DFEC] bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || !inStock}
              aria-label="Decrease quantity"
              className="flex h-13 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
            >
              <Minus size={16} />
            </button>
            <span
              className="w-12 text-center text-base sm:text-lg font-black text-[#1A1330]"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
              disabled={!inStock || qty >= stock}
              aria-label="Increase quantity"
              className="flex h-13 w-12 items-center justify-center text-[#6C4CD8] transition hover:bg-[#F1EFFA] disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleAddToCart}
            disabled={adding || !inStock}
            className={cn(
              "flex flex-1 items-center justify-center gap-2.5 rounded-2xl py-4 px-6 text-base sm:text-lg font-black text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50",
              added
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-[#6C4CD8] hover:bg-[#5939C6] shadow-[#6C4CD8]/25 hover:shadow-lg",
            )}
          >
            {added ? <Check size={20} /> : <ShoppingCart size={20} />}
            {adding ? "Adding..." : added ? "Added to Cart!" : t("add_to_cart")}
          </motion.button>
        </div>

        {/* Buy Now Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="w-full rounded-2xl bg-[#1A1330] hover:bg-[#2B214A] py-3.5 px-6 text-base font-extrabold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("buy_now")}
        </motion.button>

        {/* Chat with Shop */}
        {sellerId && (
          <Link
            href={`/messages?seller=${encodeURIComponent(sellerId)}&listing=${encodeURIComponent(listing.uuid)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E2DFEC] bg-white py-3 px-4 text-sm sm:text-base font-bold text-[#6C4CD8] shadow-2xs transition hover:border-[#6C4CD8] hover:bg-[#F1EFFA]"
          >
            <MessageCircle size={18} />
            Chat with Seller
          </Link>
        )}
      </div>

      {/* ── trust & assurance badges ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2">
        {[
          {
            Icon: Truck,
            label: "Fast delivery",
            sub: "Cambodia-wide",
          },
          { Icon: RotateCcw, label: "7-day returns", sub: "Hassle-free" },
          {
            Icon: ShieldCheck,
            label: "100% Authentic",
            sub: "Verified seller",
          },
        ].map(({ Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-2xl bg-[#F8F7FC] border border-[#EDEBF3] p-3 text-center transition hover:bg-[#F1EFFA]"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-white text-[#6C4CD8] shadow-2xs">
              <Icon size={18} />
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-[#1A1330] mt-1">{label}</p>
            <p className="text-[11px] font-medium text-[#7C7596]">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── description preview ── */}
      {listing.description && (
        <div className="rounded-3xl border border-[#EDEBF3] bg-white p-6 shadow-2xs">
          <h2 className="mb-2.5 text-base sm:text-lg font-black text-[#1A1330]">
            About this item
          </h2>
          <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#5A5470]">
            {listing.description}
          </p>
        </div>
      )}

      {/* ── listing meta ── */}
      <dl className="flex flex-wrap items-center justify-between gap-y-2 border-t border-[#EDEBF3] pt-4 text-xs font-semibold text-[#7C7596]">
        <div className="flex items-center gap-1.5">
          <Package size={14} />
          <dt className="sr-only">Item code</dt>
          <dd className="font-mono">ID: {listingId.slice(0, 8).toUpperCase()}</dd>
        </div>
        {listedOn && (
          <div className="flex items-center gap-1.5">
            <dt>Listed:</dt>
            <dd className="text-[#1A1330]">{listedOn}</dd>
          </div>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1 text-[#6C4CD8] hover:underline"
        >
          <Link2 size={14} />
          {shared ? "Link copied!" : "Copy link"}
        </button>
      </dl>
    </div>
  );
}
