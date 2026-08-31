"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  Barcode,
  Check,
  Edit,
  ExternalLink,
  Layers,
  Loader2,
  Minus,
  Package,
  PackagePlus,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useUpdateSellerListingMutation } from "@/lib/redux/service/sellerProductApi"
import { sellerApi } from "@/lib/api/sellerApi"
import { useAppDispatch } from "@/lib/hooks"
import { Button } from "@/components/ui/button"

export interface ProductRow {
  id: string
  uuid?: string
  title: string
  category: string
  image: string
  status: "active" | "deactive"
  price: string
  stockQty: number
  sku?: string | null
  sales?: string
  views: string
  viewsBar: number
  likes: number
  likesBar: number
  likesColor: string
}

export const ProductTable: React.FC<{ products?: ProductRow[] }> = ({ products = [] }) => {
  const dispatch = useAppDispatch()
  const [updateSellerListing] = useUpdateSellerListingMutation()

  const [query, setQuery] = React.useState("")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  // Quick Restock Dialog State
  const [restockProduct, setRestockProduct] = React.useState<ProductRow | null>(null)
  const [restockMode, setRestockMode] = React.useState<"ADD" | "SET">("ADD")
  const [restockAmount, setRestockAmount] = React.useState<number>(10)
  const [isSavingRestock, setIsSavingRestock] = React.useState(false)

  const visibleProducts = products.filter((product) =>
    `${product.title} ${product.category} ${product.sku || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )

  // Direct Inline Stock Stepper
  const handleInlineStockChange = async (product: ProductRow, delta: number) => {
    const targetUuid = product.uuid || product.id
    if (!targetUuid) return

    const newStock = Math.max(0, product.stockQty + delta)
    if (newStock === product.stockQty) return

    setUpdatingId(targetUuid)
    try {
      await updateSellerListing({
        uuid: targetUuid,
        body: {
          stockQty: newStock,
        },
      }).unwrap()

      dispatch(sellerApi.util.invalidateTags(["SellerListings"]))
      toast.success(`Updated stock for "${product.title}": ${newStock} units`)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update stock.")
    } finally {
      setUpdatingId(null)
    }
  }

  // Open Restock Modal
  const openRestockModal = (product: ProductRow) => {
    setRestockProduct(product)
    setRestockMode("ADD")
    setRestockAmount(10)
  }

  // Submit Restock Modal
  const handleSaveRestock = async () => {
    if (!restockProduct) return
    const targetUuid = restockProduct.uuid || restockProduct.id

    const newStock =
      restockMode === "ADD"
        ? Math.max(0, restockProduct.stockQty + restockAmount)
        : Math.max(0, restockAmount)

    setIsSavingRestock(true)
    try {
      await updateSellerListing({
        uuid: targetUuid,
        body: {
          stockQty: newStock,
        },
      }).unwrap()

      dispatch(sellerApi.util.invalidateTags(["SellerListings"]))
      toast.success(
        `Restocked "${restockProduct.title}": ${restockProduct.stockQty} → ${newStock} units!`,
      )
      setRestockProduct(null)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to restock product.")
    } finally {
      setIsSavingRestock(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-purple-50 text-[#6C4CD8]">
            <Package className="size-4.5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Store Inventory</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage stock levels, quick restock, and edit product listings
            </p>
          </div>
        </div>

        <div className="relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, or SKU barcode..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pr-4 pl-11 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#6C4CD8] focus:bg-white focus:ring-2 focus:ring-[#6C4CD8]/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-400">
              <th className="pb-4 font-black">Product Item</th>
              <th className="pb-4 font-black">Status</th>
              <th className="pb-4 font-black">Price</th>
              <th className="pb-4 font-black">Stock Level</th>
              <th className="pb-4 font-black">Quick Restock</th>
              <th className="pb-4 pr-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => {
              const targetUuid = product.uuid || product.id
              const isUpdatingThis = updatingId === targetUuid

              return (
                <tr
                  key={product.id}
                  className="group border-t border-slate-100 align-middle transition-colors hover:bg-slate-50/60"
                >
                  {/* Product Info */}
                  <td className="border-t border-slate-100 py-4 pr-6">
                    <div className="flex items-center gap-3.5">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-[260px]">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-950 truncate leading-snug">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {product.category}
                          </span>
                          {product.sku && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-[10px] font-bold text-[#6C4CD8]">
                                SKU: {product.sku}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="border-t border-slate-100 py-4 pr-6">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-xl px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider",
                        product.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200",
                      )}
                    >
                      {product.status === "active" ? "Active" : "Draft / Inactive"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="border-t border-slate-100 py-4 pr-6 text-sm font-black text-slate-900 tabular-nums">
                    {product.price}
                  </td>

                  {/* Stock Level Badge */}
                  <td className="border-t border-slate-100 py-4 pr-6">
                    <div className="space-y-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-black",
                          product.stockQty > 4
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : product.stockQty > 0
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            product.stockQty > 4
                              ? "bg-emerald-600"
                              : product.stockQty > 0
                              ? "bg-amber-600"
                              : "bg-rose-600",
                          )}
                        />
                        {product.stockQty > 4
                          ? `${product.stockQty} in stock`
                          : product.stockQty > 0
                          ? `Only ${product.stockQty} left`
                          : "Out of stock"}
                      </span>
                    </div>
                  </td>

                  {/* Quick Inline Stepper */}
                  <td className="border-t border-slate-100 py-4 pr-6">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-xs">
                        <button
                          type="button"
                          disabled={product.stockQty <= 0 || isUpdatingThis}
                          onClick={() => handleInlineStockChange(product, -1)}
                          className="grid size-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                          title="Decrease stock by 1"
                        >
                          <Minus className="size-3" />
                        </button>

                        <span className="w-8 text-center font-black text-slate-950 tabular-nums text-xs">
                          {isUpdatingThis ? (
                            <Loader2 className="size-3 animate-spin mx-auto text-[#6C4CD8]" />
                          ) : (
                            product.stockQty
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={isUpdatingThis}
                          onClick={() => handleInlineStockChange(product, 1)}
                          className="grid size-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                          title="Increase stock by 1"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      {/* Open Restock Modal Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openRestockModal(product)}
                        className="rounded-xl border-purple-200 bg-purple-50 text-[#6C4CD8] hover:bg-[#6C4CD8] hover:text-white text-xs font-bold px-2.5 h-8 transition cursor-pointer"
                      >
                        <PackagePlus className="size-3.5 mr-1" /> + Restock
                      </Button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="border-t border-slate-100 py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 text-xs font-bold h-8"
                      >
                        <Link href={`/seller-dashboard/products/new?edit=${targetUuid}`}>
                          <Edit className="size-3.5 mr-1 text-slate-500" /> Edit
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {visibleProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="border-t border-slate-100 py-12 text-center text-xs text-slate-400">
                  No products found matching &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── QUICK RESTOCK MODAL ── */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-[#6C4CD8]">
                  <PackagePlus className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950">Quick Restock</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Adjust inventory levels instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200">
                <Image
                  src={restockProduct.image}
                  alt={restockProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-950 truncate">
                  {restockProduct.title}
                </h4>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                  <span>Current:</span>
                  <span className="font-black text-slate-900 tabular-nums">
                    {restockProduct.stockQty} units
                  </span>
                  {restockProduct.sku && (
                    <span className="font-mono text-[10px] text-purple-700">
                      ({restockProduct.sku})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mode Switcher: ADD to stock vs SET exact */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setRestockMode("ADD")}
                  className={cn(
                    "rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                    restockMode === "ADD"
                      ? "bg-white text-[#6C4CD8] shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  + Add to Current Stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRestockMode("SET")
                    setRestockAmount(restockProduct.stockQty)
                  }}
                  className={cn(
                    "rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                    restockMode === "SET"
                      ? "bg-white text-[#6C4CD8] shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Set Exact Quantity
                </button>
              </div>

              {/* Number Input & Stepper */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  {restockMode === "ADD" ? "Units to Add:" : "New Total Units:"}
                </span>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-xs w-44">
                  <button
                    type="button"
                    onClick={() => setRestockAmount(Math.max(0, restockAmount - 1))}
                    className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100"
                  >
                    <Minus className="size-4" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center font-black text-sm tabular-nums outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setRestockAmount(restockAmount + 1)}
                    className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 self-center mr-1">
                  Quick:
                </span>
                {[5, 10, 20, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      if (restockMode === "ADD") {
                        setRestockAmount(amt)
                      } else {
                        setRestockAmount(amt)
                      }
                    }}
                    className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700 hover:bg-purple-50 hover:text-[#6C4CD8] transition border border-slate-200"
                  >
                    {restockMode === "ADD" ? `+${amt}` : amt}
                  </button>
                ))}
              </div>

              {/* Calculation Preview */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs font-bold text-emerald-800">
                <span>Resulting New Stock:</span>
                <span className="font-black text-base tabular-nums">
                  {restockMode === "ADD"
                    ? restockProduct.stockQty + restockAmount
                    : restockAmount}{" "}
                  units
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRestockProduct(null)}
                className="rounded-xl border-slate-200 text-xs font-bold"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isSavingRestock}
                onClick={handleSaveRestock}
                className="rounded-xl bg-[#6C4CD8] hover:bg-[#5B3DC0] text-xs font-black text-white shadow-md shadow-[#6C4CD8]/25"
              >
                {isSavingRestock ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Updating...
                  </span>
                ) : (
                  "Update Inventory"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
