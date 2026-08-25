"use client";

import React from "react";
import {
  CircleDollarSign,
  ShoppingBag,
  Star,
  Sparkles,
  Zap,
  Loader2,
  Store,
  BarChart3,
  Boxes,
  PackageCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useGetSellerProfileQuery,
  useGetSellerSubscriptionQuery,
  useGetMyListingsQuery,
} from "@/lib/api/sellerApi";
import { useGetSellerOrdersQuery, useGetSellerReviewsQuery } from "@/lib/redux/service/sellerDashboardApi";
import { getFileUrl } from "@/lib/utils";

type StockListing = {
  uuid?: string;
  title?: string;
  stockQty?: number;
  stock?: number;
  status?: string;
};

function listingItems(value: unknown): StockListing[] {
  if (Array.isArray(value)) return value as StockListing[];
  const response = value as { content?: unknown; data?: unknown } | undefined;
  if (Array.isArray(response?.content)) return response.content as StockListing[];
  if (Array.isArray(response?.data)) return response.data as StockListing[];
  return [];
}

function StockOverview({ listings, loading }: { listings: StockListing[]; loading: boolean }) {
  const [view, setView] = React.useState<"products" | "status">("products");
  const productBars = listings
    .map((listing) => ({
      label: listing.title?.trim() || "Product",
      value: Math.max(0, Number(listing.stockQty ?? listing.stock ?? 0)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const statusBars = ["ACTIVE", "DRAFT", "ARCHIVED"].map((status) => ({
    label: status === "ARCHIVED" ? "Inactive" : status.charAt(0) + status.slice(1).toLowerCase(),
    value: listings
      .filter((listing) => (listing.status ?? "ACTIVE").toUpperCase() === status)
      .reduce((sum, listing) => sum + Math.max(0, Number(listing.stockQty ?? listing.stock ?? 0)), 0),
  }));
  const bars = view === "products" ? productBars : statusBars;
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  const peak = bars.reduce((best, bar) => bar.value > best.value ? bar : best, bars[0] ?? { label: "", value: 0 });
  const total = listings.reduce((sum, listing) => sum + Math.max(0, Number(listing.stockQty ?? listing.stock ?? 0)), 0);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><BarChart3 className="size-5" /></span>
          <div><h2 className="text-base font-bold text-gray-900">Stock Overview</h2><p className="text-xs text-gray-500">{total.toLocaleString()} units in inventory</p></div>
        </div>
        <div className="flex rounded-full bg-gray-100 p-1 text-[11px] font-semibold">
          {(["products", "status"] as const).map((option) => (
            <button key={option} type="button" onClick={() => setView(option)} className={`rounded-full px-3 py-2 capitalize transition ${view === option ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{option}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="size-5 animate-spin" />Loading stock...</div>
      ) : bars.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">No product stock available.</div>
      ) : (
        <div className="mt-7 grid grid-cols-[32px_1fr] gap-3">
          <div className="flex h-56 flex-col justify-between pb-7 text-right text-[10px] text-gray-400">
            <span>{max}</span><span>{Math.round(max * 0.75)}</span><span>{Math.round(max * 0.5)}</span><span>{Math.round(max * 0.25)}</span><span>0</span>
          </div>
          <div className="relative h-56 border-b border-gray-200">
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-28px)] flex-col justify-between">{[0, 1, 2, 3].map((line) => <span key={line} className="border-t border-dashed border-gray-200" />)}</div>
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around gap-2 px-1">
              {bars.map((bar) => {
                const highlighted = bar.label === peak.label && bar.value === peak.value;
                return (
                  <div key={bar.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                    <div className="mb-1 text-[10px] font-bold text-primary">{bar.value}</div>
                    <div title={`${bar.label}: ${bar.value} units`} className={`w-full max-w-12 rounded-t-full transition-all duration-500 ${highlighted ? "bg-primary" : "bg-primary/45"}`} style={{ height: `${Math.max(8, (bar.value / max) * 76)}%`, backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(255,255,255,.18) 5px, rgba(255,255,255,.18) 7px)" }} />
                    <span title={bar.label} className="mt-2 w-full truncate text-center text-[10px] font-medium text-gray-500">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function KpiCard({ title, value, note, icon, tone }: { title: string; value: string; note: string; icon: React.ReactNode; tone: string }) {
  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid size-9 place-items-center rounded-xl ${tone}`}>{icon}</div>
        <span className="grid size-6 place-items-center rounded-full border border-gray-200 text-xs text-gray-400">?</span>
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-950">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-emerald-600">{note}</p>
    </article>
  );
}

type DailyMetric = { label: string; sales: number; revenue: number };

type PopularProduct = { name: string; quantity: number };

function PopularProducts({ products }: { products: PopularProduct[] }) {
  const colors = ["#4F46E5", "#6D8CE8", "#9BB5F0", "#D8E1F5"];
  const ranked = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 4);
  const total = ranked.reduce((sum, product) => sum + product.quantity, 0);
  const segments = ranked.map((product, index) => {
    const previousQuantity = ranked.slice(0, index).reduce((sum, item) => sum + item.quantity, 0);
    const start = total ? (previousQuantity / total) * 100 : 0;
    const percentage = total ? (product.quantity / total) * 100 : 0;
    return `${colors[index]} ${start}% ${start + percentage}%`;
  });

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-base font-bold text-gray-900">Popular Products</h2><p className="mt-0.5 text-xs text-gray-500">Products buyers purchase most</p></div>
        <ShoppingBag className="size-5 text-indigo-600" />
      </div>
      {ranked.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-gray-500">No product sales yet.</div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row">
          <div className="relative size-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${segments.join(", ")})` }}>
            <div className="absolute inset-[30%] grid place-items-center rounded-full bg-white text-center">
              <div><p className="text-xl font-extrabold text-gray-900">{total}</p><p className="text-[10px] text-gray-500">units</p></div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {ranked.map((product, index) => (
              <div key={product.name} className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2.5 text-xs">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: colors[index] }} />
                <span title={product.name} className="truncate font-medium text-gray-600">{product.name}</span>
                <span className="font-bold text-gray-900">{total ? ((product.quantity / total) * 100).toFixed(1) : "0.0"}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SalesAnalytics({ days }: { days: DailyMetric[] }) {
  const maxSales = Math.max(...days.map((day) => day.sales), 1);
  const maxRevenue = Math.max(...days.map((day) => day.revenue), 1);
  const points = days.map((day, index) => {
    const x = days.length === 1 ? 50 : (index / (days.length - 1)) * 100;
    const y = 92 - (day.revenue / maxRevenue) * 78;
    return { x, y, ...day };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `0,100 ${linePoints} 100,100`;
  const totalSales = days.reduce((sum, day) => sum + day.sales, 0);
  const totalRevenue = days.reduce((sum, day) => sum + day.revenue, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-semibold text-gray-500">Total sales</p><p className="mt-1 text-3xl font-extrabold text-gray-950">{totalSales.toLocaleString()}</p><p className="text-xs font-medium text-emerald-600">Units sold in the last 7 days</p></div>
          <span className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">Last 7 days</span>
        </div>
        <div className="mt-7 flex h-60 items-end justify-around gap-2 border-b border-gray-200 px-2">
          {days.map((day) => (
            <div key={day.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              <div className="relative flex h-[82%] w-full max-w-12 items-end overflow-hidden rounded-t-xl bg-gray-100">
                <div title={`${day.sales} units`} className="w-full rounded-t-xl bg-gradient-to-t from-[#5B3FD6] to-[#7657F1] transition-all duration-500" style={{ height: `${Math.max(day.sales ? 8 : 2, (day.sales / maxSales) * 100)}%` }} />
              </div>
              <span className="mt-2 text-[10px] font-medium text-gray-400">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
        <p className="mt-1 text-3xl font-extrabold text-gray-950">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        <p className="text-xs font-medium text-emerald-600">Revenue in the last 7 days</p>
        <div className="mt-8 h-56 w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Seven day revenue trend">
            <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6C4CD8" stopOpacity="0.24" /><stop offset="100%" stopColor="#6C4CD8" stopOpacity="0" /></linearGradient></defs>
            {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#ECEAF1" strokeWidth="0.6" strokeDasharray="2 2" />)}
            <polygon points={areaPoints} fill="url(#revenue-fill)" />
            <polyline points={linePoints} fill="none" stroke="#5B3FD6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="1.8" fill="white" stroke="#5B3FD6" strokeWidth="1" vectorEffect="non-scaling-stroke"><title>{point.label}: ${point.revenue.toFixed(2)}</title></circle>)}
          </svg>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`size-3 rounded-full ${color}`} aria-hidden="true" />
      <h2 className="text-lg font-bold text-gray-900">{children}</h2>
    </div>
  );
}

export default function DashboardSeller() {
  const { data: profile } = useGetSellerProfileQuery();
  const { data: subscription } = useGetSellerSubscriptionQuery();
  const { data: ordersData, isLoading: isLoadingOrders } = useGetSellerOrdersQuery({ pageNumber: 0, pageSize: 20 });
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetSellerReviewsQuery({ pageNumber: 0, pageSize: 10 });
  const { data: listingsData, isLoading: isLoadingListings } = useGetMyListingsQuery({ pageNumber: 0, pageSize: 1000 });

  const ordersList = ordersData?.content || [];
  const reviewsList = reviewsData?.content || [];
  const stockListings = listingItems(listingsData);

  // Computed income & order count from real fetched data
  const totalIncome = ordersList.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const formattedIncome =
    `$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalOrdersCount = String(ordersData?.page?.totalElements ?? ordersList.length);
  const activeProducts = stockListings.filter((listing) => (listing.status ?? "ACTIVE").toUpperCase() === "ACTIVE").length;
  const usedListingSlots = stockListings.filter(
    (listing) => (listing.status ?? "ACTIVE").toUpperCase() !== "ARCHIVED",
  ).length;
  const soldOutProducts = stockListings.filter((listing) =>
    (listing.status ?? "").toUpperCase() === "SOLD_OUT" || Number(listing.stockQty ?? listing.stock ?? 0) === 0,
  ).length;
  const popularProducts = Array.from(
    ordersList.reduce((products, order) => {
      for (const item of order.items ?? []) {
        products.set(item.title, (products.get(item.title) ?? 0) + (item.quantity || 0));
      }
      return products;
    }, new Map<string, number>()),
    ([name, quantity]) => ({ name, quantity }),
  );
  const dailyMetrics: DailyMetric[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const orders = ordersList.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= date && created < nextDate;
    });
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      sales: orders.reduce((sum, order) => sum + (order.items ?? []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0),
      revenue: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    };
  });

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
                Posting Allowed • {isLoadingListings ? "…" : usedListingSlots} of {subscription.listingLimit} Listings Used
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Revenue" value={formattedIncome} note="From fetched orders" icon={<CircleDollarSign className="size-5" />} tone="bg-blue-50 text-blue-600" />
        <KpiCard title="Sold Out" value={soldOutProducts.toLocaleString()} note="Products needing restock" icon={<Boxes className="size-5" />} tone="bg-violet-50 text-violet-600" />
        <KpiCard title="Total Orders" value={totalOrdersCount} note="Current order total" icon={<ShoppingBag className="size-5" />} tone="bg-sky-50 text-sky-600" />
        <KpiCard title="Active Products" value={activeProducts.toLocaleString()} note={`${stockListings.length} total products`} icon={<PackageCheck className="size-5" />} tone="bg-emerald-50 text-emerald-600" />
      </div>

      <SalesAnalytics days={dailyMetrics} />

      <StockOverview listings={stockListings} loading={isLoadingListings} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          {/* Seller Customer Reviews / Comments */}
          <section className="h-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
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
                        {rev.buyer?.avatarFile?.uri ? (
                          <Image
                            src={getFileUrl(rev.buyer.avatarFile.uri)}
                            alt={rev.buyer.fullName || "User"}
                            width={40}
                            height={40}
                            unoptimized
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
              <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">No customer reviews yet.</div>
            )}
            <Button variant="outline" className="mt-4 w-full rounded-xl">
              View all reviews
            </Button>
          </section>
        </div>

        <div className="contents">
          <PopularProducts products={popularProducts} />

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
              <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">No customer orders yet.</div>
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
