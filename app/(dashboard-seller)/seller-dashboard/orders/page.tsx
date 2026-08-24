"use client"

import { Loader2, PackageOpen, RefreshCw } from "lucide-react"
import { useGetSellerOrdersQuery } from "@/lib/api/sellerApi"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
}

export default function SellerOrdersPage() {
  const { data, isLoading, isError, refetch, isFetching } = useGetSellerOrdersQuery()
  const orders = data?.content ?? []

  return (
    <main className="min-h-[calc(100svh-70px)] bg-[#f7f7f8] p-4 sm:p-7">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Customer Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Review orders placed with your store.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching} className="rounded-xl">
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="size-5 animate-spin" />Loading orders...</div>
        ) : isError ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-sm text-slate-500"><p>Could not load your orders.</p><Button onClick={() => refetch()} className="rounded-xl">Try again</Button></div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-slate-500"><PackageOpen className="size-10 text-slate-300" /><div><p className="font-semibold text-slate-700">No orders yet</p><p className="mt-1 text-sm">New customer orders will appear here.</p></div></div>
        ) : (
          <Table>
            <TableHeader><TableRow className="h-14"><TableHead className="px-6">Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="pr-6 text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.uuid} className="h-20">
                  <TableCell className="px-6 font-semibold">#{order.uuid.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{order.buyerId || "Customer"}</TableCell>
                  <TableCell>{(order.items ?? []).reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                  <TableCell><span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", statusStyle[order.status] ?? "bg-slate-100 text-slate-700")}>{order.status}</span></TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="pr-6 text-right font-bold">${Number(order.totalPrice ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  )
}
