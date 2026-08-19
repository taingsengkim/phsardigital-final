"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronDown, Filter, Heart, Link2, MapPin, Star } from "lucide-react"

const products = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  image: `/picture/pic${(index % 8) + 1}.jpg`,
  title: "Fleet - Travel shopping UI design kit",
  price: index === 2 ? "$84" : "$64",
  oldPrice: index === 2 ? "$96" : undefined,
}))

export function Shop() {
  const [visibleCount, setVisibleCount] = React.useState(9)

  return (
    <section className="min-h-[calc(100vh-72px)] bg-background px-4 py-5 text-foreground sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="flex flex-col gap-5 border-b border-border px-5 py-5 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative shrink-0">
              <Image src="/picture/lisa.PNG" alt="Chelsie Haley" width={82} height={82} className="size-[74px] rounded-full object-cover ring-2 ring-background" />
              <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full border-2 border-card bg-[#2f80ed] text-[11px] font-bold text-white">+</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[26px] font-bold leading-tight tracking-[-0.4px]">Chelsie Haley</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">Dream big. Think different. Do great!</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:hidden"><MapPin className="size-3" /> Phnom Penh</p>
            </div>
          </div>

        </header>

        <div className="px-5 pb-8 pt-5">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="ml-auto flex items-center gap-2">
              <button type="button" className="flex h-9 items-center gap-3 rounded-lg border border-border px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted">Most recent <ChevronDown className="size-3.5" /></button>
              <button type="button" aria-label="Filter products" className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"><Filter className="size-4" /></button>
            </div>
          </div>

          <>
              <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
                {products.slice(0, visibleCount).map((product) => (
                  <article key={product.id} className="group min-w-0">
                    <div className="relative aspect-[1.48/1] overflow-hidden rounded-xl bg-muted">
                      <Image src={product.image} alt={product.title} fill sizes="(min-width: 1280px) 28vw, (min-width: 640px) 42vw, 90vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <button type="button" aria-label="Copy product link" className="grid size-10 place-items-center rounded-full bg-white text-gray-700 shadow"><Link2 className="size-4" /></button>
                        <button type="button" aria-label="Save product" className="grid size-10 place-items-center rounded-full bg-white text-gray-700 shadow"><Heart className="size-4" /></button>
                        <button type="button" aria-label="Open product" className="grid size-10 place-items-center rounded-full bg-white text-gray-700 shadow"><ChevronDown className="size-4 -rotate-90" /></button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <h2 className="min-w-0 flex-1 text-[12px] font-semibold leading-[1.45]">{product.title}</h2>
                      <div className="shrink-0 text-right">
                        <span className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">{product.price}</span>
                        {product.oldPrice && <p className="mt-2 text-[10px] font-semibold text-muted-foreground line-through">{product.oldPrice}</p>}
                      </div>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"><Star className="size-4 fill-current" /> 4.8 <span className="font-normal">(87)</span></p>
                  </article>
                ))}
              </div>

              {visibleCount < products.length && <div className="mt-9 flex justify-center"><button type="button" onClick={() => setVisibleCount(products.length)} className="h-10 rounded-lg border border-border bg-card px-5 text-[11px] font-semibold shadow-sm hover:bg-muted">Load more</button></div>}
          </>
        </div>
      </div>
    </section>
  )
}
