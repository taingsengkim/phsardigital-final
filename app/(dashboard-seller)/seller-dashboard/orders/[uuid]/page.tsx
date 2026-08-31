"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
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
  ShoppingBag,
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
  useGetPurchaseQuery,
  useGetSellerOrdersQuery,
  useGetSellerOrdersSummaryQuery,
} from "@/lib/redux/service/purchaseApi"
import { useStartConversationMutation } from "@/lib/redux/service/sellerMessageApi"
import { Button } from "@/components/ui/button"

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

export default function SellerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderUuid = typeof params.uuid === "string" ? params.uuid : ""

  const {
    data: purchaseData,
    isLoading: purchaseLoading,
    isError: purchaseError,
    refetch: refetchPurchase,
    isFetching: purchaseFetching,
  } = useGetPurchaseQuery(orderUuid, { skip: !orderUuid })

  const {
    data: sellerOrdersData,
    isLoading: sellerOrdersLoading,
    isError: sellerOrdersError,
    refetch: refetchSellerOrders,
    isFetching: sellerOrdersFetching,
  } = useGetSellerOrdersQuery(
    { search: orderUuid, pageSize: 5 },
    { skip: !orderUuid },
  )

  const order =
    purchaseData ||
    sellerOrdersData?.content?.find(
      (p) =>
        p.uuid === orderUuid ||
        p.uuid?.toLowerCase() === orderUuid.toLowerCase(),
    )

  const isLoading = (purchaseLoading || sellerOrdersLoading) && !order
  const isError = Boolean(purchaseError && sellerOrdersError && !order)
  const isFetching = purchaseFetching || sellerOrdersFetching

  const refetch = () => {
    refetchPurchase()
    refetchSellerOrders()
  }

  const { refetch: refetchSummary } = useGetSellerOrdersSummaryQuery()

  const [confirmOrder, { isLoading: isConfirming }] = useConfirmPurchaseMutation()
  const [completeOrder, { isLoading: isCompleting }] = useCompletePurchaseMutation()
  const [cancelOrder, { isLoading: isCancelling }] = useCancelPurchaseMutation()
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation()

  const [lightboxPhoto, setLightboxPhoto] = React.useState<{ url: string; caption?: string } | null>(null)
  const [copiedRef, setCopiedRef] = React.useState(false)
  const [copiedAddress, setCopiedAddress] = React.useState(false)

  const isPOS = order?.channel === "POS"
  const hasGPS = order?.deliveryLatitude !== null && order?.deliveryLongitude !== null

  const handleCopy = async (text: string, type: "ref" | "address") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "ref") {
        setCopiedRef(true)
        setTimeout(() => setCopiedRef(false), 2000)
      } else {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      }
      toast.success("Copied to clipboard")
    } catch {
      // ignore clipboard failure
    }
  }

  const handleConfirm = async () => {
    if (!order) return
    try {
      await confirmOrder(order.uuid).unwrap()
      toast.success(`Order ${shortOrderRef(order.uuid)} confirmed & in fulfilment`)
      refetchSummary()
      refetch()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not confirm order"
      toast.error(msg)
    }
  }

  const handleComplete = async () => {
    if (!order) return
    try {
      await completeOrder(order.uuid).unwrap()
      toast.success(`Order ${shortOrderRef(order.uuid)} marked as delivered`)
      refetchSummary()
      refetch()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not complete order"
      toast.error(msg)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    try {
      await cancelOrder(order.uuid).unwrap()
      toast.info(`Order ${shortOrderRef(order.uuid)} cancelled`)
      refetchSummary()
      refetch()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not cancel order"
      toast.error(msg)
    }
  }

  const handleChatWithBuyer = async () => {
    if (!order?.buyerId) return
    try {
      await startConversation({ participantId: order.buyerId }).unwrap()
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

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100svh-70px)] items-center justify-center bg-slate-50/70 p-6">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="size-9 animate-spin text-[#6C4CD8]" />
          <p className="text-sm font-semibold">Loading order details...</p>
        </div>
      </main>
    )
  }

  if (isError || !order) {
    return (
      <main className="flex min-h-[calc(100svh-70px)] flex-col items-center justify-center bg-slate-50/70 p-6 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
        <p className="mt-1 text-sm text-slate-500 max-w-md">
          The requested purchase order could not be retrieved. It may have been removed or does not belong to this shop.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/seller-dashboard/orders")} className="rounded-xl">
            <ArrowLeft className="size-4 mr-1.5" /> Back to Orders
          </Button>
          <Button onClick={() => refetch()} className="rounded-xl bg-[#6C4CD8] hover:bg-[#5B3DC0]">
            <RefreshCw className="size-4 mr-1.5" /> Try Again
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100svh-70px)] bg-slate-50/70 p-4 sm:p-7 space-y-6">
      {/* ── Breadcrumbs & Back Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/seller-dashboard/orders"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <ArrowLeft className="size-4 text-slate-500" />
          <span>Back to all orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Printer className="size-4 text-slate-600 mr-1.5" />
            Print Packing Slip
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className={cn("size-4 text-slate-600", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* ── Header Card ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {shortOrderRef(order.uuid)}
              </h1>
              <button
                type="button"
                onClick={() => handleCopy(order.uuid, "ref")}
                className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                title="Copy full UUID"
              >
                {copiedRef ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>

              {/* Channel Badge */}
              <span
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide",
                  isPOS ? "bg-slate-200 text-slate-800" : "bg-[#F1EFFA] text-[#6C4CD8]",
                )}
              >
                {order.channel || "ONLINE"}
              </span>

              {/* Status Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  order.status === "PENDING" && "bg-amber-100 text-amber-800 border border-amber-200",
                  order.status === "CONFIRMED" && "bg-blue-100 text-blue-800 border border-blue-200",
                  order.status === "COMPLETED" && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                  order.status === "CANCELLED" && "bg-rose-100 text-rose-800 border border-rose-200",
                )}
              >
                {order.status === "PENDING" && <Clock className="size-3.5" />}
                {order.status === "CONFIRMED" && <Truck className="size-3.5" />}
                {order.status === "COMPLETED" && <CheckCircle2 className="size-3.5" />}
                {order.status === "CANCELLED" && <XCircle className="size-3.5" />}
                {order.status === "CONFIRMED" ? "In Fulfilment" : order.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
              <Calendar className="size-4 text-slate-400 shrink-0" />
              Placed on {formatLocalDateTime(order.createdAt)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 lg:border-t-0 lg:pt-0">
            {order.status === "PENDING" && (
              <>
                <Button
                  disabled={isConfirming}
                  onClick={handleConfirm}
                  className="rounded-xl bg-[#6C4CD8] px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#5B3DC0] cursor-pointer"
                >
                  {isConfirming ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Check className="size-4 mr-1.5" />}
                  Confirm Order
                </Button>
                <Button
                  variant="outline"
                  disabled={isCancelling}
                  onClick={handleCancel}
                  className="rounded-xl border-rose-200 bg-rose-50/70 px-4 text-sm font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                >
                  Decline Order
                </Button>
              </>
            )}

            {order.status === "CONFIRMED" && (
              <>
                <Button
                  disabled={isCompleting}
                  onClick={handleComplete}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  {isCompleting ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <PackageCheck className="size-4 mr-1.5" />}
                  Mark as Delivered
                </Button>
                <Button
                  variant="ghost"
                  disabled={isCancelling}
                  onClick={handleCancel}
                  className="rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                >
                  Cancel Order
                </Button>
              </>
            )}

            {!isPOS && order.buyerId && (
              <Button
                variant="outline"
                disabled={isStartingChat}
                onClick={handleChatWithBuyer}
                className="rounded-xl border-slate-200 bg-white text-sm font-bold text-[#6C4CD8] hover:bg-[#F1EFFA] cursor-pointer"
              >
                {isStartingChat ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <MessageSquare className="size-4 mr-1.5" />}
                Chat with Buyer
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Layout: 2 Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT 2 COLUMNS: Timeline + Items Invoice ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Strict 3-Step Timeline Card (Placed -> In Fulfilment -> Delivered) + Cancelled ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Fulfillment Status Timeline
            </h2>

            {order.status === "CANCELLED" ? (
              <div className="flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 text-rose-900">
                <div className="grid size-12 place-items-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
                  <XCircle className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-rose-900">Order Cancelled</h3>
                  <p className="mt-0.5 text-xs text-rose-700/80">
                    Cancelled on {formatLocalDateTime(order.cancelledAt || order.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative py-3">
                <div className="flex items-center justify-between">
                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center text-center z-10 max-w-[120px]">
                    <span className="grid size-10 place-items-center rounded-full bg-[#6C4CD8] text-white shadow-md text-sm font-bold">
                      <Check className="size-5" />
                    </span>
                    <span className="mt-3 text-xs sm:text-sm font-extrabold text-slate-950">Order Placed</span>
                    <span className="mt-0.5 text-[11px] text-slate-500">
                      {formatLocalDateTime(order.createdAt)}
                    </span>
                  </div>

                  {/* Connecting Line 1-2 */}
                  <div
                    className={cn(
                      "absolute top-8 left-[22%] right-[50%] h-1 -translate-y-1/2 rounded-full",
                      order.confirmedAt || order.status === "CONFIRMED" || order.status === "COMPLETED"
                        ? "bg-[#6C4CD8]"
                        : "bg-slate-200",
                    )}
                  />

                  {/* Step 2: In Fulfilment */}
                  <div className="flex flex-col items-center text-center z-10 max-w-[120px]">
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full text-sm font-bold shadow-md transition-colors",
                        order.confirmedAt || order.status === "CONFIRMED" || order.status === "COMPLETED"
                          ? "bg-[#6C4CD8] text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-300",
                      )}
                    >
                      <Truck className="size-5" />
                    </span>
                    <span className="mt-3 text-xs sm:text-sm font-extrabold text-slate-950">In Fulfilment</span>
                    <span className="mt-0.5 text-[11px] text-slate-500">
                      {order.confirmedAt ? formatLocalDateTime(order.confirmedAt) : "Pending seller confirmation"}
                    </span>
                  </div>

                  {/* Connecting Line 2-3 */}
                  <div
                    className={cn(
                      "absolute top-8 left-[50%] right-[22%] h-1 -translate-y-1/2 rounded-full",
                      order.completedAt || order.status === "COMPLETED"
                        ? "bg-emerald-600"
                        : "bg-slate-200",
                    )}
                  />

                  {/* Step 3: Delivered */}
                  <div className="flex flex-col items-center text-center z-10 max-w-[120px]">
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full text-sm font-bold shadow-md transition-colors",
                        order.completedAt || order.status === "COMPLETED"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-300",
                      )}
                    >
                      <PackageCheck className="size-5" />
                    </span>
                    <span className="mt-3 text-xs sm:text-sm font-extrabold text-slate-950">Delivered</span>
                    <span className="mt-0.5 text-[11px] text-slate-500">
                      {order.completedAt ? formatLocalDateTime(order.completedAt) : "Awaiting courier delivery"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Itemized Purchased Items Card ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-950">
                Purchased Items ({order.items?.length ?? 0})
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {(order.items ?? []).reduce((sum, i) => sum + i.quantity, 0)} Units Total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {(order.items ?? []).map((item, idx) => {
                const hasDiscount = Boolean(item.fullPrice && item.fullPrice > item.unitPrice)
                const itemImg = item.thumbnailUrl
                  ? item.thumbnailUrl.startsWith("http") || item.thumbnailUrl.startsWith("/")
                    ? item.thumbnailUrl
                    : getFileUrl(item.thumbnailUrl)
                  : null

                return (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {itemImg ? (
                        <Image src={itemImg} alt={item.title || "Product item"} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-400">
                          <Package className="size-7" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {item.slug ? (
                        <Link
                          href={`/products/${item.slug}`}
                          target="_blank"
                          className="text-sm sm:text-base font-extrabold text-slate-950 hover:text-[#6C4CD8] transition line-clamp-1"
                        >
                          {item.title || "Product item"}
                        </Link>
                      ) : (
                        <p className="text-sm sm:text-base font-extrabold text-slate-950 line-clamp-1">
                          {item.title || "Product item"}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                          Qty: {item.quantity}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">${Number(item.unitPrice).toFixed(2)} / unit</span>
                        {hasDiscount && (
                          <span className="line-through text-slate-400">
                            ${Number(item.fullPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-black text-base sm:text-lg text-slate-950 shrink-0">
                      ${Number(item.lineTotal || item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">${Number(order.totalPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-xl text-[#6C4CD8] font-black">${Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Note */}
            {order.note && (
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs sm:text-sm text-amber-900">
                <strong className="font-bold block mb-1">Customer Delivery Instructions:</strong>
                <p className="italic">&ldquo;{order.note}&rdquo;</p>
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN: Customer, Shipping, Map & Photos ── */}
        <div className="space-y-6">
          {/* Customer Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Information
            </h2>

            <div className="flex items-center gap-3.5">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#F1EFFA] text-[#6C4CD8] font-black text-lg">
                {(order.buyerName?.trim() || "C").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-950 text-base truncate">
                  {order.buyerName?.trim() || (isPOS ? "Counter Customer" : "Customer")}
                </p>
                <p className="text-xs text-slate-500">
                  {isPOS ? "Direct In-Store POS Sale" : `Account ID: ${order.buyerId?.slice(0, 8) ?? "Guest"}`}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Phone Contact</span>
                {order.buyerPhone ? (
                  <a
                    href={`tel:${order.buyerPhone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 font-bold text-[#6C4CD8] hover:underline"
                  >
                    <Phone className="size-3.5" />
                    {order.buyerPhone}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>

              {!isPOS && order.buyerId && (
                <Button
                  onClick={handleChatWithBuyer}
                  disabled={isStartingChat}
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 text-xs font-bold text-[#6C4CD8] hover:bg-[#F1EFFA]"
                >
                  <MessageSquare className="size-4 mr-1.5" />
                  Message Customer in App
                </Button>
              )}
            </div>
          </section>

          {/* Shipping & GPS Destination Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Delivery Destination
              </h2>
              {hasGPS && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <Navigation className="size-3" /> GPS Attached
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs sm:text-sm text-slate-800">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-[#6C4CD8] shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  {order.shippingAddress || "In-store counter collection"}
                </p>
              </div>
              {order.shippingAddress && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.shippingAddress!, "address")}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#6C4CD8] hover:underline pl-6 cursor-pointer"
                >
                  {copiedAddress ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  {copiedAddress ? "Copied address" : "Copy address"}
                </button>
              )}
            </div>

            {/* GPS Mini-Map (ONLY if both coordinates are non-null) */}
            {hasGPS && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Map Pinpoint Location</span>
                  <a
                    href={`https://maps.google.com/?q=${order.deliveryLatitude},${order.deliveryLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#6C4CD8] hover:underline"
                  >
                    Open in Maps <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <iframe
                    title="Delivery Pin"
                    src={`https://maps.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}&z=16&output=embed`}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Landmark Reference Photos Card */}
          {order.deliveryPhotos && order.deliveryPhotos.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Landmark Reference Photos ({order.deliveryPhotos.length})
              </h2>
              <p className="text-xs text-slate-500">
                Customer uploaded landmark photos to help delivery drivers locate the address.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {order.deliveryPhotos
                  .filter((photo): photo is { url: string; caption?: string } => Boolean(photo && photo.url))
                  .map((photo, idx) => {
                    const src = photo.url.startsWith("http") || photo.url.startsWith("/") ? photo.url : getFileUrl(photo.url)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxPhoto(photo)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 hover:border-[#6C4CD8] transition shadow-2xs"
                      >
                        <Image src={src} alt={photo.caption || "Landmark photo"} fill className="object-cover" />
                      </button>
                    )
                  })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Photo Lightbox Modal ── */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
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
      {order && (
        <div id="print-packing-slip">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black">PHSARDIGITAL PACKING SLIP</h1>
            <p className="text-sm">Order Reference: {shortOrderRef(order.uuid)}</p>
            <p className="text-xs text-gray-600">Date: {formatLocalDateTime(order.createdAt)}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <strong className="block font-bold">Seller Store:</strong>
              <p>{order.businessName || "PhsarDigital Store"}</p>
              <p className="text-xs text-gray-500">ID: {order.sellerId}</p>
            </div>
            <div>
              <strong className="block font-bold">Ship To / Recipient:</strong>
              <p>{order.buyerName || (order.channel === "POS" ? "Counter Customer" : "Customer")}</p>
              <p>{order.buyerPhone}</p>
              <p className="mt-1">{order.shippingAddress}</p>
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
              {(order.items ?? []).map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="py-2">{item.title || "Product item"}</td>
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
            Total Order Amount: ${Number(order.totalPrice).toFixed(2)}
          </div>
          {order.note && (
            <div className="mt-4 p-2 border border-gray-400 text-xs">
              <strong>Delivery Note:</strong> {order.note}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
