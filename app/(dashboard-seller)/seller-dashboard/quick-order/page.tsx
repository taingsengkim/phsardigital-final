"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  ExternalLink,
  History,
  Loader2,
  Minus,
  Package,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  ShoppingCart,
  Store,
  Tag,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getFileUrl } from "@/lib/utils"
import { useGetMyListingsQuery, useGetSellerProfileQuery } from "@/lib/api/sellerApi"
import { useCreatePosSaleMutation } from "@/lib/redux/service/purchaseApi"
import type { PosSaleRequest, PosSaleResponse } from "@/lib/types/pos"
import { Button } from "@/components/ui/button"

type PosProduct = {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  image: string
  stockQty: number
  sku?: string
}

function formatMoney(amount: number): string {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function QuickOrderPage() {
  const { data: listingsData, isLoading, isError, refetch, isFetching } = useGetMyListingsQuery({
    pageNumber: 0,
    pageSize: 100,
  })
  const { data: sellerProfile } = useGetSellerProfileQuery()
  const [createPosSale, { isLoading: isSubmitting }] = useCreatePosSaleMutation()

  // Catalog Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All")

  // Cart Quantities: listingUuid -> quantity
  const [quantities, setQuantities] = React.useState<Record<string, number>>({})

  // Customer Details
  const [isNamedCustomer, setIsNamedCustomer] = React.useState(false)
  const [customerName, setCustomerName] = React.useState("")
  const [customerPhone, setCustomerPhone] = React.useState("")
  const [orderNote, setOrderNote] = React.useState("")

  // Payment Options
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "KHQR" | "CARD">("CASH")
  const [amountTenderedInput, setAmountTenderedInput] = React.useState<string>("")

  // Completed Sale Receipt Modal
  const [completedSale, setCompletedSale] = React.useState<PosSaleResponse | null>(null)

  // Map backend listings to POS products
  const products = React.useMemo<PosProduct[]>(() => {
    const rawList = Array.isArray(listingsData)
      ? listingsData
      : (listingsData as any)?.content || (listingsData as any)?.data || []

    return rawList
      .filter((item: any) => (item.status ?? "ACTIVE").toUpperCase() === "ACTIVE")
      .map((item: any, index: number) => {
        const primary =
          item.images?.find((img: any) => img.isPrimary || img.is_primary) ?? item.images?.[0]
        const imgUri =
          typeof item.thumbnailUri === "string"
            ? item.thumbnailUri
            : item.thumbnailUri?.uri ?? primary?.uri ?? primary?.url

        const fullPrice = Number(item.fullPrice ?? item.price ?? 0)
        const discountPrice =
          item.discountPrice !== null && item.discountPrice !== undefined
            ? Number(item.discountPrice)
            : null
        const activePrice = discountPrice !== null && discountPrice > 0 ? discountPrice : fullPrice

        return {
          id: item.uuid || item.id || String(index),
          name: item.title || "Untitled product",
          price: activePrice,
          originalPrice: discountPrice ? fullPrice : undefined,
          category: item.category?.name || "General",
          image: imgUri ? getFileUrl(imgUri) : "/picture/pic1.jpg",
          stockQty: Number(item.stockQty ?? item.stock ?? 0),
          sku: item.uuid ? item.uuid.slice(0, 8).toUpperCase() : undefined,
        }
      })
  }, [listingsData])

  // Extract unique categories
  const categories = React.useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))]
  }, [products])

  // Filter products by search query & category
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory
      if (!matchCat) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    })
  }, [products, selectedCategory, searchQuery])

  // Order Cart Items
  const cartItems = React.useMemo(() => {
    return products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({
        product: p,
        quantity: quantities[p.id],
        lineTotal: p.price * quantities[p.id],
      }))
  }, [products, quantities])

  const subtotal = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  }, [cartItems])

  const total = subtotal // Tax included in listed price in Cambodia
  const totalItemCount = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  // Amount tendered & change calculation
  const amountTenderedNum = parseFloat(amountTenderedInput) || 0
  const changeDue = Math.max(0, amountTenderedNum - total)

  // Quantity controllers
  const handleSetQuantity = (id: string, delta: number) => {
    const product = products.find((p) => p.id === id)
    if (!product) return

    const maxStock = product.stockQty
    const currentQty = quantities[id] ?? 0
    const nextQty = Math.min(maxStock, Math.max(0, currentQty + delta))

    if (delta > 0 && currentQty >= maxStock) {
      toast.warning(`Maximum available stock reached (${maxStock} items)`)
      return
    }

    setQuantities((prev) => {
      if (nextQty === 0) {
        const copy = { ...prev }
        delete copy[id]
        return copy
      }
      return { ...prev, [id]: nextQty }
    })
  }

  const handleClearCart = () => {
    setQuantities({})
    setAmountTenderedInput("")
    setCustomerName("")
    setCustomerPhone("")
    setOrderNote("")
  }

  // Quick cash bill buttons
  const handleQuickCash = (amount: number) => {
    setAmountTenderedInput(String(amount))
  }

  // Submit POS Sale to Backend
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add products to the register first")
      return
    }

    if (paymentMethod === "CASH" && amountTenderedNum > 0 && amountTenderedNum < total) {
      toast.error(`Tendered cash ($${amountTenderedNum.toFixed(2)}) is less than total ($${total.toFixed(2)})`)
      return
    }

    const salePayload: PosSaleRequest = {
      saleUuid: crypto.randomUUID(),
      lines: cartItems.map((item) => ({
        listingUuid: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      customerName: isNamedCustomer && customerName.trim() ? customerName.trim() : "Walk-in Customer",
      customerPhone: isNamedCustomer && customerPhone.trim() ? customerPhone.trim() : undefined,
      amountTendered: paymentMethod === "CASH" ? (amountTenderedNum > 0 ? amountTenderedNum : total) : total,
      note: orderNote.trim() ? `[POS - ${paymentMethod}] ${orderNote.trim()}` : `[POS - ${paymentMethod}] In-Store Quick Sale`,
      soldAt: new Date().toISOString(),
    }

    try {
      const res = await createPosSale(salePayload).unwrap()
      toast.success("Sale completed successfully!")
      setCompletedSale(res)
      handleClearCart()
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to process sale. Please try again."
      toast.error(msg)
    }
  }

  return (
    <main className="min-h-[calc(100svh-70px)] bg-[#F8F9FC] p-3 sm:p-6">
      <div className="mx-auto max-w-[1700px] space-y-4">
        {/* Top POS Action Banner */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#6C4CD8] text-white shadow-xs">
              <Store className="size-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                POS Quick Register
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Fast walk-in checkout & instant in-person sales for {sellerProfile?.businessName || "your shop"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Link href="/seller-dashboard/orders">
                <History className="size-3.5 mr-1.5 text-slate-500" /> Order History
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700"
              title="Refresh inventory"
            >
              <RotateCcw className={cn("size-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>
        </header>

        {/* POS Grid & Register Layout */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* ── LEFT: PRODUCT CATALOG & SCANNER ── */}
          <section className="space-y-4 min-w-0">
            {/* Search & Category Filter Bar */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name or SKU barcode..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-950 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "h-8 shrink-0 rounded-xl px-3.5 text-xs font-bold transition cursor-pointer",
                      selectedCategory === cat
                        ? "bg-[#6C4CD8] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-56 rounded-3xl bg-slate-200/80 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-3">
                <AlertCircle className="size-8 text-rose-500" />
                <p className="text-sm font-bold text-slate-900">Failed to load store products</p>
                <Button onClick={() => refetch()} size="sm" className="rounded-xl bg-[#6C4CD8]">
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs space-y-2">
                <Package className="size-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-800">No matching products found</p>
                <p className="text-xs text-slate-400">Try adjusting your search query or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((product) => {
                  const qtyInCart = quantities[product.id] ?? 0
                  const isOutOfStock = product.stockQty <= 0

                  return (
                    <article
                      key={product.id}
                      onClick={() => !isOutOfStock && handleSetQuantity(product.id, 1)}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-3.5 shadow-xs transition-all select-none cursor-pointer",
                        isOutOfStock
                          ? "opacity-60 cursor-not-allowed border-slate-200"
                          : qtyInCart > 0
                          ? "border-[#6C4CD8] ring-2 ring-[#6C4CD8]/20 shadow-md"
                          : "border-slate-200/90 hover:border-[#6C4CD8]/50 hover:shadow-md hover:-translate-y-0.5",
                      )}
                    >
                      {/* Cart Quantity Chip */}
                      {qtyInCart > 0 && (
                        <span className="absolute top-2.5 right-2.5 z-10 grid size-6 place-items-center rounded-full bg-[#6C4CD8] text-xs font-black text-white shadow-md animate-in zoom-in-50">
                          {qtyInCart}
                        </span>
                      )}

                      <div>
                        {/* Image Thumbnail */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Title & SKU */}
                        <div className="pt-2.5 space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            SKU: {product.sku}
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Stock Footer */}
                      <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
                        <div>
                          <div className="text-xs sm:text-sm font-black text-[#6C4CD8] tabular-nums">
                            {formatMoney(product.price)}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold",
                              isOutOfStock
                                ? "text-rose-600"
                                : product.stockQty < 5
                                ? "text-amber-600"
                                : "text-slate-400",
                            )}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `${product.stockQty} in stock`}
                          </span>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          disabled={isOutOfStock || qtyInCart >= product.stockQty}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetQuantity(product.id, 1)
                          }}
                          className={cn(
                            "grid size-8 place-items-center rounded-xl transition cursor-pointer",
                            qtyInCart > 0
                              ? "bg-[#6C4CD8] text-white shadow-xs"
                              : "bg-purple-50 text-[#6C4CD8] hover:bg-[#6C4CD8] hover:text-white",
                          )}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── RIGHT: POS REGISTER & CART CHECKOUT ── */}
          <aside className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-5 lg:sticky lg:top-20">
            {/* Register Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-[#6C4CD8]">
                  <ShoppingCart className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-950">Active Cart</h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {totalItemCount} item{totalItemCount === 1 ? "" : "s"} selected
                  </p>
                </div>
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                >
                  <Trash2 className="size-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center space-y-1">
                  <ShoppingCart className="size-6 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Register is empty</p>
                  <p className="text-[10px] text-slate-400">Tap products on the left to add items</p>
                </div>
              ) : (
                cartItems.map(({ product, quantity, lineTotal }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs"
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-extrabold text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[11px] font-bold text-slate-400 tabular-nums">
                        {formatMoney(product.price)} each
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleSetQuantity(product.id, -1)}
                        className="grid size-6 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center font-black text-slate-950 tabular-nums text-xs">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetQuantity(product.id, 1)}
                        disabled={quantity >= product.stockQty}
                        className="grid size-6 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="w-16 text-right font-black text-slate-950 tabular-nums">
                      {formatMoney(lineTotal)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details Toggle */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Customer
                </span>
                <button
                  type="button"
                  onClick={() => setIsNamedCustomer(!isNamedCustomer)}
                  className="text-xs font-bold text-[#6C4CD8] hover:underline"
                >
                  {isNamedCustomer ? "Switch to Walk-in Guest" : "+ Add Customer Info"}
                </button>
              </div>

              {isNamedCustomer ? (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in-50 duration-200">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone (012...)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-100">
                  <User className="size-3.5 text-slate-400" />
                  <span>Walk-in Customer (In-store Guest)</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Payment Method
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl p-2.5 text-xs font-bold transition cursor-pointer border",
                    paymentMethod === "CASH"
                      ? "border-[#6C4CD8] bg-purple-50 text-[#6C4CD8] shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Banknote className="size-4" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("KHQR")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl p-2.5 text-xs font-bold transition cursor-pointer border",
                    paymentMethod === "KHQR"
                      ? "border-[#6C4CD8] bg-purple-50 text-[#6C4CD8] shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <QrCode className="size-4" />
                  <span>KHQR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl p-2.5 text-xs font-bold transition cursor-pointer border",
                    paymentMethod === "CARD"
                      ? "border-[#6C4CD8] bg-purple-50 text-[#6C4CD8] shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <CreditCard className="size-4" />
                  <span>Card / Transfer</span>
                </button>
              </div>

              {/* Cash Tendered & Quick Bills */}
              {paymentMethod === "CASH" && (
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80 space-y-2.5 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Cash Received ($):</span>
                    <div className="flex items-center gap-1 w-32">
                      <span className="text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountTenderedInput}
                        onChange={(e) => setAmountTenderedInput(e.target.value)}
                        placeholder={total.toFixed(2)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-950 text-right outline-none focus:border-[#6C4CD8]"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(total)}
                      className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-[#6C4CD8]"
                    >
                      Exact (${total.toFixed(2)})
                    </button>
                    {[5, 10, 20, 50, 100].map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => handleQuickCash(bill)}
                        className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-[#6C4CD8]"
                      >
                        ${bill}
                      </button>
                    ))}
                  </div>

                  {amountTenderedNum >= total && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs font-bold text-emerald-700">
                      <span>Change Due:</span>
                      <span className="font-black tabular-nums text-sm">
                        {formatMoney(changeDue)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Financial Totals */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal ({totalItemCount} items)</span>
                <span className="font-bold text-slate-900 tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Tax (Included)</span>
                <span className="font-bold text-slate-900 tabular-nums">$0.00</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-black text-slate-950">Grand Total</span>
                <span className="text-2xl font-black text-[#6C4CD8] tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            {/* Complete Sale CTA */}
            <Button
              type="button"
              disabled={cartItems.length === 0 || isSubmitting}
              onClick={handleCompleteSale}
              className="w-full h-12 rounded-2xl bg-[#6C4CD8] text-sm font-black text-white shadow-md shadow-[#6C4CD8]/25 hover:bg-[#5B3DC0] disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Processing Sale...
                </span>
              ) : (
                `Complete Sale (${formatMoney(total)})`
              )}
            </Button>
          </aside>
        </div>
      </div>

      {/* ── RECEIPT / SUCCESS MODAL ── */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Payment Complete!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Receipt #{completedSale.sale?.uuid?.slice(0, 8).toUpperCase() || "SALE"}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Store:</span>
                <span className="font-bold text-slate-900">
                  {sellerProfile?.businessName || "PhsarDigital Store"}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Customer:</span>
                <span className="font-bold text-slate-900">
                  {completedSale.sale?.buyerName || "Walk-in Customer"}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1.5 py-1">
                {completedSale.sale?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span className="truncate pr-2">
                      {item.quantity}x {item.title}
                    </span>
                    <span className="font-bold tabular-nums shrink-0">
                      {formatMoney(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-slate-900 font-extrabold text-sm">
                  <span>Total Paid:</span>
                  <span className="text-[#6C4CD8] tabular-nums">
                    {formatMoney(completedSale.sale?.totalPrice || 0)}
                  </span>
                </div>
                {completedSale.amountTendered !== undefined && (
                  <div className="flex justify-between text-slate-500">
                    <span>Cash Tendered:</span>
                    <span className="font-bold tabular-nums">
                      {formatMoney(completedSale.amountTendered)}
                    </span>
                  </div>
                )}
                {completedSale.changeDue !== undefined && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span className="font-black tabular-nums">
                      {formatMoney(completedSale.changeDue)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="rounded-xl border-slate-200 text-xs font-bold"
              >
                <Printer className="size-3.5 mr-1.5" /> Print Receipt
              </Button>

              <Button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="rounded-xl bg-[#6C4CD8] text-xs font-bold text-white hover:bg-[#5B3DC0]"
              >
                Start Next Sale →
              </Button>
            </div>

            {completedSale.sale?.uuid && (
              <div className="text-center">
                <Link
                  href={`/seller-dashboard/orders/${completedSale.sale.uuid}`}
                  className="text-[11px] font-bold text-[#6C4CD8] hover:underline"
                >
                  View full order details in Seller Orders →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
