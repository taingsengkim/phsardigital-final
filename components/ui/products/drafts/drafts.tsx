"use client"

import * as React from "react"
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Grid2X2,
  List,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { readSellerDrafts, writeSellerDrafts } from "@/lib/seller-drafts"

type DraftProduct = {
  id: string
  title: string
  url: string
  price: string
  editedAt: string
  art: string
}

const draftArt = [
  "from-[#86d8ff] via-[#ffd0d8] to-[#ad87db]",
  "from-[#ffb55c] via-[#ef835d] to-[#f1ded3]",
  "from-[#8ed9dc] via-[#dfd2c9] to-[#edae9c]",
]

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "grid size-[22px] shrink-0 place-items-center rounded-[5px] border transition-colors",
        checked ? "border-[#2f80ed] bg-[#2f80ed] text-white" : "border-[#c7ccd1] bg-white hover:border-[#8f99a3]",
      )}
    >
      {checked && <Check className="size-[15px]" strokeWidth={3} />}
    </button>
  )
}

function ProductArtwork({ art, index }: { art: string; index: number }) {
  return (
    <div className={cn("relative size-[76px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-br", art)} aria-hidden="true">
      <span className="absolute -bottom-3 left-3 h-10 w-16 rotate-[-13deg] rounded-full bg-white/55 blur-[1px]" />
      <span className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[30%] bg-white/40 shadow-lg" />
      <span className={cn("absolute h-12 w-3 rounded-full bg-white/70", index % 2 ? "right-4 top-3 rotate-[18deg]" : "left-5 top-2 rotate-[-22deg]")} />
    </div>
  )
}

export function Drafts({ variant = "drafts" }: { variant?: "drafts" | "schedualed" }) {
  const isScheduled = variant === "schedualed"
  const [products, setProducts] = React.useState<DraftProduct[]>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [query, setQuery] = React.useState("")
  const [view, setView] = React.useState<"list" | "grid">("list")

  React.useEffect(() => {
    if (isScheduled) return
    setProducts(readSellerDrafts().map((draft, index) => ({
      id: draft.id,
      title: draft.title,
      url: draft.imageNames.length ? draft.imageNames.join(", ") : "No images added",
      price: draft.price ? `$${draft.price}` : "$0.00",
      editedAt: new Date(draft.updatedAt).toLocaleString(),
      art: draftArt[index % draftArt.length],
    })))
  }, [isScheduled])

  const visibleProducts = products.filter((product) =>
    `${product.title} ${product.url}`.toLowerCase().includes(query.toLowerCase()),
  )
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selected.has(product.id))

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visibleProducts.forEach((product) => next.delete(product.id))
      else visibleProducts.forEach((product) => next.add(product.id))
      return next
    })
  }

  function deleteSelected() {
    setProducts((current) => current.filter((product) => !selected.has(product.id)))
    writeSellerDrafts(readSellerDrafts().filter((draft) => !selected.has(draft.id)))
    setSelected(new Set())
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-col bg-[#f7f7f8] px-[28px] py-[24px] text-[#27282b] sm:px-[38px] sm:py-[34px]">
      <h1 className="mb-[22px] text-[32px] font-bold leading-none tracking-[-0.8px]">{isScheduled ? "Scheduled" : "Drafts"}</h1>

      <div className="flex-1 rounded-[10px] bg-white px-[12px] pb-[20px] pt-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:px-[20px]">
        <div className="flex flex-wrap items-center gap-[16px] px-[2px] pb-[25px]">
          <div className="flex items-center gap-[14px]">
            <span className="h-[31px] w-[14px] rounded-[5px] bg-[#c9b7ff]" />
            <h2 className="text-[17px] font-semibold">Products</h2>
          </div>

          <label className="relative ml-0 w-full max-w-[345px] sm:ml-[8px]">
            <Search className="absolute left-[13px] top-1/2 size-[18px] -translate-y-1/2 text-[#75808c]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product"
              className="h-[39px] w-full rounded-[10px] border-0 bg-[#f4f4f5] pl-[40px] pr-[14px] text-[13px] outline-none placeholder:text-[#8a929d] focus:ring-2 focus:ring-[#8068e8]/25"
            />
          </label>

          <div className="ml-auto flex items-center gap-[10px]">
            <button type="button" onClick={() => setView("list")} aria-label="List view" className={cn("grid size-[40px] place-items-center rounded-[9px] text-[#737b84]", view === "list" && "bg-[#f4f4f5] shadow-sm")}><List className="size-[20px]" /></button>
            <button type="button" onClick={() => setView("grid")} aria-label="Grid view" className={cn("grid size-[40px] place-items-center rounded-[9px] text-[#737b84]", view === "grid" && "bg-[#f4f4f5] shadow-sm")}><Grid2X2 className="size-[18px]" /></button>
          </div>
        </div>

        <div className="flex items-center border-b border-[#eceef0] px-[2px] pb-[14px] text-[11px] font-medium text-[#777f89]">
          <Checkbox checked={allVisibleSelected} onChange={toggleAll} label="Select all products" />
          <span className="ml-[32px] flex-1">Product</span>
          <span className="hidden w-[88px] md:block">Price</span>
          <span className="hidden w-[244px] md:block">{isScheduled ? "Scheduled for" : "Last edited"}</span>
          <span className="w-[112px]" />
        </div>

        {view === "list" ? (
          <div>
            {visibleProducts.map((product, index) => {
              const isSelected = selected.has(product.id)
              return (
                <div key={product.id} className={cn("group flex min-h-[116px] items-center border-b border-[#eceef0] px-[2px] py-[12px] transition-colors", index === 0 && "my-[10px] rounded-[9px] border-b-0 bg-[#f5f5f6] px-[10px]")}>
                  <Checkbox checked={isSelected} onChange={() => toggle(product.id)} label={`Select ${product.title}`} />
                  <div className="ml-[32px] flex min-w-0 flex-1 items-center gap-[18px]">
                    <ProductArtwork art={product.art} index={index} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#25272a]">{product.title}</p>
                      <p className="mt-[2px] truncate text-[11px] text-[#858c95]">{product.url}</p>
                    </div>
                  </div>
                  <div className="hidden w-[88px] md:block"><span className={cn("rounded-[6px] px-[9px] py-[7px] text-[12px] font-semibold", product.price === "$0.0" ? "bg-[#f0f0f0]" : "bg-[#b9ead2]")}>{product.price}</span></div>
                  <p className="hidden w-[244px] text-[11px] text-[#66707a] md:block">{product.editedAt}</p>
                  <div className="flex w-[112px] justify-end gap-[7px] opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <button type="button" aria-label="Schedule product" className="grid size-[34px] place-items-center rounded-full bg-white text-[#75808a] shadow-sm"><CalendarDays className="size-[17px]" /></button>
                    <button type="button" aria-label="Edit product" className="grid size-[34px] place-items-center rounded-full bg-white text-[#75808a] shadow-sm"><Pencil className="size-[16px]" /></button>
                    <button type="button" onClick={() => { setProducts((items) => items.filter((item) => item.id !== product.id)); writeSellerDrafts(readSellerDrafts().filter((draft) => draft.id !== product.id)); setSelected((items) => { const next = new Set(items); next.delete(product.id); return next }) }} aria-label="Delete product" className="grid size-[34px] place-items-center rounded-full bg-white text-[#75808a] shadow-sm"><Trash2 className="size-[16px]" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[16px] py-[18px] sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, index) => (
              <article key={product.id} className="relative flex items-center gap-[15px] rounded-[10px] border border-[#eceef0] p-[14px]">
                <div className="absolute right-[10px] top-[10px]"><Checkbox checked={selected.has(product.id)} onChange={() => toggle(product.id)} label={`Select ${product.title}`} /></div>
                <ProductArtwork art={product.art} index={index} />
                <div><p className="text-[13px] font-semibold">{product.title}</p><p className="mt-[3px] text-[11px] text-[#858c95]">{product.price}</p></div>
              </article>
            ))}
          </div>
        )}

        {visibleProducts.length === 0 && <p className="py-[60px] text-center text-[13px] text-[#858c95]">No draft products found.</p>}

        <div className="flex justify-center pt-[22px]">
          <button type="button" className="flex h-[38px] items-center gap-[9px] rounded-[8px] border border-[#e1e3e6] bg-white px-[16px] text-[11px] font-semibold shadow-sm hover:bg-[#fafafa]">
            <LoaderCircle className="size-[17px]" /> Load more
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-[28px] -mb-[24px] mt-[32px] flex min-h-[82px] items-center border-t border-[#eceef0] bg-white px-[28px] sm:-mx-[38px] sm:-mb-[34px] sm:px-[38px]">
        <div className="flex items-center gap-[12px] text-[12px] text-[#69727c]"><CheckCircle2 className="size-[18px]" /> {selected.size} products selected</div>
        <div className="ml-auto flex items-center gap-[10px]">
          {isScheduled ? (
            <button type="button" disabled={selected.size === 0} className="flex h-[45px] items-center gap-[9px] rounded-[9px] border border-[#e4e5e7] px-[17px] text-[12px] font-semibold shadow-sm disabled:opacity-40"><CalendarDays className="size-[17px] text-[#757d87]" /> Reschedule</button>
          ) : (
            <button type="button" onClick={deleteSelected} disabled={selected.size === 0} className="flex h-[45px] items-center gap-[9px] rounded-[9px] border border-[#e4e5e7] px-[17px] text-[12px] font-semibold text-[#f06455] shadow-sm disabled:opacity-40">Deleted <Trash2 className="size-[17px] text-[#757d87]" /></button>
          )}
          <button type="button" disabled={selected.size === 0} className="h-[45px] rounded-[9px] bg-[#8068e8] px-[23px] text-[12px] font-semibold text-white shadow-sm hover:bg-[#7057df] disabled:opacity-40">{isScheduled ? "Publish now" : "Publish"}</button>
        </div>
      </div>
    </section>
  )
}
