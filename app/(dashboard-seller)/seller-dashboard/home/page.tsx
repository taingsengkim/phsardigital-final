"use client";

import React from "react";
import { OverviewCard } from "@/components/ui/product/overview-card";
import { ProductActivity } from "@/components/ui/product/product-activity";
import { ProductViews } from "@/components/ui/product/product-views";
import {
  Activity,
  ShoppingBag,
  MessageSquare,
  Star,
  ArrowUpDown,
  Sparkles,
  Package,
  Clock,
  Zap,
  ArrowRight,
  Loader2,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useGetSellerProfileQuery,
  useGetSellerSubscriptionQuery,
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
} from "@/lib/api/sellerApi";

const FALLBACK_PRODUCTS = [
  { name: "Croydon - NHT UK kit", price: "$2,453.80", image: "/picture/pic8.jpg", status: "Active" },
  { name: "Bento Matte 3D illustration 1.0", price: "$105.60", image: "/picture/pic7.jpg", status: "Deactive" },
  { name: "Excellent material 3D chair", price: "$648.60", image: "/picture/pic6.jpg", status: "Active" },
  { name: "Fleet - travel shopping kit", price: "$648.60", image: "/picture/pic5.jpg", status: "Active" },
];

const FALLBACK_COMMENTS = [
  { name: "Ethel", handle: "@ethel", text: "Great work 👏", product: "Smiles - 3D icons", image: "/picture/lisa.PNG" },
  { name: "Jazmyn", handle: "@jaz.designer", text: "I need react version asap!", product: "Fleet - Travel shopping", image: "/picture/vatey.jpg" },
  { name: "Ethel", handle: "@ethel", text: "How can I buy only the design?", product: "Smiles - 3D icons", image: "/picture/menghor.jpg" },
];

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold mb-6">
      <div className={`w-4 h-8 ${color} rounded-full`} />
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
    </div>
  );
}

export default function DashboardSeller() {
  const { data: profile, isLoading: isLoadingProfile } = useGetSellerProfileQuery();
  const { data: subscription, isLoading: isLoadingSub } = useGetSellerSubscriptionQuery();
  const { data: ordersData, isLoading: isLoadingOrders } = useGetSellerOrdersQuery();
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetSellerReviewsQuery();

  const ordersList = ordersData?.content || [];
  const reviewsList = reviewsData?.content || [];

  // Computed income & order count from real fetched data
  const totalIncome = ordersList.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const formattedIncome =
    ordersList.length > 0
      ? `$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "$256k";

  const totalOrdersCount = ordersList.length > 0 ? String(ordersList.length) : "1,024";

  return (
    <div className="space-y-8 p-6 bg-[#F9FAFB] min-h-screen font-sans">
      {/* Header Banner with Seller Business Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#6C4CD8]/10 text-[#6C4CD8] font-bold text-xl overflow-hidden border border-[#6C4CD8]/20">
            {profile?.logoUri ? (
              <Image
                src={profile.logoUri}
                alt={profile.businessName || "Store"}
                fill
                unoptimized={Boolean(profile?.logoUri?.startsWith("http"))}
                className="object-cover"
              />
            ) : (
              <Store className="size-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {profile?.businessName || "Seller Dashboard"}
              </h1>
              {profile?.isActive && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Verified Store
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {profile?.businessType
                ? `${profile.businessType} • ${profile.city || profile.province || "Phsar Digital Seller"}`
                : "Welcome back to your seller overview portal"}
            </p>
          </div>
        </div>

        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1A1330] to-[#6C4CD8] px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm self-start md:self-auto"
        >
          <Sparkles className="size-4 text-yellow-300" />
          Subscription Plans
        </Link>
      </div>

      {/* Live Subscription Widget */}
      {subscription && subscription.status === "ACTIVE" ? (
        <div className="rounded-2xl bg-gradient-to-r from-[#1A1330] via-[#2A1D4E] to-[#6C4CD8] text-white p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-yellow-300">
              <Zap className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Active Plan: {subscription.planDisplayName || subscription.plan}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Posting Allowed • {subscription.listingsUsed} of {subscription.listingLimit} Listings Used
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/80">
              Expires: <strong className="text-white">{subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "Active"}</strong>
            </span>
            <Link
              href="/subscriptions"
              className="rounded-lg bg-white/20 px-3 py-1.5 font-semibold text-white hover:bg-white/30 transition text-xs"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      ) : null}

      {/* Overview Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <SectionTitle color="bg-purple-200">Overview</SectionTitle>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            All time
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OverviewCard
            title="Total Revenue (Orders)"
            value={formattedIncome}
            change="Live API Data"
            changeType="up"
            icon={<Activity className="w-6 h-6" />}
            bgColor="bg-[#E6F4EA]"
            iconBgColor="bg-gray-900"
            chartColor="#34A853"
            chartPath="M 0 30 Q 25 10 50 25 T 100 10"
          />
          <OverviewCard
            title="Total Store Orders"
            value={totalOrdersCount}
            change="Live API Data"
            changeType="up"
            icon={<ShoppingBag className="w-6 h-6" />}
            bgColor="bg-[#E8F0FE]"
            iconBgColor="bg-gray-900"
            chartColor="#4285F4"
            chartPath="M 0 25 Q 25 35 50 20 T 100 15"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductActivity />

          {/* Seller Customer Reviews / Comments */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <SectionTitle color="bg-amber-200">Customer Reviews & Comments</SectionTitle>
            
            {isLoadingReviews ? (
              <div className="py-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#6C4CD8]" />
                Loading seller reviews...
              </div>
            ) : reviewsList.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {reviewsList.map((rev) => (
                  <article key={rev.uuid} className="py-4">
                    <div className="flex gap-3">
                      <div className="size-10 rounded-full bg-purple-100 text-[#6C4CD8] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                        {rev.buyer?.avatarUrl ? (
                          <Image
                            src={rev.buyer.avatarUrl}
                            alt={rev.buyer.fullName || "User"}
                            width={40}
                            height={40}
                            unoptimized={Boolean(rev?.buyer?.avatarUrl?.startsWith("http"))}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          (rev.buyer?.fullName || rev.buyer?.username || "C")[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-xs leading-5">
                        <div className="flex items-center gap-1.5">
                          <strong>{rev.buyer?.fullName || rev.buyer?.username || "Customer"}</strong>
                          <div className="flex items-center gap-0.5 text-amber-500 ml-1">
                            <Star className="size-3 fill-amber-400" />
                            <span className="font-bold">{rev.rating}/5</span>
                          </div>
                          <span className="ml-auto text-[10px] text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rev.listing?.title && (
                          <p className="text-[#6B6580] mt-0.5">
                            Product: <strong className="text-gray-900">{rev.listing.title}</strong>
                          </p>
                        )}
                        <p className="mt-1 text-gray-800">{rev.comment}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {FALLBACK_COMMENTS.map((comment, index) => (
                  <article key={`${comment.name}-${index}`} className="py-4">
                    <div className="flex gap-3">
                      <Image
                        src={comment.image}
                        alt={comment.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1 text-xs leading-5">
                        <div className="flex items-center gap-1">
                          <strong>{comment.name}</strong>
                          <span className="text-muted-foreground">{comment.handle}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground">1h</span>
                        </div>
                        <p>
                          On <strong>{comment.product}</strong>
                        </p>
                        <p className="mt-1">{comment.text}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <Button variant="outline" className="mt-4 w-full rounded-xl">
              View all reviews
            </Button>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ProductViews />

          {/* Recent Orders Section */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <SectionTitle color="bg-sky-200">Recent Customer Orders</SectionTitle>

            {isLoadingOrders ? (
              <div className="py-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-[#6C4CD8]" />
                Loading seller orders...
              </div>
            ) : ordersList.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {ordersList.slice(0, 5).map((order) => (
                  <div key={order.uuid} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.uuid.slice(0, 8)}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {order.items?.length || 1} item(s) • Status: <strong className="text-emerald-600">{order.status}</strong>
                      </p>
                    </div>
                    <span className="font-extrabold text-[#1A1330] text-sm">
                      ${order.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {FALLBACK_PRODUCTS.map((product) => (
                  <div key={product.name} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 py-3">
                    <Image
                      src={product.image}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 rounded-lg object-cover"
                    />
                    <p className="text-xs font-semibold leading-5">{product.name}</p>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{product.price}</p>
                      <span
                        className={`text-[10px] ${
                          product.status === "Active" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
              <Link href="/seller-dashboard/products/dashboard">Manage All Products</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
