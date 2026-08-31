"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  PackageCheck,
  PackageOpen,
  Phone,
  Printer,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  const [selectedOrder, setSelectedOrder] = React.useState<Purchase | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = React.useState<{ url: string; caption?: string } | null>(null)

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

  // Keep selectedOrder in sync if updated in cache
  React.useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.uuid === selectedOrder.uuid)
      if (updated) setSelectedOrder(updated)
    }
  }, [orders, selectedOrder])

  // Action Handlers with Error Handling
  const handleConfirm = async (order: Purchase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActingOrderId(order.uuid)
    try {
      const updated = await confirmOrder(order.uuid).unwrap()
      toast.success(`Order ${shortOrderRef(order.uuid)} confirmed & in fulfilment`)
      refetchSummary()
      if (selectedOrder?.uuid === order.uuid) setSelectedOrder(updated)
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
      const updated = await completeOrder(order.uuid).unwrap()
      toast.success(`Order ${shortOrderRef(order.uuid)} marked as delivered`)
      refetchSummary()
      if (selectedOrder?.uuid === order.uuid) setSelectedOrder(updated)
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
      const updated = await cancelOrder(order.uuid).unwrap()
      toast.info(`Order ${shortOrderRef(order.uuid)} cancelled`)
      refetchSummary()
      if (selectedOrder?.uuid === order.uuid) setSelectedOrder(updated)
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

  const handlePrintPackingSlip = () => {
    if (typeof window !== "undefined") {
      window.print()
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
                    onClick={() => setSelectedOrder(order)}
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
                          onClick={() => setSelectedOrder(order)}
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

      {/* ── 5. DETAILS DRAWER (Slide-over) ── */}
      <Sheet open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto p-0 bg-white"
        >
          {selectedOrder && (
            <div className="flex min-h-full flex-col">
              {/* Drawer Header */}
              <SheetHeader className="border-b border-slate-100 p-5 sm:p-6 bg-slate-50/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-xl font-black text-slate-900">
                      {shortOrderRef(selectedOrder.uuid)}
                    </SheetTitle>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase",
                        selectedOrder.channel === "POS"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-[#F1EFFA] text-[#6C4CD8]",
                      )}
                    >
                      {selectedOrder.channel || "ONLINE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrintPackingSlip}
                      className="rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                      title="Print packing slip"
                    >
                      <Printer className="size-3.5 mr-1" />
                      Print Slip
                    </Button>
                  </div>
                </div>
                <SheetDescription className="mt-1 text-xs text-slate-500">
                  Full purchase order details, customer shipping destination, and line items.
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Body */}
              <div className="flex-1 p-5 sm:p-6 space-y-6">
                {/* ── Timeline: STRICT 3 STEPS (Placed -> In Fulfilment -> Delivered) + Cancelled ── */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Fulfillment Timeline
                  </h4>

                  {selectedOrder.status === "CANCELLED" ? (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-rose-800">
                      <XCircle className="size-5 shrink-0 text-rose-600" />
                      <div className="text-xs">
                        <strong className="font-bold">Order Cancelled</strong>
                        <p className="text-rose-700/80 mt-0.5">
                          {formatLocalDateTime(selectedOrder.cancelledAt || selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-between">
                      {/* Step 1: Placed */}
                      <div className="flex flex-col items-center text-center z-10">
                        <span className="grid size-8 place-items-center rounded-full bg-[#6C4CD8] text-white shadow-xs text-xs font-bold">
                          <Check className="size-4" />
                        </span>
                        <span className="mt-2 text-xs font-bold text-slate-900">Placed</span>
                        <span className="text-[11px] text-slate-500">
                          {formatLocalDateTime(selectedOrder.createdAt)}
                        </span>
                      </div>

                      {/* Connecting Line 1-2 */}
                      <div
                        className={cn(
                          "absolute top-4 left-[20%] right-[50%] h-0.5 -translate-y-1/2",
                          selectedOrder.confirmedAt || selectedOrder.status === "CONFIRMED" || selectedOrder.status === "COMPLETED"
                            ? "bg-[#6C4CD8]"
                            : "bg-slate-200",
                        )}
                      />

                      {/* Step 2: In Fulfilment */}
                      <div className="flex flex-col items-center text-center z-10">
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-full text-xs font-bold shadow-xs",
                            selectedOrder.confirmedAt || selectedOrder.status === "CONFIRMED" || selectedOrder.status === "COMPLETED"
                              ? "bg-[#6C4CD8] text-white"
                              : "bg-slate-200 text-slate-500",
                          )}
                        >
                          <Truck className="size-4" />
                        </span>
                        <span className="mt-2 text-xs font-bold text-slate-900">In Fulfilment</span>
                        <span className="text-[11px] text-slate-500">
                          {selectedOrder.confirmedAt ? formatLocalDateTime(selectedOrder.confirmedAt) : "Pending"}
                        </span>
                      </div>

                      {/* Connecting Line 2-3 */}
                      <div
                        className={cn(
                          "absolute top-4 left-[50%] right-[20%] h-0.5 -translate-y-1/2",
                          selectedOrder.completedAt || selectedOrder.status === "COMPLETED"
                            ? "bg-emerald-600"
                            : "bg-slate-200",
                        )}
                      />

                      {/* Step 3: Delivered */}
                      <div className="flex flex-col items-center text-center z-10">
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-full text-xs font-bold shadow-xs",
                            selectedOrder.completedAt || selectedOrder.status === "COMPLETED"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500",
                          )}
                        >
                          <PackageCheck className="size-4" />
                        </span>
                        <span className="mt-2 text-xs font-bold text-slate-900">Delivered</span>
                        <span className="text-[11px] text-slate-500">
                          {selectedOrder.completedAt ? formatLocalDateTime(selectedOrder.completedAt) : "Awaiting"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Customer & Shipping Section ── */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer & Delivery Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400">Recipient Name</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedOrder.buyerName || (selectedOrder.channel === "POS" ? "Counter Customer" : "Customer")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400">Contact Number</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedOrder.buyerPhone ? (
                          <a
                            href={`tel:${selectedOrder.buyerPhone.replace(/[^\d+]/g, "")}`}
                            className="inline-flex items-center gap-1 text-[#6C4CD8] hover:underline"
                          >
                            <Phone className="size-3.5" />
                            {selectedOrder.buyerPhone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-400">Shipping Address</span>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      {selectedOrder.shippingAddress || "In-store checkout (POS)"}
                    </p>
                  </div>

                  {selectedOrder.note && (
                    <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-amber-900">
                      <strong className="font-bold">Customer Delivery Note:</strong>
                      <p className="mt-0.5 italic">&ldquo;{selectedOrder.note}&rdquo;</p>
                    </div>
                  )}

                  {/* Landmark Delivery Photos Strip */}
                  {selectedOrder.deliveryPhotos && selectedOrder.deliveryPhotos.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700">Landmark Reference Photos</span>
                      <p className="text-[11px] text-slate-500 mb-2">Buyer saved photos to assist courier arrival.</p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {selectedOrder.deliveryPhotos
                          .filter((photo): photo is { url: string; caption?: string } => Boolean(photo && photo.url))
                          .map((photo, idx) => {
                            const src = photo.url.startsWith("http") || photo.url.startsWith("/") ? photo.url : getFileUrl(photo.url)
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setLightboxPhoto(photo)}
                                className="group relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 hover:border-[#6C4CD8]"
                              >
                                <Image src={src} alt={photo.caption || "Landmark photo"} fill className="object-cover" />
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* GPS Mini-Map (Only when BOTH coordinates are non-null) */}
                  {selectedOrder.deliveryLatitude !== null && selectedOrder.deliveryLongitude !== null && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Navigation className="size-3.5 text-emerald-600" />
                          Precise GPS Delivery Coordinates
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${selectedOrder.deliveryLatitude},${selectedOrder.deliveryLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6C4CD8] hover:underline"
                        >
                          Open in Google Maps <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <iframe
                          title="Delivery location"
                          src={`https://maps.google.com/maps?q=${selectedOrder.deliveryLatitude},${selectedOrder.deliveryLongitude}&z=16&output=embed`}
                          className="h-full w-full border-0"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Itemized Order Invoice ── */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Purchased Items ({selectedOrder.items?.length ?? 0})
                  </h4>

                  <div className="divide-y divide-slate-100">
                    {(selectedOrder.items ?? []).map((item, idx) => {
                      const hasDiscount = Boolean(item.fullPrice && item.fullPrice > item.unitPrice)
                      const itemImg = item.thumbnailUrl
                        ? item.thumbnailUrl.startsWith("http") || item.thumbnailUrl.startsWith("/")
                          ? item.thumbnailUrl
                          : getFileUrl(item.thumbnailUrl)
                        : null

                      return (
                        <div key={idx} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {itemImg ? (
                              <Image src={itemImg} alt={item.title || "Product item"} fill sizes="56px" className="object-cover" />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-slate-400">
                                <Package className="size-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            {item.slug ? (
                              <Link
                                href={`/products/${item.slug}`}
                                target="_blank"
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#6C4CD8] transition line-clamp-1"
                              >
                                {item.title || "Product item"}
                              </Link>
                            ) : (
                              <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.title || "Product item"}</p>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              <span>Qty: <strong className="text-slate-900 font-bold">{item.quantity}</strong></span>
                              <span>•</span>
                              <span>${Number(item.unitPrice).toFixed(2)}</span>
                              {hasDiscount && (
                                <span className="line-through text-slate-400">
                                  ${Number(item.fullPrice).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right font-black text-sm text-slate-900">
                            ${Number(item.lineTotal || item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Financial Summary */}
                  <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Items Value</span>
                      <span className="font-semibold text-slate-900">
                        ${Number(selectedOrder.totalPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                      <span>Grand Total</span>
                      <span className="text-base text-[#6C4CD8] font-black">
                        ${Number(selectedOrder.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Action Footer */}
              <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:p-5 flex items-center justify-between gap-3 shadow-lg">
                <div className="text-xs text-slate-500">
                  Status: <strong className="text-slate-900 font-bold">{selectedOrder.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrder.status === "PENDING" && (
                    <>
                      <Button
                        disabled={actingOrderId === selectedOrder.uuid || isConfirming}
                        onClick={(e) => handleConfirm(selectedOrder, e)}
                        className="rounded-xl bg-[#6C4CD8] px-4 font-bold text-white shadow-xs hover:bg-[#5B3DC0] cursor-pointer"
                      >
                        {actingOrderId === selectedOrder.uuid && isConfirming ? (
                          <Loader2 className="size-4 animate-spin mr-1" />
                        ) : (
                          <Check className="size-4 mr-1" />
                        )}
                        Confirm Order
                      </Button>
                      <Button
                        variant="outline"
                        disabled={actingOrderId === selectedOrder.uuid || isCancelling}
                        onClick={(e) => handleCancel(selectedOrder, e)}
                        className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold cursor-pointer"
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {selectedOrder.status === "CONFIRMED" && (
                    <>
                      <Button
                        disabled={actingOrderId === selectedOrder.uuid || isCompleting}
                        onClick={(e) => handleComplete(selectedOrder, e)}
                        className="rounded-xl bg-emerald-600 px-4 font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        {actingOrderId === selectedOrder.uuid && isCompleting ? (
                          <Loader2 className="size-4 animate-spin mr-1" />
                        ) : (
                          <PackageCheck className="size-4 mr-1" />
                        )}
                        Mark Delivered
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={actingOrderId === selectedOrder.uuid || isCancelling}
                        onClick={(e) => handleCancel(selectedOrder, e)}
                        className="rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Photo Lightbox Modal ── */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2">
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="size-4" />
            </button>
            <div className="relative h-96 w-full sm:w-[500px]">
              <Image
                src={
                  lightboxPhoto.url.startsWith("http") || lightboxPhoto.url.startsWith("/")
                    ? lightboxPhoto.url
                    : getFileUrl(lightboxPhoto.url)
                }
                alt={lightboxPhoto.caption || "Landmark photo"}
                fill
                className="object-contain"
              />
            </div>
            {lightboxPhoto.caption && (
              <p className="p-3 text-center text-xs font-semibold text-slate-700">{lightboxPhoto.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* ── PRINT-ONLY PACKING SLIP STYLESHEET ── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-packing-slip,
          #print-packing-slip * {
            visibility: visible;
          }
          #print-packing-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            padding: 24px;
            background: #fff;
            color: #000;
          }
        }
        @media screen {
          #print-packing-slip {
            display: none;
          }
        }
      `}</style>

      {/* Hidden printable packing slip DOM */}
      {selectedOrder && (
        <div id="print-packing-slip">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black">PHSARDIGITAL PACKING SLIP</h1>
            <p className="text-sm">Order Reference: {shortOrderRef(selectedOrder.uuid)}</p>
            <p className="text-xs text-gray-600">Date: {formatLocalDateTime(selectedOrder.createdAt)}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <strong className="block font-bold">Seller Store:</strong>
              <p>{selectedOrder.businessName || "PhsarDigital Store"}</p>
              <p className="text-xs text-gray-500">ID: {selectedOrder.sellerId}</p>
            </div>
            <div>
              <strong className="block font-bold">Ship To / Recipient:</strong>
              <p>{selectedOrder.buyerName || (selectedOrder.channel === "POS" ? "Counter Customer" : "Customer")}</p>
              <p>{selectedOrder.buyerPhone}</p>
              <p className="mt-1">{selectedOrder.shippingAddress}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-6 text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(selectedOrder.items ?? []).map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="py-2 text-right">
                    ${Number(item.lineTotal || item.unitPrice * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right text-base font-black">
            Total Order Amount: ${Number(selectedOrder.totalPrice).toFixed(2)}
          </div>
          {selectedOrder.note && (
            <div className="mt-4 p-2 border border-gray-400 text-xs">
              <strong>Delivery Note:</strong> {selectedOrder.note}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
