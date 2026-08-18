"use client"

import * as React from "react"
import Image from "next/image"
import { Check, CheckCircle2, ListFilter, Search } from "lucide-react"

import { cn } from "@/lib/utils"

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  status: "active" | "new"
}

const customers: Customer[] = [
  { id: 1, name: "Sim Menghor", email: "menghor.it@gmail.com", phone: "+855 966931349", avatar: "/picture/menghor.jpg", status: "active" },
  { id: 2, name: "Taing Sengkim", email: "taing.sengkim@gmail.com", phone: "+855 966931349", avatar: "/picture/sengkim.jpg", status: "active" },
  { id: 3, name: "Lor Vengroth", email: "lorvengroth@gmail.com", phone: "+855 966931349", avatar: "/picture/bunleang.jpg", status: "active" },
  { id: 4, name: "Brown Beatty", email: "brown.be@gmail.com", phone: "+855 966931349", avatar: "/picture/lisa.PNG", status: "new" },
]

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange} className={cn("grid size-[22px] shrink-0 place-items-center rounded-[5px] border", checked ? "border-[#2f80ed] bg-[#2f80ed] text-white" : "border-border bg-background")}>{checked && <Check className="size-[15px]" strokeWidth={3} />}</button>
}

export function CustomerList() {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"active" | "new">("active")
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const [messageSent, setMessageSent] = React.useState(false)
  const visible = customers.filter((customer) => customer.status === filter && `${customer.name} ${customer.email}`.toLowerCase().includes(query.toLowerCase()))
  const allSelected = visible.length > 0 && visible.every((customer) => selected.has(customer.id))

  function toggle(id: number) {
    setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
    setMessageSent(false)
  }

  function toggleAll() {
    setSelected((current) => { const next = new Set(current); if (allSelected) visible.forEach((customer) => next.delete(customer.id)); else visible.forEach((customer) => next.add(customer.id)); return next })
    setMessageSent(false)
  }

  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-col bg-background px-[28px] py-[30px] text-foreground sm:px-[38px]">
      <h1 className="mb-[24px] text-[32px] font-bold leading-none tracking-[-0.8px]">Customer list</h1>
      <div className="flex-1 rounded-[10px] border border-border bg-card px-[18px] pb-[12px] pt-[18px] text-card-foreground shadow-sm">
        <div className="flex flex-wrap items-center gap-[16px] pb-[28px]">
          <span className="h-[31px] w-[14px] rounded-[5px] bg-[#c9b7ff]" />
          <h2 className="text-[17px] font-semibold">Customer</h2>
          <label className="relative w-full max-w-[345px] sm:ml-[7px]"><Search className="absolute left-[13px] top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search by name or email" className="h-[39px] w-full rounded-[10px] border-0 bg-muted pl-[40px] pr-[14px] text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[#8068e8]/25" /></label>
          <div className="ml-auto flex items-center gap-[4px] rounded-[9px] bg-card"><button type="button" onClick={() => setFilter("active")} className={cn("h-[42px] rounded-[9px] px-[20px] text-[12px] font-semibold text-muted-foreground", filter === "active" && "bg-muted text-foreground")}>Active</button><button type="button" onClick={() => setFilter("new")} className={cn("h-[42px] rounded-[9px] px-[20px] text-[12px] font-semibold text-muted-foreground", filter === "new" && "bg-muted text-foreground")}>New</button><button type="button" aria-label="More filters" className="ml-[6px] grid size-[42px] place-items-center rounded-[9px] border border-border text-muted-foreground"><ListFilter className="size-[19px]" /></button></div>
        </div>

        <div className="min-w-[720px]">
          <div className="grid grid-cols-[42px_minmax(220px,1.25fr)_minmax(230px,1.3fr)_120px_120px_100px] items-center border-b border-[#eceef0] pb-[14px] text-[11px] font-medium text-[#777f89]"><Checkbox checked={allSelected} onChange={toggleAll} label="Select all customers" /><span>Name</span><span>Email</span><span>Purchase</span><span>Comments</span><span>Likes</span></div>
          {visible.map((customer) => (
            <div key={customer.id} className={cn("grid min-h-[100px] grid-cols-[42px_minmax(220px,1.25fr)_minmax(230px,1.3fr)_120px_120px_100px] items-center border-b border-border px-[0] py-[12px] last:border-0", selected.has(customer.id) && "my-[8px] rounded-[9px] border-b-0 bg-muted px-[10px] text-foreground")}>
              <Checkbox checked={selected.has(customer.id)} onChange={() => toggle(customer.id)} label={`Select ${customer.name}`} />
              <div className="flex items-center gap-[14px]"><Image src={customer.avatar} alt="" width={48} height={48} className="size-[48px] rounded-full object-cover" /><div><p className="text-[13px] font-semibold">{customer.name}</p><p className="mt-[3px] text-[11px] text-[#858c95]">{customer.phone}</p></div></div>
              <p className="truncate pr-[16px] text-[12px] text-[#66707a]">{customer.email}</p>
              <span><b className="rounded-[6px] bg-[#afe5cc] px-[8px] py-[5px] text-[12px]">4</b></span><b className="text-[12px]">8</b><b className="text-[12px]">16</b>
            </div>
          ))}
        </div>
        {visible.length === 0 && <p className="py-[70px] text-center text-[13px] text-[#858c95]">No customers found.</p>}
      </div>

      <div className="sticky bottom-0 -mx-[28px] -mb-[30px] mt-[32px] flex min-h-[82px] items-center border-t border-border bg-card px-[28px] sm:-mx-[38px] sm:px-[38px]"><div className="flex items-center gap-[12px] text-[12px] text-muted-foreground"><CheckCircle2 className="size-[18px]" /><b>{selected.size}</b> customers selected</div><button type="button" disabled={!selected.size} onClick={() => setMessageSent(true)} className="ml-auto h-[48px] rounded-[10px] bg-[#2f80ed] px-[23px] text-[13px] font-semibold text-white shadow-sm hover:bg-[#2773da] disabled:opacity-40">{messageSent ? "Message sent" : "Message"}</button></div>
    </section>
  )
}
