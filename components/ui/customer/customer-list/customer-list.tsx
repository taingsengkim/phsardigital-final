"use client"

import * as React from "react"
import Image from "next/image"
import { CalendarDays, Check, Eye, Heart, Mail, MessageSquare, MoreHorizontal, Pencil, Phone, ShoppingBag, Trash2, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductTableToolbar } from "@/components/ui/products/product-table-toolbar"
import { ProductTablePagination } from "@/components/ui/products/product-table-pagination"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  status: "active" | "new"
  createdAt: string
}

const customers: Customer[] = [
  { id: 1, name: "Sim Menghor", email: "menghor.it@gmail.com", phone: "+855 966931349", avatar: "/picture/menghor.jpg", status: "active", createdAt: "2026-08-22" },
  { id: 2, name: "Taing Sengkim", email: "taing.sengkim@gmail.com", phone: "+855 966931349", avatar: "/picture/sengkim.jpg", status: "active", createdAt: "2026-08-21" },
  { id: 3, name: "Lor Vengroth", email: "lorvengroth@gmail.com", phone: "+855 966931349", avatar: "/picture/bunleang.jpg", status: "active", createdAt: "2026-08-20" },
  { id: 4, name: "Brown Beatty", email: "brown.be@gmail.com", phone: "+855 966931349", avatar: "/picture/lisa.PNG", status: "new", createdAt: "2026-08-19" },
]

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange} className={cn("grid size-[22px] shrink-0 place-items-center rounded-[5px] border transition-colors", checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50")}>{checked && <Check className="size-[15px]" strokeWidth={3} />}</button>
}

export function CustomerList() {
  const [query, setQuery] = React.useState("")
  const [createdDate, setCreatedDate] = React.useState("")
  const [page, setPage] = React.useState(0)
  const [visibleColumns, setVisibleColumns] = React.useState(() => new Set(["name", "email", "purchase", "comments", "likes", "actions"]))
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const [detailCustomer, setDetailCustomer] = React.useState<Customer | null>(null)
  const filtered = customers.filter((customer) =>
    (!createdDate || customer.createdAt === createdDate) &&
    `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize)
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize)
  const allSelected = visible.length > 0 && visible.every((customer) => selected.has(customer.id))

  function toggle(id: number) {
    setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  function toggleAll() {
    setSelected((current) => { const next = new Set(current); if (allSelected) visible.forEach((customer) => next.delete(customer.id)); else visible.forEach((customer) => next.add(customer.id)); return next })
  }

  function toggleColumn(key: string) {
    setVisibleColumns((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next })
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-col bg-background px-[28px] py-[30px] text-foreground sm:px-[38px]">
      <h1 className="mb-[24px] text-[32px] font-bold leading-none tracking-[-0.8px]">Customer list</h1>
      <div className="flex-1 rounded-[10px] border border-border bg-card px-[18px] pb-[12px] pt-[18px] text-card-foreground shadow-sm">
        <div className="flex flex-wrap items-center gap-[16px] pb-[18px]">
          <span className="h-[31px] w-[14px] rounded-[5px] bg-primary" />
          <h2 className="text-[17px] font-semibold">Customer</h2>
        </div>

        <ProductTableToolbar
          query={query}
          onQueryChange={(value) => { setQuery(value); setPage(0) }}
          createdDate={createdDate}
          onCreatedDateChange={(value) => { setCreatedDate(value); setPage(0) }}
          searchPlaceholder="Search customers..."
          columns={[
            { key: "name", label: "Name" }, { key: "email", label: "Email" },
            { key: "purchase", label: "Purchase" }, { key: "comments", label: "Comments" },
            { key: "likes", label: "Likes" }, { key: "actions", label: "Actions" },
          ]}
          visibleColumns={visibleColumns}
          onToggleColumn={toggleColumn}
        />

        <div className="overflow-x-auto">
          <Table className="min-w-[900px] table-fixed">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[29%]" />
              <col className="w-[25%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="h-12 hover:bg-transparent">
                <TableHead className="px-4"><Checkbox checked={allSelected} onChange={toggleAll} label="Select all customers" /></TableHead>
                {[['name', 'Name'], ['email', 'Email'], ['purchase', 'Purchase'], ['comments', 'Comments'], ['likes', 'Likes'], ['actions', 'Actions']].map(([key, label]) => (
                  <TableHead key={key} className={cn("text-[13px] font-bold uppercase tracking-[0.08em] text-[#596273]", ['purchase', 'comments', 'likes', 'actions'].includes(key) && "text-center", !visibleColumns.has(key) && "hidden")}>{label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
          {visible.map((customer) => (
            <TableRow key={customer.id} data-state={selected.has(customer.id) ? "selected" : undefined} className="h-20">
              <TableCell className="px-4"><Checkbox checked={selected.has(customer.id)} onChange={() => toggle(customer.id)} label={`Select ${customer.name}`} /></TableCell>
              <TableCell className={cn(!visibleColumns.has("name") && "hidden")}><div className="flex min-w-0 items-center gap-4"><Image src={customer.avatar} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" /><div className="min-w-0"><p className="truncate text-base font-semibold">{customer.name}</p><p className="truncate text-sm text-muted-foreground">{customer.phone}</p></div></div></TableCell>
              <TableCell className={cn("truncate text-sm text-muted-foreground", !visibleColumns.has("email") && "hidden")}>{customer.email}</TableCell>
              <TableCell className={cn("text-center text-base font-semibold", !visibleColumns.has("purchase") && "hidden")}>4</TableCell>
              <TableCell className={cn("text-center text-base font-semibold text-primary", !visibleColumns.has("comments") && "hidden")}>8</TableCell>
              <TableCell className={cn("text-center text-base font-semibold text-primary", !visibleColumns.has("likes") && "hidden")}>16</TableCell>
              <TableCell className={cn(!visibleColumns.has("actions") && "hidden")}><DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={`Actions for ${customer.name}`} className="mx-auto grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"><MoreHorizontal className="size-6" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-2xl border-border p-2 shadow-xl">
                  <DropdownMenuItem onSelect={() => setDetailCustomer(customer)} className="h-10 cursor-pointer gap-3 rounded-xl px-3 text-sm font-medium"><Eye className="size-[18px] text-muted-foreground" />View details</DropdownMenuItem>
                  <DropdownMenuItem className="h-10 cursor-pointer gap-3 rounded-xl px-3 text-sm font-medium"><Pencil className="size-[18px] text-muted-foreground" />Edit customer</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem className="h-10 cursor-pointer gap-3 rounded-xl px-3 text-sm font-medium text-red-600 focus:bg-muted focus:text-red-600"><Trash2 className="size-[18px]" />Delete customer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu></TableCell>
            </TableRow>
          ))}
            </TableBody>
          </Table>
        </div>
        <ProductTablePagination
          page={page}
          totalPages={totalPages}
          selectedCount={selected.size}
          rowCount={filtered.length}
          onPageChange={setPage}
        />
        {visible.length === 0 && <p className="py-[70px] text-center text-[13px] text-[#858c95]">No customers found.</p>}
      </div>
      <CustomerDetailSheet customer={detailCustomer} onClose={() => setDetailCustomer(null)} />
    </section>
  )
}

function CustomerDetailSheet({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  if (!customer) return null

  const joined = new Date(`${customer.createdAt}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  })

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-[480px]">
        <div className="bg-gradient-to-br from-[#6C4CD8] via-[#8068e8] to-[#a992f5] px-7 pb-8 pt-12 text-white">
          <SheetHeader className="p-0">
            <div className="flex items-center gap-4">
              <Image src={customer.avatar} alt={customer.name} width={76} height={76} className="size-[76px] rounded-2xl border-4 border-white/30 object-cover shadow-lg" />
              <div className="min-w-0">
                <SheetTitle className="truncate text-2xl font-bold text-white">{customer.name}</SheetTitle>
                <SheetDescription className="mt-1 text-white/75">Customer #{String(customer.id).padStart(4, "0")}</SheetDescription>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold capitalize"><span className="size-1.5 rounded-full bg-emerald-300" />{customer.status}</span>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="space-y-6 px-7 py-6">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Customer activity</h3>
            <div className="grid grid-cols-3 gap-3">
              <DetailStat icon={ShoppingBag} label="Purchases" value="4" tone="bg-amber-50 text-amber-600" />
              <DetailStat icon={MessageSquare} label="Comments" value="8" tone="bg-violet-50 text-violet-600" />
              <DetailStat icon={Heart} label="Likes" value="16" tone="bg-rose-50 text-rose-600" />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold"><UserRound className="size-[18px] text-primary" />Personal information</h3>
            <div className="space-y-4">
              <DetailRow icon={Mail} label="Email address" value={customer.email} />
              <DetailRow icon={Phone} label="Phone number" value={customer.phone} />
              <DetailRow icon={CalendarDays} label="Customer since" value={joined} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <a href={`mailto:${customer.email}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold transition hover:bg-muted"><Mail className="size-4" />Send email</a>
            <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"><Phone className="size-4" />Call customer</a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailStat({ icon: Icon, label, value, tone }: { icon: typeof ShoppingBag; label: string; value: string; tone: string }) {
  return <div className="rounded-2xl border border-border p-3"><span className={cn("grid size-9 place-items-center rounded-xl", tone)}><Icon className="size-[17px]" /></span><p className="mt-3 text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Icon className="size-[17px]" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div></div>
}
