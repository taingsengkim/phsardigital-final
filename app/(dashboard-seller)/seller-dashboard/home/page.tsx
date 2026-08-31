"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  ExternalLink,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
  TriangleAlert,
  Truck,
} from "lucide-react"
import { cn, getFileUrl } from "@/lib/utils"
import { useGetSellerDashboardOverviewQuery } from "@/lib/redux/service/sellerDashboardApi"
import type { DashboardSalesDay, DashboardTopProduct } from "@/lib/types/seller-dashboard"
import { Button } from "@/components/ui/button"

function formatMoney(amount: number): string {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function SellerDashboardHomePage() {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetSellerDashboardOverviewQuery()

  // Selected period for sales breakdown in Hero Card
  const [salesPeriod, setSalesPeriod] = React.useState<"today" | "week" | "month">("today")
  // Chart Metric Toggle: "revenue" vs "orders"
  const [chartMetric, setChartMetric] = React.useState<"revenue" | "orders">("revenue")
  // Hovered day in 7-day chart
  const [hoveredDay, setHoveredDay] = React.useState<DashboardSalesDay | null>(null)

  // 403 Forbidden check (not a seller)
  const is403 = (error as any)?.status === 403

  // ── 1. LOADING SKELETON STATE (No layout shift) ──
  if (isLoading) {
    return (
      <main className="min-h-[calc(100svh-70px)] bg-slate-50/70 p-4 sm:p-7 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-72 rounded-lg bg-slate-200 animate-pulse" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-slate-200 animate-pulse" />
        </div>

        {/* Row 1 Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200/80 animate-pulse" />
        </div>

        {/* Row 2 Skeleton */}
        <div className="h-44 rounded-2xl bg-slate-200/80 animate-pulse" />

        {/* Row 3 Skeleton */}
        <div className="h-80 rounded-2xl bg-slate-200/80 animate-pulse" />

        {/* Row 4 Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="h-72 rounded-2xl bg-slate-200/80 animate-pulse" />
        </div>
      </main>
    )
  }

  // ── 2. ERROR STATE (Single retry affordance or 403 redirect) ──
  if (isError || !data) {
    if (is403) {
      return (
        <main className="flex min-h-[calc(100svh-70px)] flex-col items-center justify-center bg-slate-50/70 p-6 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-700 mb-4">
            <Store className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Seller Account Required</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md">
            You need an approved seller profile to access the seller dashboard. Apply to become a merchant on PhsarDigital.
          </p>
          <Button
            onClick={() => router.push("/seller-dashboard/shop")}
            className="mt-6 rounded-xl bg-[#6C4CD8] hover:bg-[#5B3DC0]"
          >
            Go to Seller Application <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </main>
      )
    }

    return (
      <main className="flex min-h-[calc(100svh-70px)] flex-col items-center justify-center bg-slate-50/70 p-6 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
          <CircleAlert className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Failed to Load Dashboard Overview</h2>
        <p className="mt-1 text-sm text-slate-500 max-w-md">
          We encountered an issue retrieving your shop metrics. Please check your connection and try again.
        </p>
        <Button
          onClick={() => refetch()}
          className="mt-6 rounded-xl bg-[#6C4CD8] hover:bg-[#5B3DC0]"
        >
          <RefreshCw className="size-4 mr-1.5" /> Try Again
        </Button>
      </main>
    )
  }

  const { revenue, orders, inventory, salesChart7Days, topProducts } = data

  // Brand-new shop check (all zeros & empty catalog)
  const isBrandNewShop = orders.total === 0 && inventory.totalProducts === 0

  // Chart Calculations
  const chartDays = salesChart7Days && salesChart7Days.length === 7 ? salesChart7Days : []
  const maxRevenue = Math.max(...chartDays.map((d) => d.revenue || 0), 50)
  const maxOrders = Math.max(...chartDays.map((d) => d.ordersCount || 0), 5)

  // Selected period revenue figure
  const activePeriodSales =
    salesPeriod === "today"
      ? revenue.todayRevenue
      : salesPeriod === "week"
      ? revenue.thisWeekRevenue
      : revenue.thisMonthRevenue

  const activePeriodLabel =
    salesPeriod === "today"
      ? "Today's booked sales"
      : salesPeriod === "week"
      ? "This week's booked sales"
      : "This month's booked sales"

  return (
    <main className="min-h-[calc(100svh-70px)] bg-slate-50/70 p-4 sm:p-7 space-y-6">
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Shop Overview</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time performance, pending fulfillment actions, and inventory status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-[#6C4CD8]/30 bg-[#F1EFFA]/80 text-xs sm:text-sm font-bold text-[#6C4CD8] shadow-xs hover:bg-[#E5E0F5]"
          >
            <Link href="/subscriptions">
              <CreditCard className="size-4 mr-1.5" /> Subscription Plan
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-[#6C4CD8] text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#5B3DC0]"
          >
            <Link href="/seller-dashboard/products/drafts">
              <Plus className="size-4 mr-1.5" /> Add Product
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50"
            title="Refresh metrics"
          >
            <RefreshCw className={cn("size-4 text-slate-600", isFetching && "animate-spin")} />
          </Button>
        </div>
      </header>

      {/* ── Brand New Shop Onboarding Callout ── */}
      {isBrandNewShop && (
        <section className="relative overflow-hidden rounded-2xl border border-[#6C4CD8]/30 bg-gradient-to-r from-[#F1EFFA] via-white to-purple-50 p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#6C4CD8] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
                <Sparkles className="size-3" /> Get Started
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Welcome to your PhsarDigital Seller Hub!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Your shop is ready. Publish your first item to start receiving orders and earning revenue.
              </p>
            </div>
            <Button
              asChild
              className="rounded-xl bg-[#6C4CD8] px-5 text-sm font-bold text-white hover:bg-[#5B3DC0] shadow-sm shrink-0"
            >
              <Link href="/seller-dashboard/products/drafts">
                <PackagePlus className="size-4 mr-1.5" /> Publish First Product
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── ROW 1: ACTION FIRST (Pending Orders + Today's Activity) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pending Orders Card (Amber Action Required vs All caught up) */}
        <Link
          href="/seller-dashboard/orders?status=PENDING"
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer shadow-xs hover:shadow-md",
            orders.pending > 0
              ? "border-amber-300 bg-amber-50/50 hover:bg-amber-50/80"
              : "border-slate-200 bg-white hover:bg-slate-50/80",
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-black uppercase tracking-wider",
                orders.pending > 0 ? "text-amber-800" : "text-slate-500",
              )}
            >
              {orders.pending > 0 ? "Action Required" : "Pending Orders"}
            </span>
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl",
                orders.pending > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500",
              )}
            >
              {orders.pending > 0 ? <Clock className="size-5" /> : <CircleCheck className="size-5" />}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-slate-950 tabular-nums">
                {orders.pending}
              </span>
              <p
                className={cn(
                  "mt-1 text-xs font-semibold",
                  orders.pending > 0 ? "text-amber-800" : "text-slate-500",
                )}
              >
                {orders.pending > 0
                  ? `${orders.pending} order${orders.pending === 1 ? "" : "s"} awaiting your confirmation`
                  : "All caught up! No pending orders"}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center text-xs font-bold transition group-hover:translate-x-0.5",
                orders.pending > 0 ? "text-amber-700" : "text-slate-500",
              )}
            >
              View orders <ChevronRight className="size-3.5 ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Today's Activity Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Today&apos;s Activity
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="size-5" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 tabular-nums">
                  {orders.todayCount}
                </span>
                <span className="text-xs font-bold text-slate-500">orders booked</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Booked sales: <strong className="text-slate-950 font-bold tabular-nums">{formatMoney(revenue.todayRevenue)}</strong>
              </p>
            </div>

            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
              Since midnight
            </span>
          </div>
        </div>
      </section>

      {/* ── ROW 2: REVENUE HERO (Never sum lifetimeEarned + inFlight) ── */}
      <section className="rounded-2xl border border-[#E2DFEC] bg-white p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Main Hero Figure */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#6C4CD8]">
                Collected Lifetime Revenue
              </span>

              {/* percentageGrowth Chip (Handles NULL safely — NEVER NaN% or +0%) */}
              {revenue.percentageGrowth === null ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                  New Shop
                </span>
              ) : revenue.percentageGrowth > 0 ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200 tabular-nums">
                  <ArrowUpRight className="size-3" /> +{revenue.percentageGrowth.toFixed(1)}% vs prior 7d
                </span>
              ) : revenue.percentageGrowth < 0 ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-700 border border-slate-200 tabular-nums">
                  <ArrowDownRight className="size-3" /> {revenue.percentageGrowth.toFixed(1)}% vs prior 7d
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  0.0% vs prior 7d
                </span>
              )}
            </div>

            {/* Hero Number: lifetimeEarned */}
            <div className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight tabular-nums">
              {formatMoney(revenue.lifetimeEarned)}
            </div>

            {/* Quieter Secondary Line: inFlight (Never added to hero) */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <span className="inline-flex items-center gap-1 font-bold text-[#6C4CD8] tabular-nums">
                <Truck className="size-3.5 text-[#6C4CD8]" />
                +{formatMoney(revenue.inFlight)}
              </span>
              <span>awaiting delivery (in fulfilment)</span>
            </div>
          </div>

          {/* Segmented Sales Control: Today / This Week / This Month */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4 min-w-[280px] space-y-2">
            <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
              {(["today", "week", "month"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSalesPeriod(period)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-center capitalize transition cursor-pointer",
                    salesPeriod === period
                      ? "bg-white text-slate-950 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {activePeriodLabel}
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-950 tabular-nums">
                {formatMoney(activePeriodSales)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROW 3: 7-DAY CHART (Dual Metric: Revenue vs Orders) ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-950">7-Day Sales Performance</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Daily trend for the past 7 days, ending at today.
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartMetric("revenue")}
              className={cn(
                "rounded-lg px-3 py-1.5 transition cursor-pointer",
                chartMetric === "revenue"
                  ? "bg-white text-[#6C4CD8] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              Revenue ($)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric("orders")}
              className={cn(
                "rounded-lg px-3 py-1.5 transition cursor-pointer",
                chartMetric === "orders"
                  ? "bg-white text-[#6C4CD8] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              Orders Count
            </button>
          </div>
        </div>

        {/* Responsive Bar Chart Canvas */}
        <div className="relative pt-4">
          {/* Active Hover Tooltip Callout */}
          {hoveredDay && (
            <div className="absolute top-0 right-0 rounded-xl border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-white shadow-md z-10 flex items-center gap-3">
              <span className="font-bold text-slate-300">{hoveredDay.date} ({hoveredDay.dayLabel}):</span>
              <span className="font-black text-white tabular-nums">{formatMoney(hoveredDay.revenue)}</span>
              <span className="text-slate-400 tabular-nums">({hoveredDay.ordersCount} orders)</span>
            </div>
          )}

          {/* Bars Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-56 items-end border-b border-slate-200 pb-3 pt-6">
            {chartDays.map((day, idx) => {
              const isToday = idx === chartDays.length - 1
              const value = chartMetric === "revenue" ? day.revenue || 0 : day.ordersCount || 0
              const maxVal = chartMetric === "revenue" ? maxRevenue : maxOrders
              const barHeightPct = Math.max(8, Math.round((value / maxVal) * 100))

              return (
                <div
                  key={day.date || idx}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="group relative flex flex-col items-center h-full justify-end cursor-pointer"
                >
                  {/* Floating Value on hover */}
                  <span className="mb-1 text-[11px] font-extrabold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {chartMetric === "revenue" ? formatMoney(day.revenue) : `${day.ordersCount}`}
                  </span>

                  {/* Bar Element */}
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={cn(
                      "w-full max-w-[48px] rounded-t-xl transition-all duration-200 group-hover:scale-y-105 group-hover:brightness-110",
                      isToday
                        ? "bg-gradient-to-t from-[#6C4CD8] to-[#8B6EED] shadow-sm"
                        : value > 0
                        ? "bg-slate-200 group-hover:bg-[#6C4CD8]/70"
                        : "bg-slate-100 border-t border-slate-200",
                    )}
                  />

                  {/* Axis Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={cn(
                        "block text-xs font-bold",
                        isToday ? "text-[#6C4CD8] font-black" : "text-slate-600",
                      )}
                    >
                      {day.dayLabel}
                    </span>
                    {isToday && (
                      <span className="block text-[9px] font-black uppercase text-[#6C4CD8]">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ROW 4: INVENTORY + TOP PRODUCTS (Side by Side) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inventory Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-950">Inventory & Stock</h2>
                <p className="text-xs text-slate-500">
                  {inventory.totalInventoryUnits.toLocaleString()} total units on sale across {inventory.totalProducts} products
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                <Link href="/seller-dashboard/products/dashboard">
                  Manage <ChevronRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Inventory Status Breakdown Pills */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-center">
                <span className="text-xs font-bold text-emerald-800">Active</span>
                <p className="mt-1 text-2xl font-black text-emerald-950 tabular-nums">
                  {inventory.activeProducts}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <span className="text-xs font-bold text-slate-600">Draft</span>
                <p className="mt-1 text-2xl font-black text-slate-950 tabular-nums">
                  {inventory.draftProducts}
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-center">
                <span className="text-xs font-bold text-rose-800">Sold Out</span>
                <p className="mt-1 text-2xl font-black text-rose-950 tabular-nums">
                  {inventory.soldOutProducts}
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock Warning Row */}
          <div className="pt-3 border-t border-slate-100">
            {inventory.lowStockProducts > 0 ? (
              <Link
                href="/seller-dashboard/products/dashboard"
                className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 hover:bg-amber-100/70 transition"
              >
                <div className="flex items-center gap-2 font-bold">
                  <TriangleAlert className="size-4 text-amber-600 shrink-0" />
                  <span>{inventory.lowStockProducts} products running low on stock</span>
                </div>
                <span className="font-extrabold text-amber-800 underline">Restock Now →</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 font-medium">
                <CircleCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Stock levels healthy across all products</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Selling Products Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">Top Selling Products</h2>
              <p className="text-xs text-slate-500">Best performers by units and revenue</p>
            </div>
          </div>

          {topProducts && topProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topProducts.slice(0, 5).map((product, idx) => {
                const imgUrl = product.thumbnailUrl
                  ? product.thumbnailUrl.startsWith("http") || product.thumbnailUrl.startsWith("/")
                    ? product.thumbnailUrl
                    : getFileUrl(product.thumbnailUrl)
                  : null

                return (
                  <div key={product.listingUuid || idx} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={product.title} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-400">
                          <Package className="size-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      {product.slug ? (
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="text-xs sm:text-sm font-bold text-slate-950 hover:text-[#6C4CD8] transition line-clamp-1 flex items-center gap-1"
                        >
                          {product.title}
                          <ExternalLink className="size-3 text-slate-400 shrink-0" />
                        </Link>
                      ) : (
                        <p className="text-xs sm:text-sm font-bold text-slate-950 line-clamp-1">{product.title}</p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                          {product.unitsSold} sold
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-black text-sm text-slate-950 tabular-nums shrink-0">
                      {formatMoney(product.totalRevenue)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center p-6 text-slate-400">
              <Package className="size-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No top selling products yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                As customer orders are fulfilled, your best-performing products will be ranked here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
