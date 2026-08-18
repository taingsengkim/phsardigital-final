"use client"

import Link from "next/link"
import {
  ArrowRight,
  ExternalLink,
  Heart,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"

import {
  useGetSellerConversationsQuery,
  useGetSellerListingsQuery,
  useGetSellerOrdersQuery,
  useGetSellerProfileQuery,
  useGetSellerReviewsQuery,
} from "@/lib/redux/service/sellerDashboardApi"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function CardTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3"><span className={`h-8 w-2.5 rounded-full ${color}`} /><h2 className="text-base font-bold">{children}</h2></div>
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
      <p>Could not load the seller dashboard.</p>
      <button onClick={retry} className="mt-3 inline-flex items-center gap-2 font-semibold text-destructive">
        <RefreshCw className="size-4" /> Try again
      </button>
    </div>
  )
}

export default function DashboardSeller() {
  const profile = useGetSellerProfileQuery()
  const orders = useGetSellerOrdersQuery({ pageNumber: 0, pageSize: 100 })
  const reviews = useGetSellerReviewsQuery({ pageNumber: 0, pageSize: 5 })
  const conversations = useGetSellerConversationsQuery()
  const listings = useGetSellerListingsQuery(
    { sellerId: profile.data?.id ?? "", pageNumber: 0, pageSize: 20 },
    { skip: !profile.data?.id },
  )

  const isLoading = profile.isLoading || orders.isLoading || reviews.isLoading
  const hasError = profile.isError || orders.isError || reviews.isError || listings.isError
  const orderItems = orders.data?.content ?? []
  const completedOrders = orderItems.filter((order) => order.status.toUpperCase() === "COMPLETED")
  const income = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const customers = [...new Set(orderItems.map((order) => order.buyerId).filter(Boolean))]
  const unreadMessages = (conversations.data ?? []).reduce((sum, item) => sum + item.unreadCount, 0)

  const earningsByListing = new Map<string, number>()
  for (const order of completedOrders) {
    for (const item of order.items ?? []) {
      earningsByListing.set(item.listingUuid, (earningsByListing.get(item.listingUuid) ?? 0) + item.lineTotal)
    }
  }
  const popularProducts = [...(listings.data?.content ?? [])]
    .sort((a, b) => (earningsByListing.get(b.uuid) ?? b.sold ?? 0) - (earningsByListing.get(a.uuid) ?? a.sold ?? 0))
    .slice(0, 4)

  const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const value = completedOrders
      .filter((order) => new Date(order.createdAt).toDateString() === date.toDateString())
      .reduce((sum, order) => sum + order.totalPrice, 0)
    return { label: date.toLocaleDateString("en-US", { weekday: "short" }), value }
  })
  const maxRevenue = Math.max(...dailyRevenue.map((day) => day.value), 1)

  const retry = () => {
    profile.refetch()
    orders.refetch()
    reviews.refetch()
    conversations.refetch()
    if (profile.data?.id) listings.refetch()
  }

  return (
    <div className="min-h-full bg-muted/40 p-4 text-foreground sm:p-6">
      <div className="mb-5 flex items-end justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>{profile.data?.businessName && <p className="mt-1 text-sm text-muted-foreground">{profile.data.businessName}</p>}</div>
        {isLoading && <RefreshCw className="size-5 animate-spin text-muted-foreground" />}
      </div>
      {hasError && !isLoading ? <ErrorState retry={retry} /> : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <CardTitle color="bg-orange-200 dark:bg-orange-600">Overview</CardTitle>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center rounded-2xl bg-muted/65 px-4 py-4 ring-1 ring-border/60"><span className="grid size-10 place-items-center rounded-full bg-sky-200 text-sky-800"><ShoppingBag className="size-5" /></span><div className="ml-3"><p className="text-xs text-muted-foreground">Customers</p><p className="text-3xl font-bold">{customers.length}</p></div></div>
                <div className="flex items-center rounded-2xl bg-muted/65 px-4 py-4 ring-1 ring-border/60"><span className="grid size-10 place-items-center rounded-full bg-violet-200 text-violet-800"><TrendingUp className="size-5" /></span><div className="ml-3"><p className="text-xs text-muted-foreground">Completed income</p><p className="text-3xl font-bold">{money.format(income)}</p></div></div>
              </div>
              <div className="mt-6 flex items-center justify-between"><p className="text-xs text-muted-foreground">{orderItems.length} orders · {unreadMessages} unread messages</p><Link href="/seller-dashboard/message" className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted">Open messages</Link></div>
              <div className="mt-6 flex gap-5">
                {customers.slice(0, 3).map((customer) => <div key={customer} className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">{customer.slice(0, 2).toUpperCase()}</span><span className="mt-2 block max-w-20 truncate text-xs">{customer}</span></div>)}
                <Link href="/seller-dashboard/customer/customer-list" className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-muted"><ArrowRight className="size-5" /></span><span className="mt-2 block text-xs font-medium">View all</span></Link>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <CardTitle color="bg-violet-200 dark:bg-violet-600">Revenue — last 7 days</CardTitle>
              <div className="mt-8 flex h-64 items-end justify-around gap-3 border-b border-border px-2">
                {dailyRevenue.map((day) => <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end"><span className="mb-2 text-[10px] font-medium">{day.value ? money.format(day.value) : ""}</span><div className="w-full max-w-12 rounded-t bg-violet-500" style={{ height: `${Math.max((day.value / maxRevenue) * 85, 2)}%` }} /><span className="py-2 text-[10px] text-muted-foreground">{day.label}</span></div>)}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <CardTitle color="bg-sky-200 dark:bg-sky-600">Popular products</CardTitle>
              <div className="mb-3 mt-6 flex justify-between text-[10px] font-medium text-muted-foreground"><span>Products</span><span>Earnings</span></div>
              {popularProducts.length ? <div className="divide-y divide-border">{popularProducts.map((product) => <div key={product.uuid} className="flex items-center gap-3 py-3"><div role="img" aria-label={product.title} className="size-12 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${product.thumbnailUri?.uri || "/picture/pic8.jpg"})` }} /><p className="min-w-0 flex-1 text-xs font-semibold leading-5">{product.title}</p><div className="text-right"><p className="text-xs font-bold">{money.format(earningsByListing.get(product.uuid) ?? 0)}</p><span className="text-[9px] text-muted-foreground">{product.sold ?? 0} sold</span></div></div>)}</div> : <p className="py-8 text-center text-xs text-muted-foreground">No products yet.</p>}
              <Link href="/seller-dashboard/products/dashboard" className="mt-4 block rounded-lg border border-border py-2.5 text-center text-xs font-semibold hover:bg-muted">All products</Link>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <CardTitle color="bg-amber-200 dark:bg-amber-600">Recent reviews</CardTitle>
              {(reviews.data?.content ?? []).length ? <div className="mt-4 divide-y divide-border">{reviews.data?.content.map((review) => <article key={review.uuid} className="flex gap-3 py-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">{(review.buyer.fullName || review.buyer.username || "B").slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1 text-xs"><div className="flex gap-1"><b>{review.buyer.fullName || review.buyer.username || "Buyer"}</b><span className="ml-auto text-amber-500">{"★".repeat(review.rating)}</span></div><p className="mt-1 text-muted-foreground">On <b>{review.listing.title}</b></p><p className="mt-2">{review.comment}</p><div className="mt-4 flex justify-between text-muted-foreground"><MessageSquare className="size-4" /><Heart className="size-4" /><ExternalLink className="size-4" /></div></div></article>)}</div> : <p className="py-8 text-center text-xs text-muted-foreground">No reviews yet.</p>}
              <Link href="/seller-dashboard/products/comment" className="mt-4 block rounded-lg border border-border py-2.5 text-center text-xs font-semibold hover:bg-muted">View all</Link>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
