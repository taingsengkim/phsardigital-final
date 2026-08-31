"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  PackageCheck,
  PackageOpen,
  Phone,
  RefreshCw,
  Search,
  Store,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getFileUrl } from "@/lib/utils"
import {
  useCancelPurchaseMutation,
  useConfirmPurchaseMutation,
  useCompletePurchaseMutation,
  useGetSellerOrdersQuery,
  useGetSellerOrdersSummaryQuery,
} from "@/lib/redux/service/purchaseApi"
import { useStartConversationMutation } from "@/lib/redux/service/sellerMessageApi"
import type {
  Purchase,
  PurchaseStatus,
  SellerOrdersSummary,
} from "@/lib/types/purchase"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 20

/**
 * Format local ISO date-time string (e.g. "2026-09-01T14:35:00") without timezone offset.
 * Do NOT parse as UTC to preserve local Cambodian timestamps accurately.
 */
function formatLocalDateTime(isoStr?: string | null): string {
  if (!isoStr) return "—"
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (match) {
    const [, year, month, day, hour, minute, second] = match
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      second ? Number(second) : 0,
    )
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const date = new Date(isoStr)
  if (Number.isNaN(date.getTime())) return isoStr
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function shortOrderRef(uuid: string): string {
  return `#ORD-${uuid.slice(0, 8).toUpperCase()}`
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = React.useState<PurchaseStatus | "">("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [pageNumber, setPageNumber] = React.useState(0)

  // 300ms Search Debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setPageNumber(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset pageNumber on status filter change
  const handleStatusTabChange = (status: PurchaseStatus | "") => {
    setSelectedStatus(status)
    setPageNumber(0)
  }

  // 1. KPI Summary Query (single request)
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetSellerOrdersSummaryQuery()

  // 2. Orders List Query
  const {
    data: ordersPage,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    refetch: refetchOrders,
  } = useGetSellerOrdersQuery({
    status: selectedStatus || undefined,
    search: debouncedSearch || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
  })

  // Action Mutations
  const [confirmOrder, { isLoading: isConfirming }] = useConfirmPurchaseMutation()
  const [completeOrder, { isLoading: isCompleting }] = useCompletePurchaseMutation()
  const [cancelOrder, { isLoading: isCancelling }] = useCancelPurchaseMutation()
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation()

  const [actingOrderId, setActingOrderId] = React.useState<string | null>(null)

  const orders = ordersPage?.content ?? []
  const totalElements = ordersPage?.page?.totalElements ?? orders.length
  const totalPages = (ordersPage?.page?.totalPages ?? Math.ceil(totalElements / PAGE_SIZE)) || 1

  // Refresh both summary and orders list
  const handleRefresh = () => {
    refetchSummary()
    refetchOrders()
  }

  // Action Handlers with Error Handling
  const handleConfirm = async (order: Purchase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActingOrderId(order.uuid)
    try {
      await confirmOrder(order.uuid).unwrap()
      toast.success(`Order ${shortOrderRef(order.uuid)} confirmed & in fulfilment`)
      refetchSummary()
      refetchOrders()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not confirm order"
      toast.error(msg)
    } finally {
      setActingOrderId(null)
    }
  }

  const handleComplete = async (order: Purchase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActingOrderId(order.uuid)
    try {
      await completeOrder(order.uuid).unwrap()
      toast.success(`Order ${shortOrderRef(order.uuid)} marked as delivered`)
      refetchSummary()
      refetchOrders()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not complete order"
      toast.error(msg)
    } finally {
      setActingOrderId(null)
    }
  }

  const handleCancel = async (order: Purchase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActingOrderId(order.uuid)
    try {
      await cancelOrder(order.uuid).unwrap()
      toast.info(`Order ${shortOrderRef(order.uuid)} cancelled`)
      refetchSummary()
      refetchOrders()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not cancel order"
      toast.error(msg)
    } finally {
      setActingOrderId(null)
    }
  }

  const handleChatWithBuyer = async (buyerId?: string | null, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!buyerId) return
    try {
      await startConversation({ participantId: buyerId }).unwrap()
      router.push("/seller-dashboard/message")
    } catch (err: any) {
      if (err?.status === 402) {
        toast.error("Messaging requires an active subscription. Redirecting to plan settings...")
        router.push("/seller-dashboard/shop")
      } else {
        toast.error(err?.data?.message || "Could not start chat with customer")
      }
    }
  }

  return (
    <main className="min-h-[calc(100svh-70px)] bg-slate-50/70 p-4 sm:p-7 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Customer Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Process incoming orders, coordinate fulfillment, and manage deliveries.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={ordersFetching}
            className="rounded-xl border-slate-200 bg-white shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className={cn("size-4 text-slate-600", ordersFetching && "animate-spin")} />
            <span className="font-semibold text-slate-700">Refresh</span>
          </Button>
        </div>
      </header>

      {/* ── 1. KPI CARDS (from single summary request) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card (Action Required) */}
        <div
          onClick={() => handleStatusTabChange("PENDING")}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer bg-white shadow-xs hover:shadow-md",
            selectedStatus === "PENDING"
              ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30"
              : "border-amber-200/80 hover:border-amber-300",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Action Required</span>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="size-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {summaryLoading ? <Loader2 className="size-7 animate-spin text-amber-600" /> : summary?.pending ?? 0}
            </span>
            <p className="mt-1 text-xs font-medium text-amber-800">Pending orders awaiting confirmation</p>
          </div>
        </div>

        {/* In Fulfilment Card */}
        <div
          onClick={() => handleStatusTabChange("CONFIRMED")}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer bg-white shadow-xs hover:shadow-md",
            selectedStatus === "CONFIRMED"
              ? "border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/30"
              : "border-blue-200/80 hover:border-blue-300",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">In Fulfilment</span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <Truck className="size-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {summaryLoading ? <Loader2 className="size-7 animate-spin text-blue-600" /> : summary?.confirmed ?? 0}
            </span>
            <p className="mt-1 text-xs font-medium text-blue-800">Confirmed & packing / dispatched</p>
          </div>
        </div>

        {/* Completed Card */}
        <div
          onClick={() => handleStatusTabChange("COMPLETED")}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer bg-white shadow-xs hover:shadow-md",
            selectedStatus === "COMPLETED"
              ? "border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/30"
              : "border-emerald-200/80 hover:border-emerald-300",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Completed</span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <PackageCheck className="size-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {summaryLoading ? <Loader2 className="size-7 animate-spin text-emerald-600" /> : summary?.completed ?? 0}
            </span>
            <p className="mt-1 text-xs font-medium text-emerald-800">Successfully delivered to customers</p>
          </div>
        </div>

        {/* Revenue Card (Earned Revenue + in-flight line) */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E2DFEC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C4CD8]">Earned Revenue</span>
            <span className="grid size-9 place-items-center rounded-xl bg-[#F1EFFA] text-[#6C4CD8]">
              <Store className="size-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">
              {summaryLoading ? (
                <Loader2 className="size-7 animate-spin text-[#6C4CD8]" />
              ) : (
                `$${Number(summary?.earnedRevenue ?? 0).toFixed(2)}`
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="rounded-md bg-[#F1EFFA] px-2 py-0.5 text-[11px] font-bold text-[#6C4CD8] border border-[#6C4CD8]/20">
                +${Number(summary?.inFlightRevenue ?? 0).toFixed(2)} in fulfilment
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FILTER TABS + SEARCH ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: "All Orders", value: "", count: summary?.total ?? 0 },
              { label: "Pending", value: "PENDING", count: summary?.pending ?? 0, highlight: "amber" },
              { label: "In Fulfilment", value: "CONFIRMED", count: summary?.confirmed ?? 0, highlight: "blue" },
              { label: "Completed", value: "COMPLETED", count: summary?.completed ?? 0, highlight: "emerald" },
              { label: "Cancelled", value: "CANCELLED", count: summary?.cancelled ?? 0, highlight: "rose" },
            ].map((tab) => {
              const isActive = selectedStatus === tab.value
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => handleStatusTabChange(tab.value as PurchaseStatus | "")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0",
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-extrabold",
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.highlight === "amber" && tab.count > 0
                        ? "bg-amber-100 text-amber-800 font-black"
                        : "bg-slate-200/80 text-slate-700",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #ORD, customer, phone, item..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-8 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3. ORDER ROWS & LIST ── */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {ordersLoading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="size-8 animate-spin text-[#6C4CD8]" />
              <p className="text-sm font-semibold">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <PackageOpen className="size-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No orders found</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  {debouncedSearch
                    ? `No orders matching "${debouncedSearch}". Try searching for another customer name or product.`
                    : "Orders placed by customers will appear here."}
                </p>
              </div>
              {debouncedSearch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 rounded-xl"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isPOS = order.channel === "POS"
                const hasGPS = order.deliveryLatitude !== null && order.deliveryLongitude !== null
                const totalItemsCount = (order.items ?? []).reduce((sum, i) => sum + i.quantity, 0)
                const isActing = actingOrderId === order.uuid

                return (
                  <div
                    key={order.uuid}
                    onClick={() => router.push(`/seller-dashboard/orders/${order.uuid}`)}
                    className="group relative flex flex-col gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50/80 cursor-pointer lg:flex-row lg:items-center lg:justify-between"
                  >
                    {/* Left Details: Order Ref, Date, Customer, Products Preview */}
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      {/* First Item Thumbnail */}
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {order.items?.[0]?.thumbnailUrl ? (
                          <Image
                            src={
                              order.items[0].thumbnailUrl.startsWith("http") || order.items[0].thumbnailUrl.startsWith("/")
                                ? order.items[0].thumbnailUrl
                                : getFileUrl(order.items[0].thumbnailUrl)
                            }
                            alt={order.items[0].title || "Product item"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-slate-400">
                            <Package className="size-6" />
                          </div>
                        )}
                        {totalItemsCount > 1 && (
                          <span className="absolute bottom-1 right-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-xs">
                            +{totalItemsCount - 1}
                          </span>
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-950">
                            {shortOrderRef(order.uuid)}
                          </span>

                          {/* Channel Badge */}
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase",
                              isPOS
                                ? "bg-slate-200 text-slate-700"
                                : "bg-[#F1EFFA] text-[#6C4CD8]",
                            )}
                          >
                            {order.channel || "ONLINE"}
                          </span>

                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-medium text-slate-500">
                            {formatLocalDateTime(order.createdAt)}
                          </span>
                        </div>

                        {/* Customer line */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="font-bold text-slate-900">
                            {order.buyerName?.trim() || (isPOS ? "Counter Customer" : "Customer")}
                          </span>

                          {order.buyerPhone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <a
                                href={`tel:${order.buyerPhone.replace(/[^\d+]/g, "")}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#6C4CD8] font-semibold"
                                title="Call customer"
                              >
                                <Phone className="size-3 text-slate-400" />
                                {order.buyerPhone}
                              </a>
                            </>
                          )}

                          {/* Direct Chat Button (HIDDEN on POS counter sales) */}
                          {!isPOS && order.buyerId && (
                            <button
                              type="button"
                              onClick={(e) => handleChatWithBuyer(order.buyerId, e)}
                              disabled={isStartingChat}
                              className="ml-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-[#6C4CD8] hover:bg-[#F1EFFA] transition cursor-pointer"
                              title="Message buyer directly"
                            >
                              <MessageSquare className="size-3" />
                              Chat
                            </button>
                          )}
                        </div>

                        {/* Shipping address & GPS badge */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate max-w-md">
                            {order.shippingAddress || "In-store pickup / POS checkout"}
                          </span>
                          {hasGPS && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <Navigation className="size-2.5" /> GPS Pin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Details: Price, Status, 1-Click Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-col lg:items-end lg:justify-center">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base sm:text-lg font-black text-slate-950">
                          ${Number(order.totalPrice ?? 0).toFixed(2)}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                            order.status === "PENDING" && "bg-amber-100 text-amber-800 border border-amber-200",
                            order.status === "CONFIRMED" && "bg-blue-100 text-blue-800 border border-blue-200",
                            order.status === "COMPLETED" && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                            order.status === "CANCELLED" && "bg-rose-100 text-rose-800 border border-rose-200",
                          )}
                        >
                          {order.status === "PENDING" && <Clock className="size-3" />}
                          {order.status === "CONFIRMED" && <Truck className="size-3" />}
                          {order.status === "COMPLETED" && <CheckCircle2 className="size-3" />}
                          {order.status === "CANCELLED" && <XCircle className="size-3" />}
                          {order.status === "CONFIRMED" ? "In Fulfilment" : order.status}
                        </span>
                      </div>

                      {/* ── 4. ONE-CLICK ACTIONS ── */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              disabled={isActing || isConfirming}
                              onClick={(e) => handleConfirm(order, e)}
                              className="rounded-xl bg-[#6C4CD8] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#5B3DC0] cursor-pointer"
                            >
                              {isActing && isConfirming ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Check className="size-3.5" />
                              )}
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActing || isCancelling}
                              onClick={(e) => handleCancel(order, e)}
                              className="rounded-xl border-rose-200 bg-rose-50/60 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {order.status === "CONFIRMED" && (
                          <>
                            <Button
                              size="sm"
                              disabled={isActing || isCompleting}
                              onClick={(e) => handleComplete(order, e)}
                              className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                            >
                              {isActing && isCompleting ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <PackageCheck className="size-3.5" />
                              )}
                              Mark Delivered
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isActing || isCancelling}
                              onClick={(e) => handleCancel(order, e)}
                              className="rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/seller-dashboard/orders/${order.uuid}`)}
                          className="rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60"
                        >
                          <Eye className="size-3.5 text-slate-500" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              Showing {pageNumber * PAGE_SIZE + 1}–{Math.min((pageNumber + 1) * PAGE_SIZE, totalElements)} of {totalElements} orders
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber === 0 || ordersFetching}
                onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                className="h-8 rounded-lg px-2.5 text-xs"
              >
                <ChevronLeft className="size-3.5" /> Previous
              </Button>
              <span className="px-2 font-bold text-slate-700">
                {pageNumber + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageNumber >= totalPages - 1 || ordersFetching}
                onClick={() => setPageNumber((p) => p + 1)}
                className="h-8 rounded-lg px-2.5 text-xs"
              >
                Next <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
