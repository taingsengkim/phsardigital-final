"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ChevronDown, LayoutDashboard, LogOut, MessageCircle, PackageCheck, ShoppingBag, Store, Users } from "lucide-react"
import PhsarDigitalLogo from "@/assets/svg/phsardigitalLogo"
import { logoutFromKeycloak } from "@/lib/auth-client"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useGetConversationsQuery } from "@/lib/redux/service/sellerMessageApi"

type NavLink = { label: string; href: string }

const reports: NavLink[] = [
  { label: "Overview", href: "/seller-dashboard/products/dashboard" },
  { label: "Comments", href: "/seller-dashboard/products/comment" },
]
const inventory: NavLink[] = [
  { label: "Add Product", href: "/seller-dashboard/products/new" },
  { label: "Drafts", href: "/seller-dashboard/products/drafts" },
  { label: "Released", href: "/seller-dashboard/products/released" },
  { label: "Orders", href: "/seller-dashboard/orders" },
]

const itemClass = "flex h-[50px] w-full items-center gap-4 rounded-[26px] px-5 text-[15px] font-medium text-[#77746f] transition-colors hover:bg-primary/10 hover:text-primary dark:text-sidebar-foreground dark:hover:bg-primary/15 dark:hover:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
const activeClass = "bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground"

function Submenu({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  return (
    <div className="mb-1 ml-12 space-y-1 border-l border-[#eadfd3] pl-4 group-data-[collapsible=icon]:hidden dark:border-sidebar-border">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={cn("flex h-9 items-center rounded-xl px-3 text-[13px] font-medium text-[#89847e] transition-colors hover:bg-primary/10 hover:text-primary dark:text-muted-foreground dark:hover:bg-primary/15", pathname === link.href && "bg-primary/10 font-semibold text-primary dark:bg-primary/15 dark:text-primary")}>
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export function SellerSidebar() {
  const pathname = usePathname()
  const { data: conversations = [] } = useGetConversationsQuery(undefined, {
    pollingInterval: 30_000,
  })
  const unreadMessages = conversations.reduce(
    (total, conversation) => total + Math.max(0, conversation.unreadCount ?? 0),
    0,
  )
  const [reportsOpen, setReportsOpen] = React.useState(pathname.includes("/products/dashboard") || pathname.includes("/products/comment"))
  const [inventoryOpen, setInventoryOpen] = React.useState(pathname.includes("/products/") || pathname.startsWith("/seller-dashboard/orders"))
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const active = (href: string, prefix = false) => prefix ? pathname.startsWith(href) : pathname === href

  async function confirmLogout() {
    setIsLoggingOut(true)
    await logoutFromKeycloak("/")
  }

  return (
    <>
    <Sidebar collapsible="icon" className="border-r border-[#f0f0f0] bg-white text-[#77746f] dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground">
      <SidebarHeader className="flex h-[70px] shrink-0 justify-center border-b border-[#eeeeee] bg-white px-[22px] dark:border-sidebar-border dark:bg-sidebar">
        <Link href="/seller-dashboard/home" aria-label="Phsar Digital seller dashboard" className="flex items-center gap-3">
          <PhsarDigitalLogo className="size-9 shrink-0" aria-hidden="true" />
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[16px] font-bold text-primary">Phsar Digital</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">Seller Dashboard</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden bg-white px-[18px] pb-5 pt-5 dark:bg-sidebar">
        <nav aria-label="Seller dashboard" className="space-y-[3px]">
          <Link href="/seller-dashboard/home" className={cn(itemClass, active("/seller-dashboard/home") && activeClass)}>
            <LayoutDashboard className="size-[21px] shrink-0" strokeWidth={1.9} />
            <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
          </Link>
          <button type="button" onClick={() => setInventoryOpen((value) => !value)} className={itemClass} aria-expanded={inventoryOpen}>
            <PackageCheck className="size-[21px] shrink-0" strokeWidth={1.8} />
            <span className="group-data-[collapsible=icon]:hidden">Inventory</span>
            <ChevronDown className={cn("ml-auto size-[18px] transition-transform group-data-[collapsible=icon]:hidden", inventoryOpen && "rotate-180")} />
          </button>
          {inventoryOpen && <Submenu links={inventory} />}
          <Link href="/seller-dashboard/shop" className={cn(itemClass, active("/seller-dashboard/shop") && activeClass)}>
            <Store className="size-[21px] shrink-0" strokeWidth={1.8} />
            <span className="group-data-[collapsible=icon]:hidden">Shop</span>
          </Link>
          <Link href="/seller-dashboard/quick-order" className={cn(itemClass, active("/seller-dashboard/quick-order") && activeClass)}>
            <ShoppingBag className="size-[21px] shrink-0" strokeWidth={2} />
            <span className="group-data-[collapsible=icon]:hidden">Quick Order</span>
          </Link>
          <Link href="/seller-dashboard/customer/customer-list" className={cn(itemClass, active("/seller-dashboard/customer", true) && activeClass)}>
            <Users className="size-[21px] shrink-0" strokeWidth={1.8} />
            <span className="group-data-[collapsible=icon]:hidden">Customers</span>
          </Link>

          <button type="button" onClick={() => setReportsOpen((value) => !value)} className={itemClass} aria-expanded={reportsOpen}>
            <BarChart3 className="size-[21px] shrink-0" strokeWidth={1.8} />
            <span className="group-data-[collapsible=icon]:hidden">Reports</span>
            <ChevronDown className={cn("ml-auto size-[18px] transition-transform group-data-[collapsible=icon]:hidden", reportsOpen && "rotate-180")} />
          </button>
          {reportsOpen && <Submenu links={reports} />}

          <Link href="/seller-dashboard/message" className={cn(itemClass, active("/seller-dashboard/message") && activeClass)}>
            <MessageCircle className="size-[21px] shrink-0" strokeWidth={1.8} />
            <span className="group-data-[collapsible=icon]:hidden">Messages</span>
            {unreadMessages > 0 && (
              <span
                aria-label={`${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`}
                className="ml-auto grid min-w-[22px] place-items-center rounded-full bg-[#fa3f50] px-1.5 text-[11px] font-bold leading-[22px] text-white shadow-sm group-data-[collapsible=icon]:hidden"
              >
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>
        </nav>
      </SidebarContent>

      <SidebarFooter className="bg-white px-[18px] pb-7 dark:bg-sidebar">
        <div className="mb-5 h-px bg-[#eee6db] dark:bg-sidebar-border" />
        <button type="button" onClick={() => setLogoutOpen(true)} className={cn(itemClass, "text-[#e74e58] hover:bg-red-50 hover:text-[#d93d48] dark:text-red-400 dark:hover:bg-red-500/10")}> 
          <LogOut className="size-[21px] shrink-0" strokeWidth={1.8} />
          <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
    {logoutOpen && (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 px-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isLoggingOut) setLogoutOpen(false) }}>
        <div role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description" className="w-full max-w-md rounded-[28px] bg-white px-7 py-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.3)] dark:bg-slate-900 sm:px-9">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <LogOut className="size-8" strokeWidth={2} />
          </span>
          <h2 id="logout-title" className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Logout account?</h2>
          <p id="logout-description" className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Are you sure you want to log out of your account?</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button type="button" disabled={isLoggingOut} onClick={() => setLogoutOpen(false)} className="h-12 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancel</button>
            <button type="button" disabled={isLoggingOut} onClick={confirmLogout} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              <LogOut className="size-4" /> {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
