"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CirclePlus,
  Home,
  LogOut,
  Store,
  Tags,
  UserRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const productLinks = [
  { title: "Dashboard", url: "/dashboard/products" },
  { title: "Drafts", url: "/dashboard/products/drafts", count: 2, badge: "bg-[#ffb28e] text-[#252525]" },
  { title: "Released", url: "/dashboard/products/released" },
  { title: "Scheduled", url: "/dashboard/products/scheduled", count: 8, badge: "bg-[#afe5cc] text-[#252525]" },
]

export function SellerSidebar() {
  const pathname = usePathname()
  const [productsOpen, setProductsOpen] = React.useState(true)
  const [customersOpen, setCustomersOpen] = React.useState(false)

  return (
    <Sidebar collapsible="icon" className="border-r ]">
      <SidebarHeader className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#6C4CD8] text-white">
            <Store className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-[#6C4CD8]">Seller Portal</span>
            <span className="text-xs text-muted-foreground">Phsar Digital</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden px-3 py-5">
        <nav aria-label="Seller dashboard" className="space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex h-12 items-center gap-4 rounded-xl px-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              pathname === "/dashboard" && "text-foreground",
            )}
          >
            <Home className="size-5 shrink-0" strokeWidth={2} />
            <span className="group-data-[collapsible=icon]:hidden">Home</span>
          </Link>

          <div>
            <div className="flex h-12 items-center text-[15px] font-semibold text-muted-foreground">
              <button
                type="button"
                onClick={() => setProductsOpen((open) => !open)}
                className="flex h-full min-w-0 flex-1 items-center gap-4 rounded-xl px-3 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                aria-expanded={productsOpen}
              >
                <Tags className="size-5 shrink-0" strokeWidth={2} />
                <span className="group-data-[collapsible=icon]:hidden">Products</span>
              </button>
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <Link
                  href="/dashboard/products/new"
                  aria-label="Add product"
                  className="grid size-8 place-items-center rounded-full border border-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <CirclePlus className="size-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setProductsOpen((open) => !open)}
                  className="grid size-8 place-items-center rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label={productsOpen ? "Collapse products" : "Expand products"}
                >
                  {productsOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                </button>
              </div>
            </div>

            {productsOpen && (
              <div className="relative ml-[27px] mt-1 space-y-1 pl-5 group-data-[collapsible=icon]:hidden">
                <span className="absolute bottom-6 left-0 top-0 w-px bg-border" aria-hidden="true" />
                {productLinks.map((item) => {
                  const active = pathname === item.url
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={cn(
                        "relative flex h-11 items-center rounded-xl px-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground before:absolute before:-left-5 before:top-0 before:h-1/2 before:w-4 before:rounded-bl-xl before:border-b before:border-l before:border-border",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                      )}
                    >
                      <span>{item.title}</span>
                      {item.count && (
                        <span className={cn("ml-auto grid min-w-7 place-items-center rounded-lg px-2 py-1 text-sm font-semibold", item.badge)}>
                          {item.count}
                        </span>
                      )}
                      {active && item.title === "Dashboard" && <ChevronRight className="ml-auto size-5" />}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setCustomersOpen((open) => !open)}
              className="flex h-12 w-full items-center gap-4 rounded-xl px-3 text-[15px] font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              aria-expanded={customersOpen}
            >
              <UserRound className="size-5 shrink-0" strokeWidth={2} />
              <span className="group-data-[collapsible=icon]:hidden">Customers</span>
              <ChevronDown className={cn("ml-auto size-5 transition-transform group-data-[collapsible=icon]:hidden", customersOpen && "rotate-180")} />
            </button>
            {customersOpen && (
              <div className="ml-[47px] group-data-[collapsible=icon]:hidden">
                <Link href="/dashboard/customers" className="flex h-10 items-center rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  All customers
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/shop"
            className={cn(
              "flex h-12 items-center gap-4 rounded-xl px-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              pathname === "/dashboard/shop" && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Store className="size-5 shrink-0" strokeWidth={2} />
            <span className="group-data-[collapsible=icon]:hidden">Shop</span>
          </Link>
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8">
            <AvatarImage src="/picture/lisa.PNG" alt="Seller" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">Seller Name</span>
            <span className="truncate text-xs text-muted-foreground">seller@example.com</span>
          </div>
          <button type="button" aria-label="Log out" className="ml-auto group-data-[collapsible=icon]:hidden">
            <LogOut className="size-4 text-muted-foreground" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
