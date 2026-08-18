"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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


export default function SavedPageClient() {
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
      </div>

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
  );
}

