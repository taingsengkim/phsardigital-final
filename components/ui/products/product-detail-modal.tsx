"use client"

import Image from "next/image"
import { Loader2, Package, X } from "lucide-react"
import { useGetSellerListingQuery } from "@/lib/redux/service/sellerProductApi"
import { getFileUrl } from "@/lib/utils"

import { formatAttributeKey, formatAttributeValue } from "@/lib/attribute-formatter"

export function ProductDetailModal({ uuid, onClose }: { uuid: string | null; onClose: () => void }) {
  const { data: product, isLoading, isError } = useGetSellerListingQuery(uuid ?? "", { skip: !uuid })
  if (!uuid) return null

  const image = product?.thumbnailUri?.uri || product?.images?.[0]?.uri || ""

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="product-detail-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-[0_28px_90px_rgba(15,23,42,.35)] dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Product details</p><h2 id="product-detail-title" className="mt-0.5 text-xl font-bold">{product?.title || "Product"}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close product details" className="grid size-10 place-items-center rounded-full border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><X className="size-5" /></button>
        </div>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="size-5 animate-spin" />Loading product...</div>
        ) : isError || !product ? (
          <div className="flex min-h-80 items-center justify-center text-sm text-red-600">Could not load this product.</div>
        ) : (
          <div className="grid gap-7 p-6 md:grid-cols-[260px_minmax(0,1fr)]">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              {image ? <Image src={getFileUrl(image)} alt={product.title || "Product"} fill className="object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><Package className="size-16" /></div>}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{product.category?.name || "Uncategorized"}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{product.status === "ARCHIVED" ? "Inactive" : product.status || "Unknown"}</span></div>
              <h3 className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white">{product.title || "Untitled product"}</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">{product.description || "No description provided."}</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Detail label="Full price" value={`$${Number(product.fullPrice ?? product.price ?? 0).toFixed(2)}`} />
                <Detail label="Discount" value={product.discountPrice == null ? "—" : `$${Number(product.discountPrice).toFixed(2)}`} accent />
                <Detail label="Stock" value={String(product.stockQty ?? 0)} />
              </div>
            </div>
            {(product.listingAttributes ?? []).length > 0 && (
              <div className="md:col-span-2">
                <h3 className="mb-3 font-bold">Product attributes</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">{(product.listingAttributes ?? []).map((attribute, index) => <div key={attribute.uuid ?? `${attribute.key}-${index}`} className="grid grid-cols-[1fr_2fr] gap-4 border-b border-slate-100 px-4 py-3 text-sm last:border-0 dark:border-slate-800"><span className="font-semibold">{formatAttributeKey(attribute.key)}</span><span className="text-slate-600 dark:text-slate-300">{formatAttributeValue(attribute.value)}</span></div>)}</div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function Detail({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[11px] font-medium text-slate-500">{label}</p><p className={`mt-1 text-base font-extrabold ${accent ? "text-emerald-600" : "text-slate-950 dark:text-white"}`}>{value}</p></div>
}
