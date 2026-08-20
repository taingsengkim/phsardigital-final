"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
<<<<<<< HEAD
import Image from "next/image";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { clientFetch } from "@/lib/api";
import { addToCart } from "@/app/api/cart";
=======
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Star,
  Check,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

import type { SavedItem } from "./types";
import { INITIAL_SAVED_ITEMS } from "./mockSavedItems";

export type { SavedItem };

>>>>>>> origin/main

/* ── types matching EXACT Swagger ListingResponse + SellerProfileSummaryResponse ── */
type FavListing = {
  uuid: string;
  slug: string;
  title: string;
  price: number;
  stockQty: number;
  status: string;
  isFeatured: boolean;
  sold: number;
  thumbnailUri?: { uuid: string; objectName: string; uri: string };
  images?: { uuid: string; uri: string; objectName?: string; isPrimary: boolean; sortOrder: number }[];
  category?: { name: string; slug: string };
  /* SellerProfileSummaryResponse — NOT SellerProfileResponse */
  sellerProfile?: {
    sellerId: string;
    phoneNumber?: string;
    biography?: string;
    socialLink?: string[];
  };
  createdAt?: string;
  lastModifiedAt?: string;
};

type PagedFavorites = {
  content: FavListing[];
  page: { totalElements: number; totalPages: number; number: number; size: number };
};

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ── single card ── */
function FavCard({
  listing,
  onRemove,
}: {
  listing: FavListing;
  onRemove: (uuid: string) => void;
}) {
  const imgSrc =
    listing.images?.find((i) => i.isPrimary)?.uri ??
    listing.images?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.uri ??
    listing.thumbnailUri?.uri;

  const [removing,   setRemoving]   = useState(false);
  const [cartState,  setCartState]  = useState<"idle" | "adding" | "added">("idle");

  async function remove() {
    setRemoving(true);
    try {
      await clientFetch("/api/v1/favorites", {
        method: "DELETE",
        body: JSON.stringify([listing.uuid]),
      });
      onRemove(listing.uuid);
    } catch {
      setRemoving(false);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!sessionStorage.getItem("kc_access_token")) {
      window.location.href = "/auth/login";
      return;
    }
    setCartState("adding");
    try {
      await addToCart(listing.uuid, 1);
      setCartState("added");
      setTimeout(() => setCartState("idle"), 2500);
    } catch {
      setCartState("idle");
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(36,31,53,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(108,76,216,0.18)]">

      {/* image */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F3FA]">
        <Link href={`/products/${listing.slug}`}>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={listing.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              unoptimized={imgSrc.startsWith("http://")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#C4B5FD]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-12 w-12">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </Link>

        {/* remove wishlist */}
        <button
          onClick={remove}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#6C4CD8] shadow-md transition hover:bg-[#5B3DC0] disabled:opacity-50"
        >
          <Trash2 size={14} className="text-white" />
        </button>

        {/* out of stock overlay */}
        {listing.stockQty === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-white/90 px-3 py-1.5 text-[13px] font-bold text-[#1A1330]">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${listing.slug}`}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#241F35] hover:text-[#6C4CD8] transition-colors"
        >
          {listing.title}
        </Link>

        {/* category */}
        {listing.category && (
          <span className="inline-flex w-fit rounded-full bg-[#F0EDFB] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4CD8]">
            {listing.category.name}
          </span>
        )}

        {/* stars + sold */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill="#F5B301" color="#F5B301" />
          ))}
          {listing.sold > 0 && (
            <span className="ml-1.5 text-[11px] text-[#8B85A0]">{listing.sold} sold</span>
          )}
        </div>

        {/* seller */}
        {listing.sellerProfile && (
          <p className="text-[12px] text-[#8B85A0]">
            {listing.sellerProfile.biography ?? `Seller ${listing.sellerProfile.sellerId.slice(0, 8)}…`}
          </p>
        )}

        {/* price + add to cart */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-[18px] font-extrabold text-[#6C4CD8]">
            {usd(listing.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={cartState === "adding" || listing.stockQty === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold text-white transition disabled:opacity-50 ${
              cartState === "added" ? "bg-emerald-500" : "bg-[#6C4CD8] hover:bg-[#5B3DC0]"
            }`}
          >
            <ShoppingCart size={13} />
            {cartState === "adding" ? "…" : cartState === "added" ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── skeleton ── */
function Skeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-[#F0EDFB]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F0EDFB]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#F0EDFB]" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-[#F0EDFB]" />
      </div>
    </div>
  );
}

/* ── page ── */
export default function SavedPageClient() {
<<<<<<< HEAD
  const [listings,    setListings]    = useState<FavListing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("kc_access_token");
    const exp   = Number(sessionStorage.getItem("kc_expires_at") ?? "0");

    if (!token || Date.now() >= exp) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    clientFetch<PagedFavorites>("/api/v1/favorites?page=0&size=40")
      .then((data) => {
        console.log("[SavedPage] favorites response:", data);
        setListings(data?.content ?? []);
      })
      .catch((err) => {
        console.error("[SavedPage] favorites error:", err);
        if (String(err).includes("401")) {
          setNotLoggedIn(true);
        } else {
          setError(`Failed to load saved items: ${err}`);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* not logged in */
  if (notLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-5 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0EDFB]">
          <Heart size={36} className="text-[#6C4CD8]" />
        </div>
        <p className="text-[20px] font-bold text-[#1A1330]">Sign in to see your wishlist</p>
        <p className="text-[15px] text-[#8B85A0]">
          You need to be logged in to save and view favourite products.
        </p>
        <Link
          href="/auth/login"
          className="mt-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#5B3DC0] transition-colors"
        >
          Sign In
        </Link>
=======
  const [items, setItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [addedCartIds, setAddedCartIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  function removeItem(id: number, title: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`Removed "${title}" from your saved items.`);
  }

  function clearAll() {
    if (confirm("Are you sure you want to remove all saved items?")) {
      setItems([]);
      showToast("Cleared all saved items.");
    }
  }

  function resetDefaultItems() {
    setItems(INITIAL_SAVED_ITEMS);
    setSelectedCategory("All");
    showToast("Restored static saved items list.");
  }

  function addToCart(item: SavedItem) {
    if (!addedCartIds.includes(item.id)) {
      setAddedCartIds((prev) => [...prev, item.id]);
    }
    showToast(`Added "${item.title}" to your cart!`);
  }

  function moveAllToCart() {
    const allIds = items.map((i) => i.id);
    setAddedCartIds(allIds);
    showToast(`Added all ${items.length} items to your shopping cart!`);
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((current) => (current === msg ? null : current)), 3500);
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1A1330] text-white px-5 py-3.5 shadow-2xl border border-white/10"
          >
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-[#EDEBF3] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#1A1330] sm:text-4xl">Saved Items</h1>
            <motion.span
              key={items.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="rounded-full bg-[#6C4CD8] px-4 py-1.5 text-sm font-extrabold text-white shadow-sm"
            >
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </motion.span>
          </div>
          <p className="mt-2 text-base sm:text-lg font-medium text-[#7C7596]">
            Keep track of your favorite products and move them to your cart anytime.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={moveAllToCart}
              className="flex items-center gap-2 rounded-full bg-[#6C4CD8] px-6 py-3 text-sm sm:text-base font-extrabold text-white shadow-md transition-all hover:bg-[#5B3EC4]"
            >
              <ShoppingCart size={18} />
              Move All to Cart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={clearAll}
              className="flex items-center gap-2 rounded-full border border-[#EDEBF3] bg-white px-5 py-3 text-sm sm:text-base font-bold text-rose-600 shadow-sm transition-colors hover:bg-rose-50 hover:border-rose-200"
            >
              <Trash2 size={17} />
              Clear All
            </motion.button>
          </div>
        )}
>>>>>>> origin/main
      </div>

<<<<<<< HEAD
  /* loading */
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  /* api error */
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-[16px] text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#6C4CD8] px-6 py-2.5 text-[14px] font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  /* empty */
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0EDFB]">
          <Heart size={36} className="text-[#C4B5FD]" />
        </div>
        <p className="text-[20px] font-bold text-[#1A1330]">No saved items yet</p>
        <p className="text-[15px] text-[#8B85A0]">
          Tap the ♡ on any product to save it here.
        </p>
        <Link
          href="/products"
          className="mt-2 rounded-xl bg-[#6C4CD8] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#5B3DC0]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  /* grid */
  return (
    <>
      <p className="mb-5 text-[15px] text-[#8B85A0]">{listings.length} saved item{listings.length !== 1 ? "s" : ""}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {listings.map((listing) => (
          <FavCard
            key={listing.uuid}
            listing={listing}
            onRemove={(uuid) =>
              setListings((prev) => prev.filter((l) => l.uuid !== uuid))
            }
          />
        ))}
      </div>
    </>
=======
      {items.length > 0 ? (
        <>
          {/* Category Filter bar */}
          {categories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-sm font-semibold text-[#7C7596] mr-2">Filter:</span>
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 py-2.5 text-sm sm:text-base transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#6C4CD8] font-bold text-white shadow-md"
                      : "bg-white border border-[#EDEBF3] font-medium text-[#1A1330] hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          )}

          {/* Product Cards Grid — 4 columns with prominent font sizes matching Checkout page */}
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                const isAdded = addedCartIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: -16, filter: "blur(4px)" }}
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px -12px rgba(108, 76, 216, 0.22)" }}
                    transition={{
                      layout: { duration: 0.35, ease: "easeOut" },
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.25 },
                      y: { type: "spring", stiffness: 350, damping: 25, delay: idx * 0.04 },
                    }}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white p-4.5 shadow-sm transition-colors hover:border-[#6C4CD8]/40"
                  >
                    {/* Top image & badges */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F7FB]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Discount Tag */}
                      {item.discountPercent && (
                        <span className="absolute left-3 top-3 rounded-lg bg-[#FF385C] px-2.5 py-1 text-xs sm:text-sm font-extrabold text-white shadow-md">
                          -{item.discountPercent}%
                        </span>
                      )}

                      {/* Remove item button */}
                      <motion.button
                        whileHover={{ scale: 1.15, rotate: 12 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeItem(item.id, item.title)}
                        aria-label="Remove item"
                        title="Remove from saved items"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md backdrop-blur-sm transition-colors hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#6C4CD8]">
                          <span className="truncate">{item.storeName}</span>
                        </div>

                        <Link href={`/products/${item.slug}`} className="block">
                          <h3 className="line-clamp-2 text-base sm:text-lg font-extrabold text-[#1A1330] leading-snug transition-colors hover:text-[#6C4CD8]">
                            {item.title}
                          </h3>
                        </Link>
                      </div>

                      {/* Rating & Price */}
                      <div className="pt-3 border-t border-[#EDEBF3]/70 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Star size={15} className="fill-amber-400 text-amber-400" />
                          <span className="font-extrabold text-[#1A1330]">{item.rating}</span>
                          <span className="text-xs sm:text-sm text-[#7C7596]">({item.reviewCount})</span>
                        </div>

                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl sm:text-2xl font-black text-[#6C4CD8]">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm font-semibold text-[#9B94B4] line-through">
                              ${item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart button */}
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => addToCart(item)}
                          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm sm:text-base font-extrabold transition-all shadow-md ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#6C4CD8] text-white hover:bg-[#5B3EC4]"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={17} /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={17} /> Add to Cart
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="mx-auto my-12 flex max-w-lg flex-col items-center justify-center rounded-3xl border border-[#EDEBF3] bg-white p-12 text-center shadow-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1EFFA] text-[#6C4CD8]"
          >
            <Heart size={36} className="fill-[#6C4CD8]" />
          </motion.div>

          <h2 className="text-2xl font-bold text-[#1A1330]">Your Saved List is Empty</h2>
          <p className="mt-2 text-sm text-[#7C7596] leading-relaxed">
            You haven&apos;t saved any products to your wishlist yet. Explore Phsar Digital to find products you love!
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#6C4CD8] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#5B3EC4]"
              >
                <ShoppingBag size={18} />
                Browse Products
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetDefaultItems}
              className="inline-flex items-center gap-2 rounded-full border border-[#EDEBF3] bg-white px-5 py-3 text-sm font-semibold text-[#6C4CD8] transition-all hover:bg-[#F1EFFA]"
            >
              <RefreshCw size={16} />
              Load Sample Items
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
>>>>>>> origin/main
  );
}

