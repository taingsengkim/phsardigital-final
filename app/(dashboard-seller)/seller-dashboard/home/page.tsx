"use client";

import React from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ExternalLink,
  Loader2,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useGetSellerProfileQuery,
  useGetSellerSubscriptionQuery,
  useGetMyListingsQuery,
} from "@/lib/api/sellerApi";
import {
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
} from "@/lib/redux/service/sellerDashboardApi";

/* The 7-day chart, revenue and best sellers are all derived client-side from
   the order list, so the window has to be wide enough to actually contain a
   week of trading rather than just the most recent screenful. */
const ORDER_SAMPLE = 200;

/* Stock levels, the active/sold-out tiles and the subscription slot count are
   all derived from the listing list, so it has to span the whole catalogue. */
const LISTING_SAMPLE = 1000;

/**
 * This page is prerendered, so anything derived from "now" — the rolling 7-day
 * window below — would be baked at build time and disagree with the browser on
 * every later day. Gate that on hydration. useSyncExternalStore is the
 * canonical read: no setState in an effect, so no cascading render.
 */
const neverChanges = () => () => {};
function useHydrated(): boolean {
  return React.useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
}

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
  if (Array.isArray(response?.content))
    return response.content as StockListing[];
  if (Array.isArray(response?.data)) return response.data as StockListing[];
  return [];
}

function money(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  icon,
  title,
  note,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {note && (
            <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function StockOverview({
  listings,
  loading,
}: {
  listings: StockListing[];
  loading: boolean;
}) {
  const [view, setView] = React.useState<"products" | "status">("products");
  const productBars = listings
    .map((listing) => ({
      label: listing.title?.trim() || "Product",
      value: Math.max(0, Number(listing.stockQty ?? listing.stock ?? 0)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const statusBars = ["ACTIVE", "DRAFT", "ARCHIVED"].map((status) => ({
    label:
      status === "ARCHIVED"
        ? "Inactive"
        : status.charAt(0) + status.slice(1).toLowerCase(),
    value: listings
      .filter(
        (listing) => (listing.status ?? "ACTIVE").toUpperCase() === status,
      )
      .reduce(
        (sum, listing) =>
          sum + Math.max(0, Number(listing.stockQty ?? listing.stock ?? 0)),
        0,
      ),
  }));
  const bars = view === "products" ? productBars : statusBars;
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  const total = listings.reduce(
    (sum, listing) =>
      sum + Math.max(0, Number(listing.stockQty ?? listing.stock ?? 0)),
    0,
  );

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle
          icon={<BarChart3 className="size-5" />}
          title="Stock overview"
          note={`${total.toLocaleString()} units in inventory`}
        />
        <div className="mb-5 flex rounded-full bg-muted p-1 text-[11px] font-semibold">
          {(["products", "status"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`rounded-full px-3 py-1.5 capitalize transition ${
                view === option
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading stock…
        </div>
      ) : bars.length === 0 || total === 0 ? (
        <EmptyState
          title="No stock to show yet"
          body="Once you publish products with stock, their levels appear here."
          action={{
            href: "/seller-dashboard/products/new",
            label: "Add a product",
          }}
        />
      ) : (
        <div className="grid grid-cols-[32px_1fr] gap-3">
          <div className="flex h-56 flex-col justify-between pb-7 text-right text-[10px] text-muted-foreground">
            <span>{max}</span>
            <span>{Math.round(max * 0.75)}</span>
            <span>{Math.round(max * 0.5)}</span>
            <span>{Math.round(max * 0.25)}</span>
            <span>0</span>
          </div>
          <div className="relative h-56 border-b border-border">
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-28px)] flex-col justify-between">
              {[0, 1, 2, 3].map((line) => (
                <span
                  key={line}
                  className="border-t border-dashed border-border"
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-end justify-around gap-2 px-1">
              {bars.map((bar) => (
                <div
                  key={bar.label}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div className="mb-1 text-[10px] font-bold text-primary">
                    {bar.value}
                  </div>
                  <div
                    title={`${bar.label}: ${bar.value} units`}
                    className="w-full max-w-12 rounded-t-lg bg-primary/70 transition-all duration-500"
                    style={{
                      height: `${Math.max(4, (bar.value / max) * 76)}%`,
                    }}
                  />
                  <span
                    title={bar.label}
                    className="mt-2 w-full truncate text-center text-[10px] font-medium text-muted-foreground"
                  >
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function KpiCard({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`grid size-9 place-items-center rounded-xl ${tone}`}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
    </article>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      {action && (
        <Button asChild variant="outline" size="sm" className="mt-2 rounded-xl">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

type DailyMetric = { label: string; sales: number; revenue: number };
type PopularProduct = { name: string; quantity: number };

function PopularProducts({ products }: { products: PopularProduct[] }) {
  const colors = ["#4F46E5", "#6D8CE8", "#9BB5F0", "#D8E1F5"];
  const ranked = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);
  const total = ranked.reduce((sum, product) => sum + product.quantity, 0);
  const segments = ranked.map((product, index) => {
    const before = ranked
      .slice(0, index)
      .reduce((sum, item) => sum + item.quantity, 0);
    const start = total ? (before / total) * 100 : 0;
    const share = total ? (product.quantity / total) * 100 : 0;
    return `${colors[index]} ${start}% ${start + share}%`;
  });

  return (
    <Panel>
      <SectionTitle
        icon={<ShoppingBag className="size-5" />}
        title="Best sellers"
        note="Most purchased products"
      />
      {ranked.length === 0 ? (
        <EmptyState
          title="No sales yet"
          body="When buyers start ordering, your best-selling products show up here."
        />
      ) : (
        <div className="flex flex-col items-center gap-7 sm:flex-row">
          <div
            className="relative size-36 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${segments.join(", ")})` }}
          >
            <div className="absolute inset-[30%] grid place-items-center rounded-full bg-card text-center">
              <div>
                <p className="text-xl font-extrabold text-foreground">
                  {total}
                </p>
                <p className="text-[10px] text-muted-foreground">units</p>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {ranked.map((product, index) => (
              <div
                key={product.name}
                className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2.5 text-xs"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: colors[index] }}
                />
                <span
                  title={product.name}
                  className="truncate font-medium text-muted-foreground"
                >
                  {product.name}
                </span>
                <span className="font-bold text-foreground">
                  {total
                    ? ((product.quantity / total) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
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
  const totalSales = days.reduce((sum, day) => sum + day.sales, 0);
  const totalRevenue = days.reduce((sum, day) => sum + day.revenue, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Units sold
            </p>
            <p className="mt-1 text-3xl font-extrabold text-foreground">
              {totalSales.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Across the last 7 days
            </p>
          </div>
          <span className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
            Last 7 days
          </span>
        </div>
        <div className="mt-7 flex h-56 items-end justify-around gap-2 border-b border-border px-2">
          {days.map((day) => (
            <div
              key={day.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div className="relative flex h-[82%] w-full max-w-12 items-end overflow-hidden rounded-t-xl bg-muted">
                <div
                  title={`${day.sales} units`}
                  className="w-full rounded-t-xl bg-primary transition-all duration-500"
                  style={{
                    height: `${day.sales ? Math.max(8, (day.sales / maxSales) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-medium text-muted-foreground">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-sm font-semibold text-muted-foreground">Revenue</p>
        <p className="mt-1 text-3xl font-extrabold text-foreground">
          {money(totalRevenue)}
        </p>
        <p className="text-xs text-muted-foreground">Across the last 7 days</p>
        <div className="mt-8 h-52 w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Seven day revenue trend"
          >
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C4CD8" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#6C4CD8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25, 50, 75].map((y) => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth="0.6"
                strokeDasharray="2 2"
              />
            ))}
            <polygon
              points={`0,100 ${linePoints} 100,100`}
              fill="url(#revenue-fill)"
            />
            <polyline
              points={linePoints}
              fill="none"
              stroke="#6C4CD8"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((point) => (
              <circle
                key={point.label}
                cx={point.x}
                cy={point.y}
                r="1.8"
                className="fill-card"
                stroke="#6C4CD8"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              >
                <title>{`${point.label}: ${money(point.revenue)}`}</title>
              </circle>
            ))}
          </svg>
        </div>
      </Panel>
    </div>
  );
}

export default function DashboardSeller() {
  const { data: profile } = useGetSellerProfileQuery();
  const { data: subscription } = useGetSellerSubscriptionQuery();
  const { data: ordersData, isLoading: isLoadingOrders } =
    useGetSellerOrdersQuery({ pageNumber: 0, pageSize: ORDER_SAMPLE });
  const { data: reviewsData, isLoading: isLoadingReviews } =
    useGetSellerReviewsQuery({ pageNumber: 0, pageSize: 10 });
  const { data: listingsData, isLoading: isLoadingListings } =
    useGetMyListingsQuery({ pageNumber: 0, pageSize: LISTING_SAMPLE });

  const ordersList = ordersData?.content || [];
  const reviewsList = reviewsData?.content || [];
  const stockListings = listingItems(listingsData);

  const totalOrders = ordersData?.page?.totalElements ?? ordersList.length;
  const sampledAll = ordersList.length >= totalOrders;
  const lifetimeRevenue = ordersList.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0,
  );

  /* The plan banner reports usage against the slot limit; until the
     subscription lands, counting the non-archived catalogue keeps it honest. */
  const usedListingSlots = stockListings.filter(
    (listing) => (listing.status ?? "ACTIVE").toUpperCase() !== "ARCHIVED",
  ).length;
  const listingsUsed = subscription?.listingsUsed ?? usedListingSlots;

  const activeProducts = stockListings.filter(
    (listing) => (listing.status ?? "ACTIVE").toUpperCase() === "ACTIVE",
  ).length;
  const soldOutProducts = stockListings.filter(
    (listing) =>
      (listing.status ?? "").toUpperCase() === "SOLD_OUT" ||
      Number(listing.stockQty ?? listing.stock ?? 0) === 0,
  ).length;

  const popularProducts: PopularProduct[] = Array.from(
    ordersList.reduce((products, order) => {
      for (const item of order.items ?? []) {
        products.set(
          item.title,
          (products.get(item.title) ?? 0) + (item.quantity || 0),
        );
      }
      return products;
    }, new Map<string, number>()),
    ([name, quantity]) => ({ name, quantity }),
  );

  const dailyMetrics: DailyMetric[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const orders = ordersList.filter((order) => {
      const created = new Date(order.createdAt);
      return created >= date && created < next;
    });
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      sales: orders.reduce(
        (sum, order) =>
          sum +
          (order.items ?? []).reduce(
            (itemSum, item) => itemSum + (item.quantity || 0),
            0,
          ),
        0,
      ),
      revenue: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    };
  });

  const isSuspended = Boolean(profile?.suspendedAt);
  const hydrated = useHydrated();

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 font-sans sm:p-6">
      {/* ── store header ── */}
      <Panel className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            {profile?.logoUri ? (
              <Image
                src={profile.logoUri}
                alt={profile.businessName || "Store"}
                fill
                className="object-cover"
              />
            ) : (
              <Store className="size-7" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-extrabold text-foreground">
                {profile?.businessName || "Seller Dashboard"}
              </h1>
              {isSuspended ? (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  Suspended
                </span>
              ) : profile?.isActive ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Active
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {profile?.businessType
                ? `${profile.businessType} · ${profile.city || profile.province || "Phsar Digital seller"}`
                : "Welcome back to your seller overview"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {profile?.id && (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/stores/${profile.id}`}>
                View storefront <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          )}
          <Button asChild className="rounded-xl">
            <Link href="/subscriptions">
              <Sparkles className="size-4" /> Subscription
            </Link>
          </Button>
        </div>
      </Panel>

      {subscription?.status === "ACTIVE" && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1A1330] via-[#2A1D4E] to-[#6C4CD8] p-5 text-white shadow-md md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-yellow-300">
              <Zap className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {subscription.planDisplayName || subscription.plan}
              </span>
              <h3 className="mt-0.5 text-base font-bold text-white">
                Posting allowed • {listingsUsed} of {subscription.listingLimit}{" "}
                listings used
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/80">
              Expires:{" "}
              <strong className="text-white">
                {subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString()
                  : "Active"}
              </strong>
            </span>
            <Link
              href="/subscriptions"
              className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Revenue"
          value={money(lifetimeRevenue)}
          note={
            sampledAll
              ? "All orders to date"
              : `Most recent ${ordersList.length} of ${totalOrders} orders`
          }
          icon={<CircleDollarSign className="size-5" />}
          tone="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
        />
        <KpiCard
          title="Total orders"
          value={totalOrders.toLocaleString()}
          note="Orders received all time"
          icon={<ShoppingBag className="size-5" />}
          tone="bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
        />
        <KpiCard
          title="Active products"
          value={activeProducts.toLocaleString()}
          note={`${stockListings.length} products total`}
          icon={<PackageCheck className="size-5" />}
          tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
        />
        <KpiCard
          title="Out of stock"
          value={soldOutProducts.toLocaleString()}
          note="Products needing restock"
          icon={<Boxes className="size-5" />}
          tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
        />
      </div>

      {hydrated ? (
        <SalesAnalytics days={dailyMetrics} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
          <Panel className="h-[368px]">
            <Loader2 className="size-5 animate-spin text-primary" />
          </Panel>
          <Panel className="h-[368px]">
            <Loader2 className="size-5 animate-spin text-primary" />
          </Panel>
        </div>
      )}

      <StockOverview listings={stockListings} loading={isLoadingListings} />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── reviews ── */}
        <Panel className="lg:col-span-1">
          <SectionTitle
            icon={<Star className="size-5" />}
            title="Recent reviews"
            note="What buyers are saying"
          />
          {isLoadingReviews ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading reviews…
            </div>
          ) : reviewsList.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              body="Reviews buyers leave on your products will appear here."
            />
          ) : (
            <>
              <div className="divide-y divide-border">
                {reviewsList.slice(0, 5).map((review) => (
                  <article key={review.uuid} className="py-3.5 first:pt-0">
                    <div className="flex gap-3">
                      <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {review.buyer?.avatarUrl ? (
                          <Image
                            src={review.buyer.avatarUrl}
                            alt={review.buyer.displayName || "Buyer"}
                            width={36}
                            height={36}
                            className="size-9 rounded-full object-cover"
                          />
                        ) : (
                          (review.buyer?.displayName || "C")[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-xs leading-5">
                        <div className="flex items-center gap-1.5">
                          <strong className="truncate text-foreground">
                            {review.buyer?.displayName || "Customer"}
                          </strong>
                          <span className="ml-1 flex shrink-0 items-center gap-0.5 text-amber-500">
                            <Star className="size-3 fill-amber-400" />
                            <span className="font-bold">{review.rating}</span>
                          </span>
                          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.listing?.title && (
                          <p className="mt-0.5 truncate text-muted-foreground">
                            {review.listing.title}
                          </p>
                        )}
                        <p className="mt-1 line-clamp-3 text-foreground">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4 w-full rounded-xl"
              >
                <Link href="/seller-dashboard/products/comment">
                  View all reviews <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </Panel>

        <PopularProducts products={popularProducts} />

        {/* ── recent orders ── */}
        <Panel>
          <SectionTitle
            icon={<ShoppingBag className="size-5" />}
            title="Recent orders"
            note="Latest customer purchases"
          />
          {isLoadingOrders ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading orders…
            </div>
          ) : ordersList.length === 0 ? (
            <EmptyState
              title="No orders yet"
              body="Orders from buyers will show up here as they come in."
              action={{
                href: "/seller-dashboard/products/dashboard",
                label: "Manage products",
              }}
            />
          ) : (
            <>
              <div className="divide-y divide-border">
                {ordersList.slice(0, 5).map((order) => (
                  <div
                    key={order.uuid}
                    className="flex items-center justify-between gap-3 py-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">
                        {order.buyerName || `Order #${order.uuid.slice(0, 8)}`}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {order.items?.length || 1} item
                        {(order.items?.length || 1) === 1 ? "" : "s"} ·{" "}
                        <span className="font-semibold text-foreground">
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-foreground">
                      {money(order.totalPrice || 0)}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4 w-full rounded-xl"
              >
                <Link href="/seller-dashboard/orders">
                  View all orders <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
