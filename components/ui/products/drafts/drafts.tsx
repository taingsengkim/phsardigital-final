"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Check,
  MoreHorizontal,
  Eye,
  Power,
  Pencil,
  Trash2,
} from "lucide-react"

import { cn, getFileUrl } from "@/lib/utils"
import { useGetMyListingsQuery, useUpdateListingStatusMutation } from "@/lib/api/sellerApi"
import { readSellerDrafts, writeSellerDrafts } from "@/lib/seller-drafts"
import { ProductTableToolbar } from "@/components/ui/products/product-table-toolbar"
import { ProductTablePagination } from "@/components/ui/products/product-table-pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type DraftProduct = {
  id: string
  title: string
  url: string
  price: string
  editedAt: string
  createdAt: string
  art: string
  image?: string
}

const draftArt = [
  "from-[#86d8ff] via-[#ffd0d8] to-[#ad87db]",
  "from-[#ffb55c] via-[#ef835d] to-[#f1ded3]",
  "from-[#8ed9dc] via-[#dfd2c9] to-[#edae9c]",
]

function draftImage(item: Record<string, unknown>): string | undefined {
  const images = Array.isArray(item.images) ? item.images as Array<Record<string, unknown>> : []
  const primary = images.find((image) => image.isPrimary || image.is_primary) ?? images[0]
  const thumbnail = item.thumbnailUri
  if (typeof thumbnail === "string") return getFileUrl(thumbnail)
  const thumbnailUri = thumbnail && typeof thumbnail === "object" ? (thumbnail as Record<string, unknown>).uri : undefined
  const objectName = typeof item.thumbnailObjectName === "string"
    ? item.thumbnailObjectName
    : Array.isArray(item.imageNames) && typeof item.imageNames[0] === "string"
      ? item.imageNames[0]
      : undefined
  return getFileUrl(String(thumbnailUri ?? primary?.uri ?? primary?.url ?? objectName ?? "")) || undefined
}

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

function ProductArtwork({ art, index, image, title }: { art: string; index: number; image?: string; title: string }) {
  if (image) return <div className="relative size-[76px] shrink-0 overflow-hidden rounded-[8px] bg-muted"><Image src={image} alt={title} fill sizes="76px" unoptimized={image.startsWith("http")} className="object-cover" /></div>
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
  const { data: serverDraftData } = useGetMyListingsQuery({ status: "DRAFT", pageNumber: 0, pageSize: 100 }, { skip: isScheduled })
  const [updateListingStatus] = useUpdateListingStatusMutation()
  const [products, setProducts] = React.useState<DraftProduct[]>(() => isScheduled ? [] : readSellerDrafts().map((draft, index) => ({
    id: draft.id,
    title: draft.title,
    url: draft.imageNames.length ? draft.imageNames.join(", ") : "No images added",
    price: draft.price ? `$${draft.price}` : "$0.00",
    editedAt: new Date(draft.updatedAt).toLocaleString(),
    createdAt: draft.updatedAt,
    art: draftArt[index % draftArt.length],
  })))
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [query, setQuery] = React.useState("")
  const [createdDate, setCreatedDate] = React.useState("")
  const [visibleColumns, setVisibleColumns] = React.useState(() => new Set(["product", "price", "status", "edited", "view", "actions"]))
  const [page, setPage] = React.useState(0)

  const serverItems = React.useMemo(() => {
    const response = serverDraftData as Array<Record<string, unknown>> | { content?: Array<Record<string, unknown>>; data?: Array<Record<string, unknown>> } | undefined
    const items = Array.isArray(response) ? response : response?.content ?? response?.data ?? []
    return items.map((item, index): DraftProduct => ({
      id: String(item.uuid ?? item.id ?? index),
      title: String(item.title ?? "Untitled product"),
      url: String(item.description ?? "Server draft"),
      price: `$${Number(item.price ?? 0).toFixed(2)}`,
      editedAt: item.lastModifiedAt || item.updatedAt || item.createdAt ? new Date(String(item.lastModifiedAt ?? item.updatedAt ?? item.createdAt)).toLocaleString() : "Recently edited",
      createdAt: String(item.createdAt ?? item.updatedAt ?? item.lastModifiedAt ?? ""),
      art: draftArt[index % draftArt.length],
      image: draftImage(item),
    }))
  }, [serverDraftData])
  const allProducts = [...products, ...serverItems.filter((server) => !products.some((local) => local.id === server.id))]
  const serverIds = new Set(serverItems.map((item) => item.id))
  const filteredProducts = allProducts.filter((product) =>
    (!createdDate || product.createdAt.slice(0, 10) === createdDate) &&
    `${product.title} ${product.url}`.toLowerCase().includes(query.toLowerCase()),
  )
  const totalPages = Math.ceil(filteredProducts.length / 10)
  const visibleProducts = filteredProducts.slice(page * 10, page * 10 + 10)
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selected.has(product.id))
  const toggleColumn = (key: string) => setVisibleColumns((old) => { const next = new Set(old); if (next.has(key)) next.delete(key); else next.add(key); return next })

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

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-1 flex-col bg-[#f7f7f8] px-7 py-7 text-[#27282b] sm:px-10">
      <h1 className="mb-6 text-[32px] font-bold tracking-tight">{isScheduled ? "Scheduled" : "Drafts"}</h1>

      <div className="rounded-xl bg-white p-5">
        <ProductTableToolbar query={query} onQueryChange={(value) => { setQuery(value); setPage(0) }} createdDate={createdDate} onCreatedDateChange={(value) => { setCreatedDate(value); setPage(0) }} columns={[{ key: "product", label: "Product" }, { key: "price", label: "Price" }, { key: "status", label: "Status" }, { key: "edited", label: isScheduled ? "Scheduled for" : "Last edited" }, { key: "view", label: "View" }, { key: "actions", label: "Actions" }]} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} />

        <Table className="table-fixed">
          <colgroup><col className="w-[5%]" /><col className="w-[42%]" /><col className="w-[12%]" /><col className="w-[12%]" /><col className="w-[15%]" /><col className="w-[7%]" /><col className="w-[7%]" /></colgroup>
          <TableHeader><TableRow className="h-14 hover:bg-transparent"><TableHead className="px-6"><Checkbox checked={allVisibleSelected} onChange={toggleAll} label="Select all products" /></TableHead><TableHead className={cn("text-[12px] font-bold uppercase tracking-[0.08em] text-[#596273]", !visibleColumns.has("product") && "hidden")}>Product</TableHead><TableHead className={cn("text-[12px] font-bold uppercase tracking-[0.08em] text-[#596273]", !visibleColumns.has("price") && "hidden")}>Price</TableHead><TableHead className={cn("text-[12px] font-bold uppercase tracking-[0.08em] text-[#596273]", !visibleColumns.has("status") && "hidden")}>Status</TableHead><TableHead className={cn("text-[12px] font-bold uppercase tracking-[0.08em] text-[#596273]", !visibleColumns.has("edited") && "hidden")}>{isScheduled ? "Scheduled for" : "Last edited"}</TableHead><TableHead className={cn("text-[12px] font-bold uppercase tracking-[0.08em] text-[#596273]", !visibleColumns.has("view") && "hidden")}>View</TableHead><TableHead className={cn("text-center text-[12px] font-bold uppercase tracking-[0.08em] text-[#596273]", !visibleColumns.has("actions") && "hidden")}>Actions</TableHead></TableRow></TableHeader>
          <TableBody>{visibleProducts.map((product, index) => <TableRow key={product.id} data-state={selected.has(product.id) ? "selected" : undefined} className="h-24"><TableCell className="px-6"><Checkbox checked={selected.has(product.id)} onChange={() => toggle(product.id)} label={`Select ${product.title}`} /></TableCell><TableCell className={cn(!visibleColumns.has("product") && "hidden")}><div className="flex min-w-0 items-center gap-4"><ProductArtwork art={product.art} index={index} image={product.image} title={product.title} /><div className="min-w-0"><p className="truncate font-semibold text-slate-900 dark:text-slate-100">{product.title}</p><p className="truncate text-xs text-muted-foreground">{product.url}</p></div></div></TableCell><TableCell className={cn("font-semibold", !visibleColumns.has("price") && "hidden")}>{product.price}</TableCell><TableCell className={cn(!visibleColumns.has("status") && "hidden")}><span className="inline-flex items-center gap-2 text-xs font-medium"><span className="size-2 rounded-full bg-amber-400" />Draft</span></TableCell><TableCell className={cn("text-xs text-muted-foreground", !visibleColumns.has("edited") && "hidden")}>{product.editedAt}</TableCell><TableCell className={cn(!visibleColumns.has("view") && "hidden")}>{serverIds.has(product.id) ? <Link href={`/products/${product.id}`} aria-label={`View ${product.title}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#596273] hover:text-[#8068e8]"><Eye className="size-4" />View</Link> : <span className="text-sm text-muted-foreground">—</span>}</TableCell><TableCell className={cn(!visibleColumns.has("actions") && "hidden")}><details className="relative mx-auto w-fit"><summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg hover:bg-muted"><MoreHorizontal className="size-5" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border bg-white p-1.5 text-left text-sm shadow-xl dark:bg-slate-900">{serverIds.has(product.id) && <Link href={`/products/${product.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><Eye className="size-4" />View</Link>}<Link href={`/seller-dashboard/products/new?edit=${product.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><Pencil className="size-4" />Edit</Link>{serverIds.has(product.id) && <><button type="button" onClick={() => updateListingStatus({ uuid: product.id, status: "ACTIVE" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><Power className="size-4" />Set active</button><button type="button" onClick={() => updateListingStatus({ uuid: product.id, status: "INACTIVE" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><Power className="size-4" />Set inactive</button></>}<button type="button" onClick={() => { setProducts((items) => items.filter((item) => item.id !== product.id)); writeSellerDrafts(readSellerDrafts().filter((draft) => draft.id !== product.id)); setSelected((items) => { const next = new Set(items); next.delete(product.id); return next }) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="size-4" />Delete</button></div></details></TableCell></TableRow>)}</TableBody>
        </Table>

        {visibleProducts.length === 0 && <p className="py-[60px] text-center text-[13px] text-[#858c95]">No draft products found.</p>}
        <ProductTablePagination page={page} totalPages={totalPages} selectedCount={visibleProducts.filter((product) => selected.has(product.id)).length} rowCount={visibleProducts.length} onPageChange={setPage} />

      </div>

    </section>
  )
}
