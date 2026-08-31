"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Loader2,
  Minus,
  Package,
  PackagePlus,
  Plus,
  Search,
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
  numericPrice?: number
  costPrice?: number | null
  profitPerUnit?: number | null
  marginPercent?: number | null
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
  const [filterMode, setFilterMode] = React.useState<
    "ALL" | "ACTIVE" | "DRAFT" | "MISSING_COST" | "LOW_STOCK"
  >("ALL")
  const [marginSortDirection, setMarginSortDirection] = React.useState<"asc" | "desc" | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  // Quick Restock Dialog State
  const [restockProduct, setRestockProduct] = React.useState<ProductRow | null>(null)
  const [restockMode, setRestockMode] = React.useState<"ADD" | "SET">("ADD")
  const [restockAmount, setRestockAmount] = React.useState<number>(10)
  const [isSavingRestock, setIsSavingRestock] = React.useState(false)

  // Missing cost price count
  const missingCostCount = React.useMemo(() => {
    return products.filter((p) => p.costPrice === null || p.costPrice === undefined).length
  }, [products])

  // Filter & Sort Logic
  const visibleProducts = React.useMemo(() => {
    let list = products.filter((product) => {
      const matchesQuery = `${product.title} ${product.category} ${product.sku || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
      if (!matchesQuery) return false

      if (filterMode === "ACTIVE") return product.status === "active"
      if (filterMode === "DRAFT") return product.status === "deactive"
      if (filterMode === "MISSING_COST")
        return product.costPrice === null || product.costPrice === undefined
      if (filterMode === "LOW_STOCK") return product.stockQty < 5

      return true
    })

    if (marginSortDirection !== null) {
      list = [...list].sort((a, b) => {
        const marginA =
          a.marginPercent !== null && a.marginPercent !== undefined
            ? a.marginPercent
            : -99999
        const marginB =
          b.marginPercent !== null && b.marginPercent !== undefined
            ? b.marginPercent
            : -99999

        if (marginSortDirection === "asc") return marginA - marginB
        return marginB - marginA
      })
    }

    return list
  }, [products, query, filterMode, marginSortDirection])

  const handleToggleMarginSort = () => {
    if (marginSortDirection === null) setMarginSortDirection("desc")
    else if (marginSortDirection === "desc") setMarginSortDirection("asc")
    else setMarginSortDirection(null)
  }

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
        `Restocked "${restockProduct.title}": ${restockProduct.stockQty} → ${newStock} units`,
      )
      setRestockProduct(null)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to restock product.")
    } finally {
      setIsSavingRestock(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Store Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track costs, calculate margins, and manage inventory levels
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, SKU, or category..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setFilterMode("ALL")}
          className={cn(
            "rounded-md px-3 py-1 font-medium transition shrink-0",
            filterMode === "ALL"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          All ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode("ACTIVE")}
          className={cn(
            "rounded-md px-3 py-1 font-medium transition shrink-0",
            filterMode === "ACTIVE"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          Active
        </button>

        <button
          type="button"
          onClick={() => setFilterMode("DRAFT")}
          className={cn(
            "rounded-md px-3 py-1 font-medium transition shrink-0",
            filterMode === "DRAFT"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          Draft
        </button>

        <button
          type="button"
          onClick={() => setFilterMode("MISSING_COST")}
          className={cn(
            "rounded-md px-3 py-1 font-medium transition shrink-0 flex items-center gap-1.5",
            filterMode === "MISSING_COST"
              ? "bg-amber-700 text-white"
              : missingCostCount > 0
              ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          <AlertTriangle className="size-3" />
          <span>Missing Cost ({missingCostCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode("LOW_STOCK")}
          className={cn(
            "rounded-md px-3 py-1 font-medium transition shrink-0",
            filterMode === "LOW_STOCK"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          Low Stock (&lt; 5)
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium">
              <th className="pb-3 pr-4 font-medium">Product</th>
              <th className="pb-3 pr-4 font-medium">SKU / Code</th>
              <th className="pb-3 pr-4 font-medium">Price</th>
              <th className="pb-3 pr-4 font-medium">Cost</th>
              <th
                className="pb-3 pr-4 font-medium cursor-pointer select-none"
                onClick={handleToggleMarginSort}
              >
                <div className="inline-flex items-center gap-1 hover:text-slate-900 transition">
                  <span>Margin</span>
                  {marginSortDirection === "desc" ? (
                    <ArrowDown className="size-3 text-slate-900" />
                  ) : marginSortDirection === "asc" ? (
                    <ArrowUp className="size-3 text-slate-900" />
                  ) : (
                    <ArrowUpDown className="size-3 text-slate-400" />
                  )}
                </div>
              </th>
              <th className="pb-3 pr-4 font-medium">Stock</th>
              <th className="pb-3 pr-4 font-medium">Restock</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleProducts.map((product) => {
              const targetUuid = product.uuid || product.id
              const isUpdatingThis = updatingId === targetUuid
              const hasCost = product.costPrice !== null && product.costPrice !== undefined

              return (
                <tr key={product.id} className="hover:bg-slate-50/70 transition">
                  {/* Product Info */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-[220px]">
                        <p className="font-medium text-slate-900 truncate">{product.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{product.category}</p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3.5 pr-4">
                    {product.sku ? (
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 rounded px-1.5 py-0.5">
                        {product.sku}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not set</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 pr-4 font-medium text-slate-900 tabular-nums">
                    {product.price}
                  </td>

                  {/* Cost */}
                  <td className="py-3.5 pr-4 tabular-nums text-slate-600">
                    {hasCost ? (
                      `$${Number(product.costPrice).toFixed(2)}`
                    ) : (
                      <span className="text-amber-700">Not set</span>
                    )}
                  </td>

                  {/* Margin */}
                  <td className="py-3.5 pr-4">
                    {hasCost &&
                    product.marginPercent !== null &&
                    product.marginPercent !== undefined &&
                    product.profitPerUnit !== null &&
                    product.profitPerUnit !== undefined ? (
                      product.profitPerUnit < 0 ? (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-800 border border-amber-200">
                          Below cost (-${Math.abs(product.profitPerUnit).toFixed(2)})
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-medium text-emerald-800">
                            {product.marginPercent.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block tabular-nums">
                            +${product.profitPerUnit.toFixed(2)} / unit
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Stock Level */}
                  <td className="py-3.5 pr-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                        product.stockQty > 4
                          ? "bg-slate-100 text-slate-700"
                          : product.stockQty > 0
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200",
                      )}
                    >
                      {product.stockQty > 0 ? `${product.stockQty} in stock` : "Out of stock"}
                    </span>
                  </td>

                  {/* Quick Inline Stepper & Restock Button */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5">
                        <button
                          type="button"
                          disabled={product.stockQty <= 0 || isUpdatingThis}
                          onClick={() => handleInlineStockChange(product, -1)}
                          className="grid size-6 place-items-center text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30"
                          title="Decrease 1"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium tabular-nums text-slate-900">
                          {isUpdatingThis ? (
                            <Loader2 className="size-3 animate-spin mx-auto text-slate-500" />
                          ) : (
                            product.stockQty
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdatingThis}
                          onClick={() => handleInlineStockChange(product, 1)}
                          className="grid size-6 place-items-center text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30"
                          title="Increase 1"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openRestockModal(product)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 transition"
                      >
                        + Restock
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/seller-dashboard/products/new?edit=${targetUuid}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
                    >
                      <Edit className="size-3 text-slate-400" /> Edit
                    </Link>
                  </td>
                </tr>
              )
            })}

            {visibleProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                  No products match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── QUICK RESTOCK MODAL ── */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Adjust Inventory</h3>
                <p className="text-xs text-slate-500">{restockProduct.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setRestockMode("ADD")}
                  className={cn(
                    "rounded-md py-1.5 font-medium transition",
                    restockMode === "ADD" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600",
                  )}
                >
                  Add Units
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRestockMode("SET")
                    setRestockAmount(restockProduct.stockQty)
                  }}
                  className={cn(
                    "rounded-md py-1.5 font-medium transition",
                    restockMode === "SET" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600",
                  )}
                >
                  Set Quantity
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-medium">
                  {restockMode === "ADD" ? "Units to add:" : "New total quantity:"}
                </span>

                <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 w-32">
                  <button
                    type="button"
                    onClick={() => setRestockAmount(Math.max(0, restockAmount - 1))}
                    className="grid size-7 place-items-center text-slate-500 hover:bg-slate-100 rounded"
                  >
                    <Minus className="size-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center text-xs font-medium tabular-nums outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRestockAmount(restockAmount + 1)}
                    className="grid size-7 place-items-center text-slate-500 hover:bg-slate-100 rounded"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 text-slate-500">
                <span>Quick:</span>
                {[5, 10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRestockAmount(amt)}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    {restockMode === "ADD" ? `+${amt}` : amt}
                  </button>
                ))}
              </div>

              {/* Calculation Preview */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-slate-600 flex justify-between">
                <span>Resulting total:</span>
                <strong className="text-slate-900 font-medium">
                  {restockMode === "ADD" ? restockProduct.stockQty + restockAmount : restockAmount}{" "}
                  units
                </strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRestockProduct(null)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingRestock}
                onClick={handleSaveRestock}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8"
              >
                {isSavingRestock ? "Saving..." : "Save inventory"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
