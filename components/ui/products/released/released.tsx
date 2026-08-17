"use client"

import * as React from "react"
import { Check, CheckCircle2, Grid2X2, List, Search, Star, Trash2, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

type ReleasedProduct = {
  id: number
  views: string
  bar: string
  rating: string | null
  art: string
}

const initialProducts: ReleasedProduct[] = [
  { id: 1, views: "48k", bar: "bg-[#2f80ed]", rating: "4.8 (87)", art: "from-[#f6c9df] via-[#faf0f2] to-[#99959c]" },
  { id: 2, views: "40k", bar: "bg-[#ff7165]", rating: "4.8 (87)", art: "from-[#83d7ff] via-[#ffd2dd] to-[#a880d8]" },
  { id: 3, views: "32k", bar: "bg-[#8754f6]", rating: null, art: "from-[#ffc36d] via-[#ed805c] to-[#efe0d8]" },
  { id: 4, views: "24k", bar: "bg-[#ff7165]", rating: "4.8 (87)", art: "from-[#8ed9db] via-[#d8cfcc] to-[#e5a999]" },
  { id: 5, views: "16k", bar: "bg-[#2f80ed]", rating: "4.8 (87)", art: "from-[#57536c] via-[#817cbb] to-[#eabdc5]" },
]

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange} className={cn("grid size-[22px] shrink-0 place-items-center rounded-[5px] border", checked ? "border-[#2f80ed] bg-[#2f80ed] text-white" : "border-[#c7ccd1] bg-white")}>
      {checked && <Check className="size-[15px]" strokeWidth={3} />}
    </button>
  )
}

function Artwork({ art, index }: { art: string; index: number }) {
  return (
    <div className={cn("relative size-[76px] shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-br", art)} aria-hidden="true">
      <span className="absolute -bottom-3 left-2 h-10 w-16 -rotate-12 rounded-full bg-white/60" />
      <span className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[30%] bg-white/40 shadow-lg" />
      <span className={cn("absolute h-12 w-3 rounded-full bg-white/70", index % 2 ? "right-4 top-3 rotate-[18deg]" : "left-5 top-2 -rotate-[22deg]")} />
    </div>
  )
}

export function Released() {
  const [products, setProducts] = React.useState(initialProducts)
  const [selected, setSelected] = React.useState<Set<number>>(new Set([3, 4]))
  const [query, setQuery] = React.useState("")
  const [view, setView] = React.useState<"list" | "grid">("list")
  const visible = products.filter(() => "bento matte 3d illustration ui design kit".includes(query.toLowerCase()))
  const allSelected = visible.length > 0 && visible.every((item) => selected.has(item.id))

  function toggle(id: number) {
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
      if (allSelected) visible.forEach((item) => next.delete(item.id))
      else visible.forEach((item) => next.add(item.id))
      return next
    })
  }

  function deleteSelected() {
    setProducts((current) => current.filter((item) => !selected.has(item.id)))
    setSelected(new Set())
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-col bg-[#f7f7f8] px-[28px] py-[28px] text-[#27282b] sm:px-[38px]">
      <h1 className="mb-[22px] text-[32px] font-bold leading-none tracking-[-0.8px]">Released</h1>

      <div className="flex-1 rounded-[10px] bg-white px-[18px] pb-[18px] pt-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-[17px] pb-[25px]">
          <span className="h-[31px] w-[14px] rounded-[5px] bg-[#c9b7ff]" />
          <h2 className="text-[17px] font-semibold">Products</h2>
          <label className="relative w-full max-w-[345px] sm:ml-[6px]">
            <Search className="absolute left-[13px] top-1/2 size-[18px] -translate-y-1/2 text-[#75808c]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search product" className="h-[39px] w-full rounded-[10px] border-0 bg-[#f4f4f5] pl-[40px] pr-[14px] text-[13px] outline-none placeholder:text-[#8a929d] focus:ring-2 focus:ring-[#8068e8]/25" />
          </label>
          <div className="ml-auto flex gap-[10px]">
            <button type="button" onClick={() => setView("list")} aria-label="List view" className={cn("grid size-[40px] place-items-center rounded-[9px] text-[#737b84]", view === "list" && "bg-[#f4f4f5] shadow-sm")}><List className="size-[20px]" /></button>
            <button type="button" onClick={() => setView("grid")} aria-label="Grid view" className={cn("grid size-[40px] place-items-center rounded-[9px] text-[#737b84]", view === "grid" && "bg-[#f4f4f5] shadow-sm")}><Grid2X2 className="size-[18px]" /></button>
          </div>
        </div>

        {view === "list" ? (
          <div className="min-w-[760px] overflow-hidden">
            <div className="grid grid-cols-[38px_minmax(250px,1fr)_80px_90px_145px_125px_120px] items-center border-b border-[#eceef0] pb-[14px] text-[11px] font-medium text-[#777f89]">
              <Checkbox checked={allSelected} onChange={toggleAll} label="Select all products" /><span>Product</span><span>Price</span><span>Status</span><span>Rating</span><span>Sales</span><span>Views</span>
            </div>
            {visible.map((product, index) => (
              <div key={product.id} className="grid min-h-[116px] grid-cols-[38px_minmax(250px,1fr)_80px_90px_145px_125px_120px] items-center border-b border-[#eceef0] py-[12px] last:border-0">
                <Checkbox checked={selected.has(product.id)} onChange={() => toggle(product.id)} label="Select Bento Matte 3D Illustration" />
                <div className="flex min-w-0 items-center gap-[18px]"><Artwork art={product.art} index={index} /><div><p className="max-w-[135px] text-[13px] font-semibold leading-[18px]">Bento Matte 3D Illustration</p><p className="mt-[3px] text-[11px] text-[#858c95]">UI design kit</p></div></div>
                <span className="text-[12px] font-semibold">$98</span>
                <span><span className="rounded-[4px] bg-[#ddf6d8] px-[7px] py-[4px] text-[12px] text-[#65b75c]">Active</span></span>
                <span className="flex items-center gap-[7px] text-[11px] text-[#68717b]"><Star className={cn("size-[19px]", product.rating ? "fill-[#737c88] text-[#737c88]" : "text-[#737c88]")} />{product.rating ?? "No ratings"}</span>
                <span className="flex items-center gap-[6px] text-[11px]"><b className="rounded-[5px] bg-[#f0f0f0] px-[7px] py-[4px] text-[12px]">$3,200</b><TrendingUp className="size-[15px] text-[#72c96a]" /><span className="font-semibold text-[#72c96a]">55.8%</span></span>
                <span className="flex items-center gap-[10px] text-[12px] font-semibold"><b className="rounded-[5px] bg-[#f0f0f0] px-[7px] py-[4px]">{product.views}</b><span className={cn("h-[9px] rounded-[2px]", product.bar, index === 0 ? "w-[42px]" : index === 1 ? "w-[12px]" : index === 2 ? "w-[23px]" : index === 3 ? "w-[42px]" : "w-[23px]")} /></span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[16px] py-[10px] sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product, index) => <article key={product.id} className="relative flex items-center gap-[15px] rounded-[10px] border border-[#eceef0] p-[14px]"><div className="absolute right-[10px] top-[10px]"><Checkbox checked={selected.has(product.id)} onChange={() => toggle(product.id)} label="Select product" /></div><Artwork art={product.art} index={index} /><div><p className="max-w-[130px] text-[13px] font-semibold">Bento Matte 3D Illustration</p><p className="mt-[4px] text-[11px] text-[#65b75c]">Active · {product.views} views</p></div></article>)}
          </div>
        )}
        {visible.length === 0 && <p className="py-[70px] text-center text-[13px] text-[#858c95]">No released products found.</p>}
      </div>

      <div className="sticky bottom-0 -mx-[28px] -mb-[28px] mt-[32px] flex min-h-[82px] items-center border-t border-[#eceef0] bg-white px-[28px] sm:-mx-[38px] sm:px-[38px]">
        <div className="flex items-center gap-[12px] text-[12px] text-[#69727c]"><CheckCircle2 className="size-[18px]" /> {selected.size} products selected</div>
        <div className="ml-auto flex gap-[10px]"><button type="button" onClick={deleteSelected} disabled={!selected.size} className="flex h-[45px] items-center gap-[9px] rounded-[9px] border border-[#e4e5e7] px-[17px] text-[12px] font-semibold text-[#f06455] shadow-sm disabled:opacity-40">Deleted <Trash2 className="size-[17px] text-[#757d87]" /></button><button type="button" disabled={!selected.size} className="h-[45px] rounded-[9px] bg-[#8068e8] px-[20px] text-[12px] font-semibold text-white hover:bg-[#7057df] disabled:opacity-40">Unpublish</button></div>
      </div>
    </section>
  )
}
