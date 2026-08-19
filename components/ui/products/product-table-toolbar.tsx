"use client"

import { CalendarDays, Check, ChevronDown, Search } from "lucide-react"

export type TableColumn = { key: string; label: string }

export function ProductTableToolbar({ query, onQueryChange, createdDate, onCreatedDateChange, columns, visibleColumns, onToggleColumn }: {
  query: string
  onQueryChange: (value: string) => void
  createdDate: string
  onCreatedDateChange: (value: string) => void
  columns: TableColumn[]
  visibleColumns: Set<string>
  onToggleColumn: (key: string) => void
}) {
  return <div className="mb-6 flex flex-wrap items-center gap-3  border-[#e4e7eb] bg-white p-5">
    <label className="relative min-w-[260px] flex-1 lg:max-w-[350px]"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#657184]" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} type="search" placeholder="Search products..." className="h-14 w-full rounded-xl border border-[#dde1e6] bg-white pl-12 pr-4 text-base outline-none focus:border-[#8068e8] focus:ring-2 focus:ring-[#8068e8]/15" /></label>
    <label className="relative ml-auto flex h-14 cursor-pointer items-center gap-3 rounded-xl border border-[#dde1e6] px-5 text-sm font-medium"><CalendarDays className="size-5" /><span>{createdDate || "Created date"}</span><input type="date" value={createdDate} onChange={(event) => onCreatedDateChange(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter by created date" /></label>
    <details className="group relative"><summary className="flex h-14 min-w-36 cursor-pointer list-none items-center justify-center gap-3 rounded-xl border border-[#dde1e6] px-5 text-[14px] font-medium">Filter <ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary><div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-[#d9dde2] bg-white p-2 shadow-xl"><p className="px-2 py-2 text-[14px] text-[#68717d]">Columns</p>{columns.map((column) => <button key={column.key} type="button" onClick={() => onToggleColumn(column.key)} className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left text-[14px] hover:bg-[#f5f6f7]"><span>{column.label}</span>{visibleColumns.has(column.key) && <Check className="size-5" />}</button>)}</div></details>
  </div>
}
