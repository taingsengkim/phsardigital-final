"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  Barcode,
  CheckCircle2,
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
  Trash2,
  User,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn, getFileUrl } from "@/lib/utils"
import { useGetMyListingsQuery, useGetSellerProfileQuery, sellerApi } from "@/lib/api/sellerApi"
import { useCreatePosSaleMutation, purchaseApi } from "@/lib/redux/service/purchaseApi"
import { sellerDashboardApi } from "@/lib/redux/service/sellerDashboardApi"
import { useAppDispatch } from "@/lib/hooks"
import type { PosSaleRequest, PosSaleResponse } from "@/lib/types/pos"
import { Button } from "@/components/ui/button"

type PosProduct = {
  id: string
  name: string
  price: number
  fullPrice: number
  costPrice: number | null
  category: string
  image: string
  stockQty: number
  sku: string | null
  status: string
}

function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "$0.00"
  return `$${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function QuickOrderPage() {
  const dispatch = useAppDispatch()

  const saleUuidRef = React.useRef<string>(crypto.randomUUID())
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const {
    data: listingsData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetMyListingsQuery({
    search: debouncedSearch || undefined,
    pageNumber: 0,
    pageSize: 100,
  })

  const { data: sellerProfile } = useGetSellerProfileQuery()
  const [createPosSale, { isLoading: isSubmitting }] = useCreatePosSaleMutation()

  const [cartQuantities, setCartQuantities] = React.useState<Record<string, number>>({})
  const [unitPriceOverrides, setUnitPriceOverrides] = React.useState<Record<string, number>>({})

  const [isNamedCustomer, setIsNamedCustomer] = React.useState(false)
  const [customerName, setCustomerName] = React.useState("Walk-in Customer")
  const [customerPhone, setCustomerPhone] = React.useState("")
  const [orderNote, setOrderNote] = React.useState("")

  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "KHQR">("CASH")
  const [amountTenderedInput, setAmountTenderedInput] = React.useState<string>("")

  const [completedSale, setCompletedSale] = React.useState<PosSaleResponse | null>(null)

  const products = React.useMemo<PosProduct[]>(() => {
    const rawList = Array.isArray(listingsData)
      ? listingsData
      : (listingsData as any)?.content || (listingsData as any)?.data || []

    return rawList.map((item: any, index: number) => {
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
      const costPrice =
        item.costPrice !== null && item.costPrice !== undefined ? Number(item.costPrice) : null

      return {
        id: item.uuid || item.id || String(index),
        name: item.title || "Untitled product",
        price: activePrice,
        fullPrice: fullPrice > 0 ? fullPrice : activePrice,
        costPrice,
        category: item.category?.name || "General",
        image: imgUri ? getFileUrl(imgUri) : "/picture/pic1.jpg",
        stockQty: Number(item.stockQty ?? item.stock ?? 0),
        sku: item.sku || null,
        status: (item.status ?? "ACTIVE").toUpperCase(),
      }
    })
  }, [listingsData])

  const categories = React.useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))]
  }, [products])

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory === "All") return true
      return p.category === selectedCategory
    })
  }, [products, selectedCategory])

  const handleAddToCart = React.useCallback(
    (product: PosProduct, quantityDelta = 1) => {
      if (product.stockQty <= 0) {
        toast.error(`"${product.name}" is out of stock.`)
        return
      }

      setCartQuantities((prev) => {
        const currentQty = prev[product.id] ?? 0
        const maxStock = product.stockQty
        const nextQty = Math.min(maxStock, Math.max(0, currentQty + quantityDelta))

        if (currentQty + quantityDelta > maxStock) {
          toast.warning(`Maximum stock reached (${maxStock} available)`)
        }

        if (nextQty === 0) {
          const copy = { ...prev }
          delete copy[product.id]
          return copy
        }
        return { ...prev, [product.id]: nextQty }
      })

      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    },
    [],
  )

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const query = searchInput.trim()
      if (!query) return

      const exactSkuMatch = products.find(
        (p) => p.sku && p.sku.toLowerCase() === query.toLowerCase(),
      )

      if (exactSkuMatch) {
        handleAddToCart(exactSkuMatch, 1)
        toast.success(`Added: ${exactSkuMatch.name}`)
        setSearchInput("")
        setDebouncedSearch("")
        return
      }

      const matchingProducts = products.filter(
        (p) =>
          (p.sku && p.sku.toLowerCase().includes(query.toLowerCase())) ||
          p.name.toLowerCase().includes(query.toLowerCase()),
      )

      if (matchingProducts.length === 1) {
        handleAddToCart(matchingProducts[0], 1)
        toast.success(`Added: ${matchingProducts[0].name}`)
        setSearchInput("")
        setDebouncedSearch("")
      }
    }
  }

  const cartItems = React.useMemo(() => {
    return products
      .filter((p) => (cartQuantities[p.id] ?? 0) > 0)
      .map((p) => {
        const qty = cartQuantities[p.id]
        const unitPrice = unitPriceOverrides[p.id] ?? p.price
        return {
          product: p,
          quantity: qty,
          unitPrice,
          lineTotal: unitPrice * qty,
        }
      })
  }, [products, cartQuantities, unitPriceOverrides])

  const total = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  }, [cartItems])

  const totalItemCount = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  const amountTenderedNum = parseFloat(amountTenderedInput) || 0
  const isCashTenderValid = paymentMethod === "CASH" ? amountTenderedNum >= total : true
  const liveChangeDue =
    paymentMethod === "CASH" && amountTenderedNum >= total ? amountTenderedNum - total : null

  const handleSetQuantity = (id: string, delta: number) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    handleAddToCart(product, delta)
  }

  const handleRemoveItem = (id: string) => {
    setCartQuantities((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setUnitPriceOverrides((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    searchInputRef.current?.focus()
  }

  const handleUnitPriceChange = (product: PosProduct, newPrice: number) => {
    if (newPrice > product.fullPrice) {
      toast.error(`Price cannot exceed regular price (${formatMoney(product.fullPrice)})`)
      setUnitPriceOverrides((prev) => ({ ...prev, [product.id]: product.fullPrice }))
      return
    }
    if (newPrice < 0) return
    setUnitPriceOverrides((prev) => ({ ...prev, [product.id]: newPrice }))
  }

  const handleClearCart = () => {
    setCartQuantities({})
    setUnitPriceOverrides({})
    setAmountTenderedInput("")
    setCustomerName("Walk-in Customer")
    setCustomerPhone("")
    setOrderNote("")
    searchInputRef.current?.focus()
  }

  const handleQuickCashPreset = (amount: number) => {
    setAmountTenderedInput(amount.toFixed(2))
  }

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty.")
      return
    }

    if (paymentMethod === "CASH") {
      if (!amountTenderedInput || amountTenderedNum < total) {
        toast.error(`Amount tendered must be at least ${formatMoney(total)}`)
        return
      }
    }

    const salePayload: PosSaleRequest = {
      saleUuid: saleUuidRef.current,
      lines: cartItems.map((item) => ({
        listingUuid: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      customerName:
        isNamedCustomer && customerName.trim() ? customerName.trim() : "Walk-in Customer",
      customerPhone:
        isNamedCustomer && customerPhone.trim() ? customerPhone.trim() : undefined,
      paymentMethod,
      ...(paymentMethod === "CASH" ? { amountTendered: amountTenderedNum } : {}),
      note: orderNote.trim() ? orderNote.trim() : undefined,
      soldAt: new Date().toISOString(),
    }

    try {
      const res = await createPosSale(salePayload).unwrap()
      toast.success("Sale completed.")
      setCompletedSale(res)

      dispatch(sellerApi.util.invalidateTags(["SellerListings", "SellerOrders"]))
      dispatch(sellerDashboardApi.util.invalidateTags(["SellerDashboard"]))
      dispatch(purchaseApi.util.invalidateTags(["Purchase", "PurchaseSummary"]))

      handleClearCart()
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to process sale."
      toast.error(msg)
    }
  }

  const handleStartNextSale = () => {
    saleUuidRef.current = crypto.randomUUID()
    setCompletedSale(null)
    handleClearCart()
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  return (
    <main className="min-h-[calc(100svh-70px)] bg-slate-50/50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Top Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <Store className="size-4.5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                POS Register
              </h1>
              <p className="text-xs text-slate-500">
                {sellerProfile?.businessName || "Your Store"} · Barcode and walk-in sales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-lg text-xs h-8"
            >
              <Link href="/seller-dashboard/orders">
                <History className="size-3.5 mr-1 text-slate-400" /> Orders
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg text-xs h-8"
              title="Refresh catalogue"
            >
              <RotateCcw className={cn("size-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>
        </header>

        {/* 2-Column POS Layout */}
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]">
          {/* Left: Catalogue & Scanner */}
          <section className="space-y-4 min-w-0">
            {/* Search Input */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Scan barcode or type name / SKU (Press Enter to add)..."
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("")
                      setDebouncedSearch("")
                      searchInputRef.current?.focus()
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-md px-2.5 py-1 font-medium transition cursor-pointer shrink-0",
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-52 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
                <AlertCircle className="size-6 text-rose-500 mx-auto" />
                <p className="text-xs font-medium text-slate-900">Failed to load product catalogue</p>
                <Button onClick={() => refetch()} size="sm" variant="outline" className="text-xs">
                  Retry
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-1">
                <Package className="size-6 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-700">No matching products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const qtyInCart = cartQuantities[product.id] ?? 0
                  const isOutOfStock = product.stockQty <= 0

                  return (
                    <article
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product, 1)}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white p-3 transition select-none cursor-pointer",
                        isOutOfStock
                          ? "opacity-50 cursor-not-allowed border-slate-200"
                          : qtyInCart > 0
                          ? "border-slate-900 ring-1 ring-slate-900"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      {qtyInCart > 0 && (
                        <span className="absolute top-2 right-2 z-10 grid size-5 place-items-center rounded-full bg-slate-900 text-[10px] font-medium text-white shadow-xs">
                          {qtyInCart}
                        </span>
                      )}

                      <div>
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                          />
                        </div>

                        <div className="pt-2 space-y-0.5">
                          <h3 className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                          {product.sku && (
                            <p className="font-mono text-[10px] text-slate-400 truncate">
                              {product.sku}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 flex items-center justify-between border-t border-slate-100 mt-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 tabular-nums">
                            {formatMoney(product.price)}
                          </div>
                          {product.costPrice !== null && product.price > 0 && (
                            <span className="text-[10px] text-slate-400 block tabular-nums">
                              Cost: ${product.costPrice.toFixed(2)} · {(((product.price - product.costPrice) / product.price) * 100).toFixed(0)}%
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[10px]",
                              isOutOfStock
                                ? "text-rose-600"
                                : product.stockQty < 5
                                ? "text-amber-600"
                                : "text-slate-500",
                            )}
                          >
                            {isOutOfStock ? "Out of stock" : `${product.stockQty} in stock`}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock || qtyInCart >= product.stockQty}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product, 1)
                          }}
                          className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Right: Register Sidebar */}
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4 lg:sticky lg:top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Current Order</h2>
                <p className="text-xs text-slate-400">
                  {totalItemCount} item{totalItemCount === 1 ? "" : "s"}
                </p>
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No items added yet.
                </div>
              ) : (
                cartItems.map(({ product, quantity, unitPrice, lineTotal }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-medium text-slate-900 truncate">{product.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>$</span>
                        <input
                          type="number"
                          step="0.01"
                          max={product.fullPrice}
                          min="0"
                          value={unitPrice}
                          onChange={(e) =>
                            handleUnitPriceChange(product, parseFloat(e.target.value) || 0)
                          }
                          className="w-12 rounded border border-slate-200 bg-white px-1 text-[11px] text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center rounded border border-slate-200 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => handleSetQuantity(product.id, -1)}
                        className="grid size-5 place-items-center text-slate-500 hover:bg-slate-100"
                      >
                        <Minus className="size-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-medium tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetQuantity(product.id, 1)}
                        disabled={quantity >= product.stockQty}
                        className="grid size-5 place-items-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Plus className="size-2.5" />
                      </button>
                    </div>

                    <div className="w-12 text-right font-medium text-slate-900 tabular-nums">
                      {formatMoney(lineTotal)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(product.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details Toggle */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Customer</span>
                <button
                  type="button"
                  onClick={() => setIsNamedCustomer(!isNamedCustomer)}
                  className="text-slate-700 hover:underline"
                >
                  {isNamedCustomer ? "Switch to Walk-in" : "+ Add customer info"}
                </button>
              </div>

              {isNamedCustomer ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-md border border-slate-200 px-2 py-1 outline-none"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full rounded-md border border-slate-200 px-2 py-1 outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="size-3.5 text-slate-400" />
                  <span>Walk-in Customer</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <span className="text-slate-500 font-medium block">Payment Method</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "rounded-lg py-2 font-medium transition cursor-pointer border",
                    paymentMethod === "CASH"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("KHQR")}
                  className={cn(
                    "rounded-lg py-2 font-medium transition cursor-pointer border",
                    paymentMethod === "KHQR"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  KHQR Counter
                </button>
              </div>

              {/* Cash Controls */}
              {paymentMethod === "CASH" && (
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Amount Tendered ($):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountTenderedInput}
                      onChange={(e) => setAmountTenderedInput(e.target.value)}
                      placeholder={total.toFixed(2)}
                      className="w-24 rounded border border-slate-200 bg-white px-2 py-0.5 text-right font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickCashPreset(total)}
                      className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-700 border border-slate-200 hover:bg-slate-100"
                    >
                      Exact (${total.toFixed(2)})
                    </button>
                    {[5, 10, 20, 50, 100].map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => handleQuickCashPreset(bill)}
                        className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-700 border border-slate-200 hover:bg-slate-100"
                      >
                        ${bill}
                      </button>
                    ))}
                  </div>

                  {amountTenderedNum > 0 && (
                    <div
                      className={cn(
                        "flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-medium",
                        amountTenderedNum >= total ? "text-emerald-700" : "text-rose-600",
                      )}
                    >
                      <span>{amountTenderedNum >= total ? "Change Due:" : "Remaining:"}</span>
                      <span className="tabular-nums">
                        {amountTenderedNum >= total
                          ? formatMoney(liveChangeDue)
                          : formatMoney(total - amountTenderedNum)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "KHQR" && (
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs text-slate-600">
                  Confirm customer has paid via the counter KHQR stand before completing sale.
                </div>
              )}
            </div>

            {/* Total & Submit */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total Due</span>
                <span className="text-lg font-semibold text-slate-900 tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>

              <Button
                type="button"
                disabled={cartItems.length === 0 || !isCashTenderValid || isSubmitting}
                onClick={handleCompleteSale}
                className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" /> Processing...
                  </span>
                ) : paymentMethod === "KHQR" ? (
                  `Confirm Paid (${formatMoney(total)})`
                ) : (
                  `Complete Sale (${formatMoney(total)})`
                )}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Receipt Modal ── */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl space-y-4 border border-slate-200 text-xs">
            <div className="text-center space-y-1">
              <div className="mx-auto grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700 mb-1">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Sale Complete</h3>
              <p className="text-[11px] text-slate-400">
                Receipt #{completedSale.sale?.uuid?.slice(0, 8).toUpperCase() || "SALE"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Customer</span>
                <span className="text-slate-900">{completedSale.sale?.buyerName || "Walk-in Customer"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment</span>
                <span className="text-slate-900">{completedSale.paymentMethod || "CASH"}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                {completedSale.sale?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span className="truncate pr-2">{item.quantity}x {item.title}</span>
                    <span className="tabular-nums">{formatMoney(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-slate-900 font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{formatMoney(completedSale.sale?.totalPrice)}</span>
                </div>
                {completedSale.amountTendered !== undefined && completedSale.amountTendered !== null && (
                  <div className="flex justify-between text-slate-500">
                    <span>Cash Tendered</span>
                    <span className="tabular-nums">{formatMoney(completedSale.amountTendered)}</span>
                  </div>
                )}
                {completedSale.changeDue !== undefined && completedSale.changeDue !== null && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Change</span>
                    <span className="tabular-nums">{formatMoney(completedSale.changeDue)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs h-8"
              >
                <Printer className="size-3.5 mr-1" /> Print
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleStartNextSale}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8"
              >
                Next sale
              </Button>
            </div>

            {completedSale.sale?.uuid && (
              <div className="text-center pt-1">
                <Link
                  href={`/seller-dashboard/orders/${completedSale.sale.uuid}`}
                  className="text-[11px] text-slate-500 hover:text-slate-900 underline"
                >
                  View in seller orders
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
