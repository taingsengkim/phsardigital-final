"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  ExternalLink,
  Layers,
  LineChart,
  Package,
  PackageCheck,
  PackagePlus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react"
import { cn, getFileUrl } from "@/lib/utils"
import { useGetSellerDashboardOverviewQuery } from "@/lib/redux/service/sellerDashboardApi"
import {
  useGetSellerProfileQuery,
  useGetSellerSubscriptionQuery,
} from "@/lib/api/sellerApi"
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

  const { data: profile } = useGetSellerProfileQuery()
  const { data: subscription } = useGetSellerSubscriptionQuery()

  // Selected period for sales breakdown in Hero Card
  const [salesPeriod, setSalesPeriod] = React.useState<"today" | "week" | "month">("today")
  // Chart Metric Toggle: "revenue" vs "orders"
  const [chartMetric, setChartMetric] = React.useState<"revenue" | "orders">("revenue")
  // Hovered day in 7-day chart
  const [hoveredDayIndex, setHoveredDayIndex] = React.useState<number | null>(null)

  // 403 Forbidden check (not a seller)
  const is403 = (error as any)?.status === 403

  // ── 1. LOADING SKELETON STATE (Zero layout shift) ──
  if (isLoading) {
    return (
      <main className="min-h-[calc(100svh-70px)] bg-[#F8F9FC] p-4 sm:p-7 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-80 rounded-xl bg-slate-200/70 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>

        {/* Row 1 Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-36 rounded-3xl bg-slate-200/70 animate-pulse" />
          <div className="h-36 rounded-3xl bg-slate-200/70 animate-pulse" />
        </div>

        {/* Row 2 Skeleton */}
        <div className="h-48 rounded-3xl bg-slate-200/70 animate-pulse" />

        {/* Row 3 Skeleton */}
        <div className="h-84 rounded-3xl bg-slate-200/70 animate-pulse" />

        {/* Row 4 Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-3xl bg-slate-200/70 animate-pulse" />
          <div className="h-80 rounded-3xl bg-slate-200/70 animate-pulse" />
        </div>
      </main>
    )
  }

  // ── 2. ERROR STATE (Single retry affordance or 403 redirect) ──
  if (isError || !data) {
    if (is403) {
      return (
        <main className="flex min-h-[calc(100svh-70px)] flex-col items-center justify-center bg-[#F8F9FC] p-6 text-center">
          <div className="grid size-18 place-items-center rounded-3xl bg-amber-100/80 text-amber-700 mb-4 shadow-xs">
            <Store className="size-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Seller Account Required</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">
            You need an approved merchant store profile to access the seller hub. Apply to launch your storefront on PhsarDigital.
          </p>
          <Button
            onClick={() => router.push("/seller-dashboard/shop")}
            className="mt-6 rounded-2xl bg-[#6C4CD8] hover:bg-[#5B3DC0] px-6 py-2.5 font-bold shadow-md shadow-[#6C4CD8]/20"
          >
            Go to Store Application <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </main>
      )
    }

    return (
      <main className="flex min-h-[calc(100svh-70px)] flex-col items-center justify-center bg-[#F8F9FC] p-6 text-center">
        <div className="grid size-18 place-items-center rounded-3xl bg-rose-100 text-rose-600 mb-4 shadow-xs">
          <CircleAlert className="size-9" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Failed to Load Dashboard Overview</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">
          We could not retrieve your store metrics right now. Please check your network connection and try again.
        </p>
        <Button
          onClick={() => refetch()}
          className="mt-6 rounded-2xl bg-[#6C4CD8] hover:bg-[#5B3DC0] px-6 py-2.5 font-bold shadow-md shadow-[#6C4CD8]/20"
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
  const maxRevenue = Math.max(...chartDays.map((d) => d.revenue || 0), 100)
  const maxOrders = Math.max(...chartDays.map((d) => d.ordersCount || 0), 5)
  const total7DayRevenue = chartDays.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const total7DayOrders = chartDays.reduce((sum, d) => sum + (d.ordersCount || 0), 0)

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

  // Inventory ratios
  const totalInv = inventory.totalProducts || 1
  const activePct = Math.round((inventory.activeProducts / totalInv) * 100)
  const draftPct = Math.round((inventory.draftProducts / totalInv) * 100)
  const soldOutPct = Math.max(0, 100 - activePct - draftPct)

  const activePlanName = subscription?.planDisplayName || "Starter Plan"

  return (
    <main className="min-h-[calc(100svh-70px)] bg-[#F8F9FC] p-4 sm:p-7 space-y-6">
      {/* ── TOP HEADER: MERCHANT PROFILE & QUICK ACTIONS ── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-[#6C4CD8]/20 bg-[#F1EFFA] shadow-xs">
            {profile?.logoUri ? (
              <Image
                src={profile.logoUri}
                alt={profile.businessName || "Store"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[#6C4CD8]">
                <Store className="size-7" />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight truncate">
                {profile?.businessName || "Your Merchant Store"}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
                <BadgeCheck className="size-3.5" /> Verified
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
              <Link
                href="/subscriptions"
                className="inline-flex items-center gap-1 font-bold text-[#6C4CD8] hover:underline"
              >
                <Crown className="size-3.5 text-amber-500" />
                {activePlanName}
              </Link>
              <span>•</span>
              <span>{inventory.totalProducts} Products in Catalog</span>
              <span>•</span>
              <span className="tabular-nums font-bold text-slate-700">
                {orders.total} Lifetime Orders
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-900"
          >
            <Link href="/subscriptions">
              <CreditCard className="size-4 mr-1.5 text-[#6C4CD8]" /> Plan & Billing
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-2xl bg-[#6C4CD8] text-xs sm:text-sm font-bold text-white shadow-md shadow-[#6C4CD8]/25 hover:bg-[#5B3DC0] transition-all hover:scale-[1.02]"
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
            className="rounded-2xl border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50"
            title="Refresh metrics"
          >
            <RefreshCw className={cn("size-4 text-slate-600", isFetching && "animate-spin")} />
          </Button>
        </div>
      </header>

      {/* ── BRAND NEW SHOP ONBOARDING BANNER ── */}
      {isBrandNewShop && (
        <section className="relative overflow-hidden rounded-3xl border border-[#6C4CD8]/30 bg-gradient-to-r from-[#F1EFFA] via-white to-purple-50 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#6C4CD8] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
                <Sparkles className="size-3.5" /> Storefront Ready
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Welcome to your PhsarDigital Merchant Dashboard!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Your shop is active and ready to take customer orders. Publish your first item to begin generating sales.
              </p>
            </div>
            <Button
              asChild
              className="rounded-2xl bg-[#6C4CD8] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#5B3DC0] shadow-md shadow-[#6C4CD8]/25 shrink-0"
            >
              <Link href="/seller-dashboard/products/drafts">
                <PackagePlus className="size-4 mr-1.5" /> Publish First Product
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── ROW 1: ACTION FIRST (Pending Orders + Today's Activity) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pending Orders Card */}
        <Link
          href="/seller-dashboard/orders?status=PENDING"
          className={cn(
            "group relative overflow-hidden rounded-3xl border p-6 transition-all cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5",
            orders.pending > 0
              ? "border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40"
              : "border-slate-200/90 bg-white hover:border-[#6C4CD8]/40",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-wider",
                  orders.pending > 0 ? "text-amber-800" : "text-slate-500",
                )}
              >
                {orders.pending > 0 ? "Action Required" : "Fulfillment Status"}
              </span>
              {orders.pending > 0 && (
                <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>

            <span
              className={cn(
                "grid size-11 place-items-center rounded-2xl shadow-xs transition-transform group-hover:scale-110",
                orders.pending > 0
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200",
              )}
            >
              {orders.pending > 0 ? <Clock className="size-5" /> : <CheckCircle2 className="size-6" />}
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-4xl sm:text-5xl font-black text-slate-950 tabular-nums tracking-tight">
                {orders.pending}
              </span>
              <p
                className={cn(
                  "mt-1.5 text-xs font-bold",
                  orders.pending > 0 ? "text-amber-800" : "text-slate-500",
                )}
              >
                {orders.pending > 0
                  ? `${orders.pending} order${orders.pending === 1 ? "" : "s"} awaiting confirmation & dispatch`
                  : "All caught up! No orders pending confirmation"}
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center text-xs font-extrabold transition-all group-hover:translate-x-1",
                orders.pending > 0 ? "text-amber-700" : "text-[#6C4CD8]",
              )}
            >
              Manage orders <ChevronRight className="size-4 ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Today's Activity Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Today&apos;s Sales Activity
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                Live
              </span>
            </div>

            <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
              <ShoppingBag className="size-5" />
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-950 tabular-nums tracking-tight">
                  {orders.todayCount}
                </span>
                <span className="text-sm font-extrabold text-slate-500">orders booked</span>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-slate-600">
                Booked sales:{" "}
                <strong className="text-slate-950 font-black tabular-nums text-sm">
                  {formatMoney(revenue.todayRevenue)}
                </strong>
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-200/70">
              Since midnight (00:00)
            </div>
          </div>
        </div>
      </section>

      {/* ── ROW 2: REVENUE HERO (Never sum lifetimeEarned + inFlight) ── */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Main Hero Figure */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#6C4CD8] bg-[#F1EFFA] px-2.5 py-1 rounded-lg">
                Delivered & Collected Revenue
              </span>

              {/* percentageGrowth Chip (Handles NULL safely — NEVER NaN% or +0%) */}
              {revenue.percentageGrowth === null ? (
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                  New Shop
                </span>
              ) : revenue.percentageGrowth > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-[11px] font-black text-emerald-700 border border-emerald-200 tabular-nums">
                  <ArrowUpRight className="size-3.5" /> +{revenue.percentageGrowth.toFixed(1)}% vs prior 7d
                </span>
              ) : revenue.percentageGrowth < 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-black text-slate-700 border border-slate-200 tabular-nums">
                  <ArrowDownRight className="size-3.5" /> {revenue.percentageGrowth.toFixed(1)}% vs prior 7d
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-600">
                  0.0% vs prior 7d
                </span>
              )}
            </div>

            {/* Hero Number: lifetimeEarned */}
            <div className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight tabular-nums">
              {formatMoney(revenue.lifetimeEarned)}
            </div>

            {/* Quieter Secondary Line: inFlight (Never added to hero) */}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3.5 py-2 border border-slate-200/80 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-[#6C4CD8] tabular-nums">
                <Truck className="size-4 text-[#6C4CD8]" />
                +{formatMoney(revenue.inFlight)}
              </span>
              <span className="text-slate-500 font-medium">awaiting delivery (in fulfilment pipeline)</span>
            </div>
          </div>

          {/* Segmented Sales Control: Today / This Week / This Month */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 min-w-[300px] sm:min-w-[340px] space-y-3 shadow-xs">
            <div className="flex rounded-2xl bg-slate-200/70 p-1 text-xs font-bold">
              {(["today", "week", "month"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSalesPeriod(period)}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-center capitalize transition-all cursor-pointer",
                    salesPeriod === period
                      ? "bg-white text-slate-950 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>

            <div className="pt-1 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {activePeriodLabel}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums">
                {formatMoney(activePeriodSales)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROW 3: 7-DAY SALES PERFORMANCE (Interactive Area + Bar Hybrid) ── */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-950">7-Day Sales Performance</h2>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black text-[#6C4CD8] uppercase tracking-wider">
                Daily Trend
              </span>
            </div>
            <p className="text-xs text-slate-500">
              7-Day Total: <strong className="text-slate-950 font-bold tabular-nums">{formatMoney(total7DayRevenue)}</strong> ({total7DayOrders} orders booked)
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartMetric("revenue")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer",
                chartMetric === "revenue"
                  ? "bg-white text-[#6C4CD8] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <DollarSign className="size-3.5" /> Revenue ($)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric("orders")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer",
                chartMetric === "orders"
                  ? "bg-white text-[#6C4CD8] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <BarChart3 className="size-3.5" /> Orders Count
            </button>
          </div>
        </div>

        {/* Rich Interactive 7-Day Chart Canvas */}
        <div className="relative pt-6 pb-2">
          {/* Active Hover Popover Tooltip */}
          {hoveredDayIndex !== null && chartDays[hoveredDayIndex] && (
            <div className="absolute top-0 right-0 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-white shadow-xl z-20 flex items-center gap-3 animate-in fade-in-0 duration-150">
              <span className="font-bold text-slate-400">
                {chartDays[hoveredDayIndex].date} ({chartDays[hoveredDayIndex].dayLabel}):
              </span>
              <span className="font-black text-emerald-400 tabular-nums">
                {formatMoney(chartDays[hoveredDayIndex].revenue)}
              </span>
              <span className="text-slate-300 tabular-nums">
                • {chartDays[hoveredDayIndex].ordersCount} orders
              </span>
            </div>
          )}

          {/* Chart Gridlines & Columns */}
          <div className="relative grid grid-cols-7 gap-2 sm:gap-6 h-64 items-end border-b border-slate-200/90 pb-4 pt-8">
            {/* Background horizontal dashed guideline */}
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100 pointer-events-none" />

            {chartDays.map((day, idx) => {
              const isToday = idx === chartDays.length - 1
              const isHovered = hoveredDayIndex === idx
              const value = chartMetric === "revenue" ? day.revenue || 0 : day.ordersCount || 0
              const maxVal = chartMetric === "revenue" ? maxRevenue : maxOrders
              const heightPct = Math.max(10, Math.round((value / maxVal) * 100))

              return (
                <div
                  key={day.date || idx}
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                  className="group relative flex flex-col items-center h-full justify-end cursor-pointer select-none"
                >
                  {/* Floating Metric Label above bar */}
                  <span
                    className={cn(
                      "mb-1.5 text-[11px] font-black tabular-nums transition-all",
                      isHovered || isToday ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100",
                      isToday ? "text-[#6C4CD8]" : "text-slate-700",
                    )}
                  >
                    {chartMetric === "revenue" ? formatMoney(day.revenue) : `${day.ordersCount}`}
                  </span>

                  {/* Bar Column with Gradient Fill */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={cn(
                      "w-full max-w-[54px] rounded-2xl transition-all duration-300 group-hover:scale-y-105 group-hover:brightness-110",
                      isToday
                        ? "bg-gradient-to-t from-[#6C4CD8] via-[#7B5CE8] to-[#9D84F5] shadow-md shadow-[#6C4CD8]/30"
                        : value > 0
                        ? "bg-gradient-to-t from-slate-200 to-slate-300 group-hover:from-[#6C4CD8]/60 group-hover:to-[#6C4CD8]/90"
                        : "bg-slate-100 border border-dashed border-slate-200",
                    )}
                  />

                  {/* Day Axis Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={cn(
                        "block text-xs font-bold",
                        isToday ? "text-[#6C4CD8] font-black" : "text-slate-600",
                      )}
                    >
                      {day.dayLabel}
                    </span>
                    {isToday && (
                      <span className="inline-block rounded-full bg-[#6C4CD8] px-1.5 py-0.2 text-[9px] font-black uppercase text-white shadow-xs">
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

      {/* ── ROW 4: INVENTORY HEALTH + TOP SELLING PRODUCTS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inventory Health Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Catalog & Stock Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inventory.totalInventoryUnits.toLocaleString()} total units on sale across {inventory.totalProducts} items
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                <Link href="/seller-dashboard/products/dashboard">
                  Manage <ChevronRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Visual Distribution Ratio Bar */}
            <div className="space-y-2">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${activePct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Active: ${inventory.activeProducts} (${activePct}%)`}
                />
                <div
                  style={{ width: `${draftPct}%` }}
                  className="bg-slate-400 transition-all duration-500"
                  title={`Draft: ${inventory.draftProducts} (${draftPct}%)`}
                />
                <div
                  style={{ width: `${soldOutPct}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Sold Out: ${inventory.soldOutProducts} (${soldOutPct}%)`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" /> Active ({activePct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-slate-400" /> Draft ({draftPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500" /> Sold Out ({soldOutPct}%)
                </span>
              </div>
            </div>

            {/* Inventory Status Breakdown Pills */}
            <div className="grid grid-cols-3 gap-3.5">
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-center">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">Active</span>
                <p className="mt-1 text-3xl font-black text-emerald-950 tabular-nums">
                  {inventory.activeProducts}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">Draft</span>
                <p className="mt-1 text-3xl font-black text-slate-950 tabular-nums">
                  {inventory.draftProducts}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 text-center">
                <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wide">Sold Out</span>
                <p className="mt-1 text-3xl font-black text-rose-950 tabular-nums">
                  {inventory.soldOutProducts}
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock Warning Row */}
          <div className="pt-4 border-t border-slate-100">
            {inventory.lowStockProducts > 0 ? (
              <Link
                href="/seller-dashboard/products/dashboard"
                className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-900 hover:bg-amber-100 transition shadow-xs"
              >
                <div className="flex items-center gap-2.5 font-bold">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                  <span>{inventory.lowStockProducts} products running low on stock</span>
                </div>
                <span className="font-black text-amber-800 underline">Restock Now →</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 font-semibold border border-slate-200/60">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Stock levels healthy across all products</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Selling Products Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Top Selling Products</h2>
              <p className="text-xs text-slate-500 mt-0.5">Best performers by volume and revenue</p>
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

                const rankBadgeColors = [
                  "bg-amber-400 text-slate-950",
                  "bg-slate-300 text-slate-900",
                  "bg-amber-600 text-white",
                  "bg-slate-100 text-slate-700",
                  "bg-slate-100 text-slate-700",
                ]

                return (
                  <div key={product.listingUuid || idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 group">
                    {/* Rank Badge */}
                    <span className={cn("grid size-6 place-items-center rounded-full text-[11px] font-black shadow-xs shrink-0", rankBadgeColors[idx] || "bg-slate-100 text-slate-700")}>
                      {idx + 1}
                    </span>

                    <div className="relative size-13 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 group-hover:border-[#6C4CD8] transition">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={product.title} fill sizes="52px" className="object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-400">
                          <Package className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {product.slug ? (
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="text-xs sm:text-sm font-extrabold text-slate-950 hover:text-[#6C4CD8] transition line-clamp-1 flex items-center gap-1.5"
                        >
                          {product.title}
                          <ExternalLink className="size-3 text-slate-400 shrink-0" />
                        </Link>
                      ) : (
                        <p className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-1">{product.title}</p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black text-[#6C4CD8] border border-purple-100">
                          {product.unitsSold} sold
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-black text-sm sm:text-base text-slate-950 tabular-nums shrink-0">
                      {formatMoney(product.totalRevenue)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center p-6 text-slate-400 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              <Package className="size-9 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No bestseller data yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                As customer orders are placed and fulfilled, your top-performing products will be ranked here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
