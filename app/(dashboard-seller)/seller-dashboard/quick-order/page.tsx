"use client"

import * as React from "react"
import Image from "next/image"
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useGetMyListingsQuery } from "@/lib/api/sellerApi"

type ApiProduct = Record<string, unknown> & {
  uuid?: string
  id?: string
  title?: string
  fullPrice?: number
  discountPrice?: number | null
  price?: number
  stockQty?: number
  stock?: number
  status?: string
  category?: { name?: string }
  thumbnailUri?: string | { uri?: string }
  images?: Array<{ uri?: string; url?: string; isPrimary?: boolean; is_primary?: boolean }>
}

type PosProduct = { id: string; name: string; price: number; category: string; image: string; stockQty: number }

function responseItems(value: unknown): ApiProduct[] {
  if (Array.isArray(value)) return value as ApiProduct[]
  const response = value as { content?: unknown; data?: unknown } | undefined
  const items = Array.isArray(response?.content) ? response.content : Array.isArray(response?.data) ? response.data : []
  return items as ApiProduct[]
}

export default function QuickOrderPage() {
  const { data, isLoading, isError, refetch } = useGetMyListingsQuery({ pageNumber: 0, pageSize: 100 })
  const [category, setCategory] = React.useState("All")
  const [quantities, setQuantities] = React.useState<Record<string, number>>({})

  const products = React.useMemo<PosProduct[]>(() => responseItems(data)
    .filter((item) => (item.status ?? "ACTIVE").toUpperCase() === "ACTIVE")
    .map((item, index) => {
      const primary = item.images?.find((image) => image.isPrimary || image.is_primary) ?? item.images?.[0]
      const image = typeof item.thumbnailUri === "string" ? item.thumbnailUri : item.thumbnailUri?.uri ?? primary?.uri ?? primary?.url
      return {
        id: item.uuid ?? item.id ?? String(index),
        name: item.title ?? "Untitled product",
        price: Number(item.discountPrice ?? item.fullPrice ?? item.price ?? 0),
        category: item.category?.name ?? "Other",
        image: image || "/picture/pic1.jpg",
        stockQty: Number(item.stockQty ?? item.stock ?? 0),
      }
    }), [data])
  const categories = React.useMemo(() => ["All", ...new Set(products.map((product) => product.category))], [products])

  const visibleProducts = category === "All" ? products : products.filter((product) => product.category === category)
  const orderItems = products.filter((product) => (quantities[product.id] ?? 0) > 0)
  const subtotal = orderItems.reduce((sum, product) => sum + product.price * quantities[product.id], 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  function changeQuantity(id: string, amount: number) {
    const stockQty = products.find((product) => product.id === id)?.stockQty ?? 0
    setQuantities((current) => ({
      ...current,
      [id]: Math.min(stockQty, Math.max(0, (current[id] ?? 0) + amount)),
    }))
  }

  return (
    <main className="min-h-[calc(100svh-70px)] bg-[#f7f7f8] p-4 sm:p-7">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Quick Order</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select products and complete a point-of-sale order.</p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl bg-white p-3 shadow-sm">
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`h-10 shrink-0 rounded-full px-5 text-sm font-semibold transition ${category === item ? "bg-[#6C4CD8] text-white" : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"}`}>
                  {item}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin" /> Loading your products...</div>
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground"><p>Could not load your products.</p><button type="button" onClick={() => refetch()} className="rounded-lg bg-[#6C4CD8] px-4 py-2 text-sm font-semibold text-white">Try again</button></div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed bg-white text-sm text-muted-foreground">No active products available for quick order.</div>
            ) : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0
                return (
                  <article key={product.id} className="overflow-hidden rounded-2xl border bg-white p-3 shadow-sm">
                    <div className="relative aspect-[1.5/1] overflow-hidden rounded-xl bg-muted">
                      <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    </div>
                    <div className="pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="truncate text-sm font-semibold">{product.name}</h2>
                        <span className="shrink-0 font-bold text-[#6C4CD8]">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{product.stockQty} in stock</p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex h-10 items-center rounded-full border">
                          <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label={`Decrease ${product.name}`} className="grid size-9 place-items-center rounded-full hover:bg-violet-50"><Minus className="size-4" /></button>
                          <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                          <button type="button" disabled={quantity >= product.stockQty} onClick={() => changeQuantity(product.id, 1)} aria-label={`Increase ${product.name}`} className="grid size-9 place-items-center rounded-full hover:bg-violet-50 disabled:opacity-40"><Plus className="size-4" /></button>
                        </div>
                        <button type="button" disabled={product.stockQty === 0 || quantity >= product.stockQty} onClick={() => changeQuantity(product.id, 1)} className="h-10 flex-1 rounded-full bg-[#6C4CD8] text-sm font-semibold text-white hover:bg-[#5d3fc4] disabled:cursor-not-allowed disabled:opacity-50">{product.stockQty === 0 ? "Out of stock" : "Add item"}</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>}
          </section>

          <aside className="rounded-2xl border bg-white p-5 shadow-sm xl:sticky xl:top-20">
            <div className="flex items-center gap-3 border-b pb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><ShoppingCart className="size-5" /></span>
              <div><h2 className="font-bold">Current order</h2><p className="text-xs text-muted-foreground">{orderItems.length} product(s)</p></div>
            </div>

            <div className="my-4 space-y-3">
              {orderItems.length === 0 ? (
                <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">Add products to begin the order.</p>
              ) : orderItems.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{quantities[product.id]}×</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
                  <span className="text-sm font-semibold">${(product.price * quantities[product.id]).toFixed(2)}</span>
                  <button type="button" onClick={() => setQuantities((current) => ({ ...current, [product.id]: 0 }))} aria-label={`Remove ${product.name}`} className="text-red-500"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-y py-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <div className="flex items-center justify-between py-5"><span className="font-bold">Total</span><span className="text-2xl font-bold">${total.toFixed(2)}</span></div>
            <button type="button" disabled={!orderItems.length} className="h-12 w-full rounded-xl bg-[#6C4CD8] font-semibold text-white hover:bg-[#5d3fc4] disabled:cursor-not-allowed disabled:opacity-50">Complete order</button>
          </aside>
        </div>
      </div>
    </main>
  )
}
