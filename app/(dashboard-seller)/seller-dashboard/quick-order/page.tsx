"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Barcode,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  ExternalLink,
  History,
  Info,
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
  Zap,
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

  // Idempotency Key: Generate ONCE per sale. Reused on network retry, reset on "Start Next Sale".
  const saleUuidRef = React.useRef<string>(crypto.randomUUID())

  // Hardware Scanner & Search Input Ref
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Search & Filters
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All")

  // Debounce typed search input ~250ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Focus search input on mount
  React.useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Fetch store listings (searches across all statuses including DRAFT)
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

  // Cart Quantities & custom unit prices: listingUuid -> quantity
  const [cartQuantities, setCartQuantities] = React.useState<Record<string, number>>({})
  const [unitPriceOverrides, setUnitPriceOverrides] = React.useState<Record<string, number>>({})

  // Customer Details
  const [isNamedCustomer, setIsNamedCustomer] = React.useState(false)
  const [customerName, setCustomerName] = React.useState("Walk-in Customer")
  const [customerPhone, setCustomerPhone] = React.useState("")
  const [orderNote, setOrderNote] = React.useState("")

  // Payment State: "CASH" | "KHQR"
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "KHQR">("CASH")
  const [amountTenderedInput, setAmountTenderedInput] = React.useState<string>("")

  // Completed Sale Receipt Modal
  const [completedSale, setCompletedSale] = React.useState<PosSaleResponse | null>(null)

  // Map backend listings to POS products
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

      return {
        id: item.uuid || item.id || String(index),
        name: item.title || "Untitled product",
        price: activePrice,
        fullPrice: fullPrice > 0 ? fullPrice : activePrice,
        category: item.category?.name || "General",
        image: imgUri ? getFileUrl(imgUri) : "/picture/pic1.jpg",
        stockQty: Number(item.stockQty ?? item.stock ?? 0),
        sku: item.sku || null,
        status: (item.status ?? "ACTIVE").toUpperCase(),
      }
    })
  }, [listingsData])

  // Extract unique categories
  const categories = React.useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))]
  }, [products])

  // Filter products by selected category
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory === "All") return true
      return p.category === selectedCategory
    })
  }, [products, selectedCategory])

  // Add product to cart helper
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
          toast.warning(`Maximum available stock reached (${maxStock} in stock)`)
        }

        if (nextQty === 0) {
          const copy = { ...prev }
          delete copy[product.id]
          return copy
        }
        return { ...prev, [product.id]: nextQty }
      })

      // Refocus search input for continuous scanning
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    },
    [],
  )

  // Hardware Scanner / Enter key handling
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const query = searchInput.trim()
      if (!query) return

      // Look for exact SKU match (case-insensitive) or exact title match
      const exactSkuMatch = products.find(
        (p) => p.sku && p.sku.toLowerCase() === query.toLowerCase(),
      )

      if (exactSkuMatch) {
        handleAddToCart(exactSkuMatch, 1)
        toast.success(`Scanned: ${exactSkuMatch.name}`)
        setSearchInput("")
        setDebouncedSearch("")
        return
      }

      // If only 1 product in the result set, auto-add
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

  // Cart Items
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

  // Cash tendered calculation
  const amountTenderedNum = parseFloat(amountTenderedInput) || 0
  const isCashTenderValid = paymentMethod === "CASH" ? amountTenderedNum >= total : true
  const liveChangeDue =
    paymentMethod === "CASH" && amountTenderedNum >= total ? amountTenderedNum - total : null

  // Quantity controllers
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

  // Quick cash bill presets
  const handleQuickCashPreset = (amount: number) => {
    setAmountTenderedInput(amount.toFixed(2))
  }

  // Submit POS Sale
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add products first.")
      return
    }

    if (paymentMethod === "CASH") {
      if (!amountTenderedInput || amountTenderedNum < total) {
        toast.error(`Amount tendered must be at least ${formatMoney(total)}`)
        return
      }
    }

    // Build payload according to backend rules:
    // CASH: send amountTendered
    // KHQR: DO NOT send amountTendered (omit field)
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
      toast.success("Sale completed successfully!")
      setCompletedSale(res)

      // Invalidate seller orders, orders summary, and dashboard overview
      dispatch(sellerApi.util.invalidateTags(["SellerListings", "SellerOrders"]))
      dispatch(sellerDashboardApi.util.invalidateTags(["SellerDashboard"]))
      dispatch(purchaseApi.util.invalidateTags(["Purchase", "PurchaseSummary"]))

      handleClearCart()
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to process POS sale. Please retry."
      toast.error(msg)
    }
  }

  // Start Next Sale
  const handleStartNextSale = () => {
    saleUuidRef.current = crypto.randomUUID()
    setCompletedSale(null)
    handleClearCart()
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  return (
    <main className="min-h-[calc(100svh-70px)] bg-[#F8F9FC] p-3 sm:p-6">
      <div className="mx-auto max-w-[1750px] space-y-4">
        {/* ── Top POS Header ── */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#6C4CD8] text-white shadow-xs">
              <Store className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                  POS Counter Register
                </h1>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                  Ready to Scan
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {sellerProfile?.businessName || "Your Store"} • Fast Barcode & Walk-in Checkout
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
                <History className="size-3.5 mr-1.5 text-slate-500" /> View Orders
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700"
              title="Refresh product catalogue"
            >
              <RotateCcw className={cn("size-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>
        </header>

        {/* ── 2-Column POS Layout ── */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px]">
          {/* ── LEFT: PRODUCT CATALOGUE & SCANNER ── */}
          <section className="space-y-4 min-w-0">
            {/* Search & Barcode Input */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
              <div className="relative">
                <Barcode className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Scan barcode or type product name / SKU (Press Enter to quick-add)..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 py-3 text-xs sm:text-sm font-medium text-slate-950 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20"
                />
                {searchInput ? (
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
                ) : (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
                    SCANNER READY
                  </span>
                )}
              </div>

              {/* Category Pills */}
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
                  <div key={i} className="h-60 rounded-3xl bg-slate-200/80 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-3">
                <AlertCircle className="size-8 text-rose-500" />
                <p className="text-sm font-bold text-slate-900">Failed to load product catalogue</p>
                <Button onClick={() => refetch()} size="sm" className="rounded-xl bg-[#6C4CD8]">
                  Retry
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs space-y-2">
                <Package className="size-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-800">No matching products found</p>
                <p className="text-xs text-slate-400">
                  Try adjusting your search query or category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((product) => {
                  const qtyInCart = cartQuantities[product.id] ?? 0
                  const isOutOfStock = product.stockQty <= 0

                  return (
                    <article
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product, 1)}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-3.5 shadow-xs transition-all select-none cursor-pointer",
                        isOutOfStock
                          ? "opacity-55 cursor-not-allowed border-slate-200"
                          : qtyInCart > 0
                          ? "border-[#6C4CD8] ring-2 ring-[#6C4CD8]/20 shadow-md"
                          : "border-slate-200/90 hover:border-[#6C4CD8]/50 hover:shadow-md hover:-translate-y-0.5",
                      )}
                    >
                      {/* Cart Quantity Badge */}
                      {qtyInCart > 0 && (
                        <span className="absolute top-2.5 right-2.5 z-10 grid size-6 place-items-center rounded-full bg-[#6C4CD8] text-xs font-black text-white shadow-md animate-in zoom-in-50">
                          {qtyInCart}
                        </span>
                      )}

                      <div>
                        {/* Thumbnail */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                          {product.status === "DRAFT" && (
                            <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur-xs">
                              DRAFT
                            </span>
                          )}
                        </div>

                        {/* Title & Monospaced SKU */}
                        <div className="pt-2.5 space-y-1">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-500">
                            <Barcode className="size-3 text-slate-400" />
                            <span className="truncate">{product.sku || "NO-SKU"}</span>
                          </div>
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
                                : "text-emerald-700",
                            )}
                          >
                            {isOutOfStock ? "Out of stock" : `${product.stockQty} in stock`}
                          </span>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          disabled={isOutOfStock || qtyInCart >= product.stockQty}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product, 1)
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

          {/* ── RIGHT: REGISTER & CHECKOUT PANEL ── */}
          <aside className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-5 lg:sticky lg:top-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-[#6C4CD8]">
                  <ShoppingCart className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-950">Active Cart</h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {totalItemCount} item{totalItemCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                >
                  <Trash2 className="size-3.5" /> Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center space-y-1">
                  <ShoppingCart className="size-6 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Register is empty</p>
                  <p className="text-[10px] text-slate-400">
                    Scan barcodes or tap products to ring up sale
                  </p>
                </div>
              ) : (
                cartItems.map(({ product, quantity, unitPrice, lineTotal }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs"
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="font-extrabold text-slate-900 truncate">{product.name}</h4>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-slate-400">
                          {product.sku || "NO-SKU"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-0.5">
                          <span className="text-[10px] text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            max={product.fullPrice}
                            min="0"
                            value={unitPrice}
                            onChange={(e) =>
                              handleUnitPriceChange(product, parseFloat(e.target.value) || 0)
                            }
                            className="w-14 rounded border border-slate-200 bg-white px-1 py-0.5 text-[11px] font-bold text-slate-900 text-right outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-xs shrink-0">
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
                    <div className="w-14 text-right font-black text-slate-950 tabular-nums shrink-0">
                      {formatMoney(lineTotal)}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="size-3.5" />
                    </button>
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
                  {isNamedCustomer ? "Switch to Walk-in" : "+ Add Customer Info"}
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
                  <span>Walk-in Customer</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Payment Method
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition cursor-pointer border",
                    paymentMethod === "CASH"
                      ? "border-[#6C4CD8] bg-purple-50 text-[#6C4CD8] shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Banknote className="size-4" />
                  <span>Cash Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("KHQR")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition cursor-pointer border",
                    paymentMethod === "KHQR"
                      ? "border-[#6C4CD8] bg-purple-50 text-[#6C4CD8] shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <QrCode className="size-4" />
                  <span>KHQR Counter</span>
                </button>
              </div>

              {/* CASH MODE: Cash Tendered Input & Live Change */}
              {paymentMethod === "CASH" && (
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80 space-y-2.5 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Amount Tendered ($):</span>
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

                  {/* Cash Presets */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickCashPreset(total)}
                      className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-[#6C4CD8]"
                    >
                      Exact (${total.toFixed(2)})
                    </button>
                    {[5, 10, 20, 50, 100].map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => handleQuickCashPreset(bill)}
                        className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-[#6C4CD8]"
                      >
                        ${bill}
                      </button>
                    ))}
                  </div>

                  {/* Live Change Due Calculation */}
                  {amountTenderedNum > 0 && (
                    <div
                      className={cn(
                        "flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs font-bold",
                        amountTenderedNum >= total ? "text-emerald-700" : "text-rose-600",
                      )}
                    >
                      <span>{amountTenderedNum >= total ? "Change Due:" : "Short by:"}</span>
                      <span className="font-black tabular-nums text-sm">
                        {amountTenderedNum >= total
                          ? formatMoney(liveChangeDue)
                          : formatMoney(total - amountTenderedNum)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* KHQR MODE: Counter Confirmation Notice (No generated QR / No spinner) */}
              {paymentMethod === "KHQR" && (
                <div className="rounded-2xl bg-purple-50/70 p-3.5 border border-purple-200/70 text-xs space-y-1.5 animate-in fade-in-50 duration-150">
                  <div className="flex items-center gap-1.5 font-extrabold text-[#6C4CD8]">
                    <QrCode className="size-4" />
                    <span>In-Store KHQR Payment</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Show the counter KHQR stand to the customer. Once they confirm payment in their
                    banking app, click below to finalize the sale.
                  </p>
                </div>
              )}
            </div>

            {/* Total Display */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  Grand Total
                </span>
                <span className="text-2xl font-black text-[#6C4CD8] tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>

              {/* Complete Sale CTA */}
              <Button
                type="button"
                disabled={cartItems.length === 0 || !isCashTenderValid || isSubmitting}
                onClick={handleCompleteSale}
                className="h-12 px-6 rounded-2xl bg-[#6C4CD8] text-sm font-black text-white shadow-md shadow-[#6C4CD8]/25 hover:bg-[#5B3DC0] disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Processing...
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

      {/* ── RECEIPT / COMPLETION MODAL ── */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100">
            {/* Modal Header */}
            <div className="text-center space-y-1">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 mb-2">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Sale Completed!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Receipt #{completedSale.sale?.uuid?.slice(0, 8).toUpperCase() || "SALE"}
              </p>
            </div>

            {/* Printable Receipt Paper */}
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

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Payment Mode:</span>
                <span className="font-black text-slate-900">
                  {completedSale.paymentMethod || "CASH"}
                </span>
              </div>

              {/* Items List */}
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

              {/* Financial Totals */}
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-slate-900 font-extrabold text-sm">
                  <span>Total Amount:</span>
                  <span className="text-[#6C4CD8] tabular-nums">
                    {formatMoney(completedSale.sale?.totalPrice)}
                  </span>
                </div>

                {/* Amount Tendered (Cash only) */}
                {completedSale.amountTendered !== undefined &&
                  completedSale.amountTendered !== null && (
                    <div className="flex justify-between text-slate-500">
                      <span>Cash Tendered:</span>
                      <span className="font-bold tabular-nums">
                        {formatMoney(completedSale.amountTendered)}
                      </span>
                    </div>
                  )}

                {/* Change Due (Render nothing if null/not calculated, do NOT render $0.00) */}
                {completedSale.changeDue !== undefined &&
                  completedSale.changeDue !== null && (
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
                onClick={handleStartNextSale}
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
                  View full order #{completedSale.sale.uuid.slice(0, 8)} in Seller Orders →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
