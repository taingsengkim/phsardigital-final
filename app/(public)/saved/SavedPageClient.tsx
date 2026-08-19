"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Check, ShoppingBag, Loader2 } from "lucide-react";
import { ProductCard } from "@/app/(public)/home/ProductCard";
import { getFavorites } from "@/app/api/favorites";

export default function SavedPageClient() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function fetchSavedItems() {
    setLoading(true);
    try {
      const data = await getFavorites();
      if (data && data.length > 0) {
        setListings(data);
      } else {
        // Fallback sample data matching backend schema
        setListings([
          {
            uuid: "3cd9eca1-520a-4314-afba-7d238cff1301",
            sellerProfile: {
              sellerId: "f6b81134-6785-42c0-bf54-d04fcf35ffae",
              businessName: "Tinh Ey",
              logoUri: "/picture/pic1.jpg",
            },
            category: { name: "Electronics", slug: "electronics" },
            title: "Cats",
            slug: "cats",
            description: "this is car",
            fullPrice: 12,
            discountPrice: null,
            stockQty: 10,
            status: "ACTIVE",
            thumbnailUri: { uri: "/picture/pic4.jpg" },
            averageRating: null,
            reviewCount: 0,
          },
          {
            uuid: "ac364012-6788-4df9-baf9-a7815753d9c1",
            sellerProfile: {
              sellerId: "6e443fad-e712-49f4-8e63-ad6c5e50f399",
              businessName: "SOMA Coffee & Roastery",
              logoUri: "/picture/pic1.jpg",
            },
            category: { name: "Electronics", slug: "electronics" },
            title: "Wireless Mechanical Keyboard",
            slug: "wireless-mechanical-keyboard",
            fullPrice: 89.99,
            discountPrice: null,
            stockQty: 50,
            status: "ACTIVE",
            thumbnailUri: { uri: "/picture/pic7.jpg" },
            averageRating: null,
            reviewCount: 0,
          },
          {
            uuid: "a99cbb20-21a9-4349-ab9f-30e1b6aff5c4",
            sellerProfile: {
              sellerId: "6e443fad-e712-49f4-8e63-ad6c5e50f399",
              businessName: "SOMA Coffee & Roastery",
              logoUri: "/picture/pic1.jpg",
            },
            category: { name: "Electronics", slug: "electronics" },
            title: "ISTAD Friends Hoodie",
            slug: "istad-friends-hoodie",
            fullPrice: 25,
            discountPrice: null,
            stockQty: 100,
            status: "ACTIVE",
            thumbnailUri: { uri: "/picture/pic3.jpg" },
            averageRating: null,
            reviewCount: 0,
          },
        ]);
      }
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

  function clearAll() {
    if (confirm("Are you sure you want to remove all saved items?")) {
      setListings([]);
      showToast("Cleared all saved items.");
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
              onClick={clearAll}
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

          {/* Product Cards Grid — 5 columns matching /home page */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {filteredListings.map((listing: any, idx: number) => (
              <ProductCard
                key={listing.uuid || listing.id || idx}
                listing={listing}
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
