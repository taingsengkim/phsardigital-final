"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Check, ShoppingBag, Loader2, AlertTriangle, X } from "lucide-react";
import { ProductCard } from "@/app/(public)/home/ProductCard";
import { getFavorites, removeFavorites } from "@/app/api/favorites";

export default function SavedPageClient() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function fetchSavedItems() {
    setLoading(true);
    try {
      const rawData = await getFavorites();
      const items = Array.isArray(rawData) ? rawData : [];
      const unwrapped = items.map((item: any) => {
        const listing = item.listing || item;
        return {
          ...listing,
          uuid: listing.uuid || item.uuid || listing.id,
          isFavorite: true,
        };
      });
      setListings(unwrapped);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const categories = ["All", ...Array.from(new Set(listings.map((i) => i.category?.name).filter(Boolean)))];

  const filteredListings =
    selectedCategory === "All"
      ? listings
      : listings.filter((item) => item.category?.name === selectedCategory);

  async function handleRemoveItem(uuid: string) {
    const itemToRemove = listings.find((i) => (i.uuid || i.slug || i.id) === uuid);
    setListings((prev) => prev.filter((item) => (item.uuid || item.slug || item.id) !== uuid));
    await removeFavorites([uuid]);
    showToast(`Removed "${itemToRemove?.title || "Product"}" from your saved items.`);
  }

  function handleClearAll() {
    setShowClearModal(true);
  }

  async function confirmClearAll() {
    setClearing(true);
    try {
      const allUuids = listings.map((i) => i.uuid || i.slug || i.id).filter(Boolean);
      setListings([]);
      setShowClearModal(false);
      if (allUuids.length > 0) {
        await removeFavorites(allUuids);
      }
      showToast("Cleared all saved items.");
    } catch {
      showToast("Failed to clear saved items.");
    } finally {
      setClearing(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((current) => (current === msg ? null : current)), 3500);
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center text-[#6C4CD8]">
          <Loader2 size={32} className="animate-spin" />
        </div>
        <p className="mt-4 text-[16px] font-semibold text-[#8B85A0]">Loading your saved items…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
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

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !clearing && setShowClearModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-[#EDEBF3]"
            >
              <button
                type="button"
                disabled={clearing}
                onClick={() => setShowClearModal(false)}
                className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 border-b border-[#F0EDFB] pb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#1A1330]">
                    Clear All Saved Items?
                  </h3>
                  <p className="text-xs font-semibold text-[#8B85A0]">
                    {listings.length} {listings.length === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm sm:text-base text-[#5A5470] leading-relaxed font-medium">
                Are you sure you want to remove all <strong className="text-[#1A1330]">{listings.length} item(s)</strong> from your saved collection? This action cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 rounded-xl border border-[#EDEBF3] bg-white px-5 py-3 text-sm font-bold text-[#5A5470] transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={clearing}
                  onClick={confirmClearAll}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {clearing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Clearing…
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Clear All
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-[#EDEBF3] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#1A1330] sm:text-4xl">Saved Items</h1>
            <motion.span
              key={listings.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="rounded-full bg-[#6C4CD8] px-4 py-1.5 text-sm font-extrabold text-white shadow-sm"
            >
              {listings.length} {listings.length === 1 ? "Item" : "Items"}
            </motion.span>
          </div>
          <p className="mt-2 text-base sm:text-lg font-medium text-[#7C7596]">
            Keep track of your favorite products and move them to your cart anytime.
          </p>
        </div>

        {listings.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-2 rounded-full bg-[#6C4CD8] px-6 py-3 text-sm sm:text-base font-extrabold text-white shadow-md transition-all hover:bg-[#5B3EC4]"
              >
                <ShoppingCart size={18} />
                View Cart
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-full border border-[#EDEBF3] bg-white px-5 py-3 text-sm sm:text-base font-bold text-rose-600 shadow-sm transition-colors hover:bg-rose-50 hover:border-rose-200"
            >
              <Trash2 size={17} />
              Clear All
            </motion.button>
          </div>
        )}
      </div>

      {listings.length > 0 ? (
        <>
          {/* Category Filter bar */}
          {categories.length > 1 && (
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

          {/* Product Cards Grid — 5 columns matching /home page */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {filteredListings.map((listing: any, idx: number) => (
              <ProductCard
                key={listing.uuid || listing.id || idx}
                listing={listing}
                isSavedPage={true}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
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
          </div>
        </motion.div>
      )}
    </div>
  );
}
