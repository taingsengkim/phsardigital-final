"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  MapPin,
  MessageSquare,
  UserPlus,
  UserCheck,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Check,
  Search,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Award,
  Loader2,
} from "lucide-react";
import { MOCK_STORES, DEFAULT_STORE_DETAILS } from "../mockStores";
import type { StoreDetails, StoreProduct } from "../types";
import { ProductCard } from "@/app/(public)/home/ProductCard";
import { getFileUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoreDetailPageClient({ slug }: { slug?: string }) {
  const safeSlug = slug || "storee-corner";
  const mockStore = MOCK_STORES[safeSlug];

  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [sellerSummary, setSellerSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStoreData() {
      setLoading(true);
      try {
        const [profileRes, listingsRes, reviewsRes, summaryRes] = await Promise.all([
          fetch(`/api/sellers/${encodeURIComponent(safeSlug)}`).catch(() => null),
          fetch(`/api/sellers/${encodeURIComponent(safeSlug)}/listings`).catch(() => null),
          fetch(`/api/reviews/sellers/${encodeURIComponent(safeSlug)}`).catch(() => null),
          fetch(`/api/reviews/sellers/${encodeURIComponent(safeSlug)}/summary`).catch(() => null),
        ]);

        if (profileRes && profileRes.ok) {
          const pData = await profileRes.json();
          if (isMounted && pData) setSellerProfile(pData);
        }

        if (listingsRes && listingsRes.ok) {
          const lData = await listingsRes.json();
          const items = lData?.content || lData?.data || (Array.isArray(lData) ? lData : []);
          if (isMounted) setSellerListings(items);
        }

        if (reviewsRes && reviewsRes.ok) {
          const rData = await reviewsRes.json();
          const items = rData?.content || rData?.data || (Array.isArray(rData) ? rData : []);
          if (isMounted) setSellerReviews(items);
        }

        if (summaryRes && summaryRes.ok) {
          const sData = await summaryRes.json();
          if (isMounted && sData) setSellerSummary(sData);
        }
      } catch (err) {
        console.error("Error loading store details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStoreData();
    return () => { isMounted = false; };
  }, [safeSlug]);

  const name =
    sellerProfile?.businessName ||
    sellerProfile?.name ||
    (mockStore ? mockStore.name : safeSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));

  const avatarUrl =
    sellerProfile?.logoUri ||
    (sellerProfile?.logoObjectName ? getFileUrl(sellerProfile.logoObjectName) : null) ||
    "/picture/pic1.jpg";

  const tagline =
    sellerProfile?.description ||
    sellerProfile?.biography ||
    "Official Verified Seller on Phsar Digital";

  const location =
    [sellerProfile?.address, sellerProfile?.city, sellerProfile?.province]
      .filter(Boolean)
      .join(", ") ||
    sellerProfile?.googleMapUrl ||
    "Phnom Penh, Cambodia";

  const rating =
    sellerSummary?.averageRating !== undefined && sellerSummary?.averageRating !== null
      ? sellerSummary.averageRating
      : sellerProfile?.averageRating !== undefined
      ? sellerProfile.averageRating
      : null;

  const reviewCount =
    sellerSummary?.reviewCount !== undefined
      ? sellerSummary.reviewCount
      : sellerProfile?.reviewCount !== undefined
      ? sellerProfile.reviewCount
      : sellerReviews.length;

  const rawProducts = sellerListings;

  const formattedReviews = (
    sellerReviews.length > 0
      ? sellerReviews
      : sellerProfile?.reviews || []
  ).map((rev: any, idx: number) => ({
    id: rev.uuid || rev.id || idx,
    userName: rev.buyer?.displayName || rev.buyer?.fullName || rev.buyer?.username || rev.userName || "Verified Buyer",
    rating: rev.rating ?? 5,
    date: rev.createdAt
      ? new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : (rev.date || "Recent"),
    comment: rev.comment || rev.content || "Great quality product and excellent service!",
    productName: rev.listing?.title || rev.productName || "Store Item",
    productSlug: rev.listing?.slug || null,
    isVerifiedPurchase: Boolean(rev.isVerifiedPurchase),
    isEdited: Boolean(rev.isEdited),
    photoUri: rev.photo?.uri ? (rev.photo.uri.startsWith("http") || rev.photo.uri.startsWith("/") ? rev.photo.uri : getFileUrl(rev.photo.uri)) : null,
    replies: rev.replies || [],
  }));

  const store: StoreDetails = {
    id: sellerProfile?.id || sellerProfile?.uuid || safeSlug,
    slug: safeSlug,
    name,
    tagline,
    avatarUrl,
    coverUrl: sellerProfile?.coverUri || sellerProfile?.coverUrl || "/picture/seller_cover_electronics.jpg",
    verified: sellerProfile?.isActive !== false,
    rating,
    reviewCount,
    productCount: rawProducts.length,
    followersCount: sellerProfile?.followersCount ?? 0,
    location,
    joinedYear: sellerProfile?.createdAt ? String(new Date(sellerProfile.createdAt).getFullYear()) : "2024",
    description: tagline,
    fullStory: sellerProfile?.description || sellerProfile?.biography || `Welcome to ${name}! We offer high quality authentic products and direct seller support.`,
    businessHours: sellerProfile?.businessHours || "Monday – Sunday: 8:00 AM – 8:30 PM",
    responseRate: sellerProfile?.responseRate || "100% within 1 hour",
    shippingTime: sellerProfile?.shippingTime || "Express (Same-day dispatch)",
    categories: Array.from(
      new Set(
        rawProducts
          .map((p: any) => p.category?.name || p.category)
          .filter(Boolean)
      )
    ) as string[],
    products: rawProducts as any,
    reviews: formattedReviews as any,
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(store.followersCount);
  const [activeTab, setActiveTab] = useState<"products" | "offers" | "reviews" | "about">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [addedCartIds, setAddedCartIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((c) => (c === msg ? null : c)), 3500);
  }

  function toggleFollow() {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      showToast(`Unfollowed ${store.name}`);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      showToast(`You are now following ${store.name}!`);
    }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    showToast(`Store link copied to clipboard!`);
  }

  function handleAddToCart(product: StoreProduct) {
    if (!addedCartIds.includes(product.id)) {
      setAddedCartIds((prev) => [...prev, product.id]);
    }
    showToast(`Added "${product.title}" to your cart!`);
  }

  // Filter products
  const displayProducts = store.products.filter((p: any) => {
    const isDiscounted = (p.discountPrice && p.fullPrice && p.fullPrice > p.discountPrice) || (p.discountPercent && p.discountPercent > 0);
    const matchesTab = activeTab !== "offers" || isDiscounted;
    const catName = p.category?.name || p.category || "";
    const matchesCategory = selectedCategory === "All" || catName === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (p.title || "").toLowerCase().includes(q);
    return matchesTab && matchesCategory && matchesSearch;
  });

  if (loading && !sellerProfile) {
    return <StoreDetailSkeleton />;
  }

  return (
    <div className="space-y-8">
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

      {/* Store Header Profile Card — Clean White Layout without Background Cover */}
      <div className="relative overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar & Store Titles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-3xl border border-[#EDEBF3] bg-[#F8F7FB] p-1 shadow-sm">
              <Image src={store.avatarUrl} alt={store.name} fill className="object-cover rounded-2xl" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-[#1A1330] tracking-tight">{store.name}</h1>
                {store.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EFFA] px-3.5 py-1 text-xs sm:text-sm font-extrabold text-[#6C4CD8] border border-[#6C4CD8]/20">
                    <CheckCircle2 size={16} className="fill-[#6C4CD8] text-white" />
                    Verified Store
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg font-bold text-[#6C4CD8]">{store.tagline}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base font-semibold text-[#7C7596] pt-1">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-black text-[#1A1330]">{store.rating}</span>
                  <span>({store.reviewCount} Reviews)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-[#1A1330]">
                  <ShoppingBag size={16} className="text-[#6C4CD8]" />
                  <span className="font-black">{store.productCount}</span> Products
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#6C4CD8]" />
                  <span>{store.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleFollow}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base font-extrabold transition-all shadow-md ${
                isFollowing
                  ? "bg-[#F1EFFA] text-[#6C4CD8] border border-[#6C4CD8]/30 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                  : "bg-[#6C4CD8] text-white hover:bg-[#5B3EC4]"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={18} /> Following ({followersCount.toLocaleString()})
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Follow Store
                </>
              )}
            </motion.button>

            <Link href={`/messages?seller=${encodeURIComponent(safeSlug)}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-2 rounded-full border border-[#EDEBF3] bg-white px-5 py-3 text-sm sm:text-base font-extrabold text-[#1A1330] shadow-xs hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
              >
                <MessageSquare size={18} className="text-[#6C4CD8]" />
                Chat
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleShare}
              aria-label="Share Store"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#EDEBF3] bg-white text-[#7C7596] shadow-xs hover:bg-[#F1EFFA] hover:text-[#6C4CD8]"
            >
              <Share2 size={19} />
            </motion.button>
          </div>
        </div>

        {/* Store Navigation Tabs — Bold active tab, clean semibold unselected tabs */}
        <div className="flex items-center border-t border-[#EDEBF3] pt-4 overflow-x-auto scrollbar-none">
          {[
            { id: "products", label: `All Products (${store.products.length})` },
            { id: "offers", label: "Special Offers" },
            { id: "reviews", label: `Store Reviews (${store.reviews.length})` },
            { id: "about", label: "About Store" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative px-6 py-3.5 text-base sm:text-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "font-extrabold text-[#6C4CD8]"
                  : "font-semibold text-[#7C7596] hover:text-[#1A1330]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="storeTabLine"
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[#6C4CD8]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "products" || activeTab === "offers" ? (
        <div className="space-y-6">
          {/* Controls Bar: Search & Categories */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-5 border border-[#EDEBF3] shadow-xs">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search products in ${store.name}...`}
                className="w-full rounded-full border border-[#E2DFEC] bg-[#F8F7FB] py-3 pl-11 pr-4 text-sm sm:text-base font-medium text-[#1A1330] outline-none transition-all focus:border-[#6C4CD8] focus:bg-white"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C4CD8]" />
            </div>

            {store.categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-sm font-semibold text-[#7C7596] mr-1">Category:</span>
                {["All", ...store.categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-5 py-2.5 text-sm sm:text-base transition-all ${
                      selectedCategory === cat
                        ? "bg-[#6C4CD8] font-bold text-white shadow-sm"
                        : "bg-[#F1EFFA] font-medium text-[#1A1330] hover:bg-[#E5E0F5] hover:text-[#6C4CD8]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Grid */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 font-sans">
              {displayProducts.map((product: any, idx: number) => (
                <ProductCard
                  key={product.uuid || product.id || idx}
                  listing={{
                    ...product,
                    sellerProfile: { businessName: store.name },
                  }}
                  sellerName={store.name}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-white border border-[#EDEBF3] p-8">
              <ShoppingBag size={40} className="mx-auto text-[#6C4CD8] mb-3" />
              <h3 className="text-xl font-bold text-[#1A1330]">No Products Found</h3>
              <p className="text-sm text-[#7C7596] mt-1">Try resetting your search filter or category selection.</p>
            </div>
          )}
        </div>
      ) : activeTab === "reviews" ? (
        /* Store Reviews Tab — Prominent Typography, Large Avatars & Stars */
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#EDEBF3] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#1A1330]">Customer Reviews</h3>
              {rating !== null && !isNaN(rating) && (
                <div className="flex items-center gap-2 rounded-xl bg-[#F1EFFA] px-3.5 py-1.5 text-xs font-bold text-[#6C4CD8]">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{Number(rating).toFixed(1)} Overall Rating ({reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {store.reviews.length > 0 ? (
              <div className="divide-y divide-[#EDEBF3] space-y-6">
                {store.reviews.map((rev) => (
                  <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6C4CD8] text-base font-bold text-white shadow-xs">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#1A1330] text-base sm:text-lg block">
                              {rev.userName}
                            </span>
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                <ShieldCheck size={12} /> Verified Purchase
                              </span>
                            )}
                            {rev.isEdited && (
                              <span className="text-xs italic text-[#7C7596]">(edited)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={15}
                                className={
                                  i < rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-100 text-slate-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#7C7596]">{rev.date}</span>
                    </div>

                    {rev.comment && (
                      <p className="text-sm sm:text-base font-medium text-[#1A1330] leading-relaxed my-2">
                        {rev.comment}
                      </p>
                    )}

                    {rev.photoUri && (
                      <div className="relative size-24 overflow-hidden rounded-2xl border border-[#EDEBF3]">
                        <Image src={rev.photoUri} alt="Customer photo" fill className="object-cover" />
                      </div>
                    )}

                    {rev.productName && (
                      <p className="text-xs sm:text-sm text-[#7C7596] font-medium">
                        Purchased:{" "}
                        {rev.productSlug ? (
                          <Link
                            href={`/products/${rev.productSlug}`}
                            className="font-bold text-[#6C4CD8] hover:underline"
                          >
                            {rev.productName}
                          </Link>
                        ) : (
                          <strong className="font-bold text-[#6C4CD8]">{rev.productName}</strong>
                        )}
                      </p>
                    )}

                    {/* Seller replies */}
                    {rev.replies && rev.replies.length > 0 && (
                      <div className="mt-3 rounded-2xl bg-[#F8F7FB] p-4 border border-[#EDEBF3] space-y-2 ml-4 sm:ml-8">
                        {rev.replies.map((reply: any, i: number) => (
                          <div key={reply.uuid || i} className="text-xs sm:text-sm space-y-1">
                            <span className="font-bold text-[#6C4CD8]">Shop Owner Response:</span>
                            <p className="text-[#4A435A] font-medium leading-relaxed">{reply.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base font-medium text-[#7C7596]">No reviews yet for this store.</p>
            )}
          </div>
        </div>
      ) : (
        /* About Tab — Rich Multi-Card Store Profile Layout */
        <div className="space-y-6">
          {/* Top 4 Performance Highlights Cards Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-[#EDEBF3] bg-white p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-amber-500">
                <Star size={20} className="fill-amber-400" />
                <span className="text-xl font-black text-[#1A1330]">{store.rating} / 5.0</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#7C7596]">{store.reviewCount}+ Positive Reviews</p>
            </div>

            <div className="rounded-3xl border border-[#EDEBF3] bg-white p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-[#6C4CD8]">
                <Clock size={20} />
                <span className="text-xl font-black text-[#1A1330]">Fast Chat</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#7C7596]">{store.responseRate}</p>
            </div>

            <div className="rounded-3xl border border-[#EDEBF3] bg-white p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={20} />
                <span className="text-xl font-black text-[#1A1330]">100% Authentic</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#7C7596]">Phsar Digital Verified</p>
            </div>

            <div className="rounded-3xl border border-[#EDEBF3] bg-white p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-[#6C4CD8]">
                <Award size={20} />
                <span className="text-xl font-black text-[#1A1330]">Express Delivery</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#7C7596]">{store.shippingTime}</p>
            </div>
          </div>

          {/* Main 2-Column Details Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Brand Story & Quality Guarantees (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Brand Story Card */}
              <div className="rounded-3xl border border-[#EDEBF3] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#EDEBF3] pb-4">
                  <h3 className="text-2xl font-black text-[#1A1330]">About {store.name}</h3>
                  <span className="rounded-full bg-[#F1EFFA] px-3.5 py-1 text-xs font-extrabold text-[#6C4CD8]">
                    Est. {store.joinedYear}
                  </span>
                </div>

                <p className="text-base sm:text-lg text-[#4A435A] font-medium leading-relaxed">
                  {store.fullStory ?? store.description}
                </p>
              </div>

              {/* Store Guarantees & Buyer Rights */}
              <div className="rounded-3xl border border-[#EDEBF3] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h4 className="text-xl font-black text-[#1A1330]">Store Guarantees & Policies</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#F8F7FB] p-4 border border-[#EDEBF3]">
                    <ShieldCheck size={22} className="text-[#6C4CD8] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#1A1330]">Buyer Protection</p>
                      <p className="text-xs text-[#7C7596]">100% money-back guarantee for unfulfilled orders.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#F8F7FB] p-4 border border-[#EDEBF3]">
                    <Award size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#1A1330]">7-Day Return Policy</p>
                      <p className="text-xs text-[#7C7596]">Hassle-free exchange for defective items.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#F8F7FB] p-4 border border-[#EDEBF3]">
                    <Clock size={22} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#1A1330]">Same-Day Dispatch</p>
                      <p className="text-xs text-[#7C7596]">Orders before 2 PM ship out the same day.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#F8F7FB] p-4 border border-[#EDEBF3]">
                    <MessageSquare size={22} className="text-[#6C4CD8] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#1A1330]">Vendor Support</p>
                      <p className="text-xs text-[#7C7596]">Direct chat with store owner on Phsar Digital.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Physical Location, Business Hours & Seller Contact (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Location & Operating Details Card */}
              <div className="rounded-3xl border border-[#EDEBF3] bg-white p-6 sm:p-8 shadow-sm space-y-5">
                <h4 className="text-xl font-black text-[#1A1330] border-b border-[#EDEBF3] pb-3">
                  Store Location & Hours
                </h4>

                <div className="space-y-4 text-sm sm:text-base font-medium">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-[#6C4CD8] shrink-0 mt-1" />
                    <div>
                      <p className="font-extrabold text-[#1A1330]">Physical Address</p>
                      <p className="text-xs sm:text-sm text-[#7C7596] leading-relaxed mt-0.5">
                        {store.fullAddress ?? `${store.location}, Cambodia`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-[#6C4CD8] shrink-0 mt-1" />
                    <div>
                      <p className="font-extrabold text-[#1A1330]">Business Hours</p>
                      <p className="text-xs sm:text-sm text-[#7C7596] mt-0.5">
                        {store.businessHours ?? "Monday – Sunday: 8:00 AM – 8:30 PM"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-extrabold text-[#1A1330]">Seller Verification</p>
                      <p className="text-xs sm:text-sm text-[#7C7596] mt-0.5">
                        Phsar Digital Verified Merchant (Joined {store.joinedYear})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categories Sold */}
                <div className="pt-4 border-t border-[#EDEBF3] space-y-2">
                  <p className="text-xs font-bold text-[#7C7596] uppercase tracking-wide">Main Store Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {store.categories.map((c) => (
                      <span key={c} className="rounded-full bg-[#F1EFFA] px-3.5 py-1 text-xs font-bold text-[#6C4CD8]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vendor Chat Banner Box */}
              <div className="rounded-3xl bg-gradient-to-br from-[#6C4CD8] to-[#4F2FBF] p-6 text-white shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-white">
                    <Image src={store.avatarUrl} alt={store.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-base">{store.name}</h5>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Online Now • Quick Support
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Have questions about products, sizing, or bulk orders? Chat directly with {store.name}&apos;s customer service.
                </p>

                <Link
                  href={`/messages?seller=${encodeURIComponent(safeSlug)}`}
                  className="block"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-3 px-4 text-sm font-extrabold text-[#6C4CD8] shadow-md hover:bg-slate-50 transition-all"
                  >
                    <MessageSquare size={17} />
                    Start Chat with Seller
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StoreDetailSkeleton() {
  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-300">
      {/* Store Header Profile Card Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-[#EDEBF3] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatar & Store Info Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-3xl bg-[#F1EFFA]" />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 sm:h-9 w-48 sm:w-64 rounded-xl bg-[#E8E3FA]" />
                <Skeleton className="h-6 w-28 rounded-full bg-[#F1EFFA]" />
              </div>
              <Skeleton className="h-5 w-40 sm:w-60 rounded-lg bg-[#F1EFFA]" />
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Skeleton className="h-4 w-24 rounded-md bg-[#F1EFFA]" />
                <Skeleton className="h-4 w-24 rounded-md bg-[#F1EFFA]" />
                <Skeleton className="h-4 w-32 rounded-md bg-[#F1EFFA]" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
            <Skeleton className="h-12 w-36 rounded-full bg-[#E8E3FA]" />
            <Skeleton className="h-12 w-24 rounded-full bg-[#F1EFFA]" />
            <Skeleton className="h-12 w-12 rounded-full bg-[#F1EFFA]" />
          </div>
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex items-center border-t border-[#EDEBF3] pt-4 gap-6 overflow-hidden">
          <Skeleton className="h-9 w-36 rounded-lg bg-[#E8E3FA]" />
          <Skeleton className="h-9 w-28 rounded-lg bg-[#F1EFFA]" />
          <Skeleton className="h-9 w-36 rounded-lg bg-[#F1EFFA]" />
          <Skeleton className="h-9 w-28 rounded-lg bg-[#F1EFFA]" />
        </div>
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-5 border border-[#EDEBF3] shadow-xs">
        <Skeleton className="h-11 w-full max-w-md rounded-full bg-[#F1EFFA]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-16 rounded-full bg-[#E8E3FA]" />
          <Skeleton className="h-9 w-24 rounded-full bg-[#F1EFFA]" />
          <Skeleton className="h-9 w-24 rounded-full bg-[#F1EFFA]" />
          <Skeleton className="h-9 w-24 rounded-full bg-[#F1EFFA]" />
        </div>
      </div>

      {/* Product Cards Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#EDEBF3] bg-white p-3 space-y-3 shadow-xs"
          >
            <Skeleton className="aspect-square w-full rounded-xl bg-[#F1EFFA]" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-4/5 rounded-md bg-[#E8E3FA]" />
              <Skeleton className="h-3 w-3/5 rounded-md bg-[#F1EFFA]" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-5 w-20 rounded-md bg-[#E8E3FA]" />
                <Skeleton className="h-8 w-8 rounded-full bg-[#F1EFFA]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

