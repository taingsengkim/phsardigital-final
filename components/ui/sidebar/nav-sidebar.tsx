"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronUp, CirclePlus, CircleHelp, Home, Moon, Store, Sun, Tags, UserRound } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type SidebarChildLink = {
  title: string
  url: string
  count?: number
}

const productLinks: SidebarChildLink[] = [
  { title: "Dashboard", url: "/seller-dashboard/products/dashboard" },
  { title: "Drafts", url: "/seller-dashboard/products/drafts" },
  { title: "Released", url: "/seller-dashboard/products/released" },
  { title: "Comments", url: "/seller-dashboard/products/comments" },
  { title: "Scheduled", url: "/seller-dashboard/products/scheduled" },
]

const customerLinks: SidebarChildLink[] = [
  { title: "Overview", url: "/seller-dashboard/customers/overview" },
  { title: "Customer list", url: "/seller-dashboard/customers" },
]

const subscribe = () => () => {}

export function SellerSidebar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false)
  const [productsOpen, setProductsOpen] = React.useState(pathname.startsWith("/seller-dashboard/products"))
  const [customersOpen, setCustomersOpen] = React.useState(pathname.startsWith("/seller-dashboard/customers"))

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="flex h-18 items-center border-b border-sidebar-border bg-white px-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#6C4CD8] text-white">
            <Store className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-[#6C4CD8]">Seller Portal</span>
            <span className="text-xs text-muted-foreground">Seller Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden bg-white px-3 py-5">
        <nav aria-label="Seller dashboard" className="space-y-[4px]">
          <Link
            href="/seller-dashboard/home"
            className={cn(
              "flex h-12 items-center gap-4 rounded-xl px-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              pathname === "/seller-dashboard/home" && "bg-sidebar-accent text-foreground",
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
                  href="/seller-dashboard/products/new"
                  aria-label="Add product"
                >
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
              <div className="relative ml-[27px] space-y-[2px] pl-5 pb-[2px] group-data-[collapsible=icon]:hidden">
                {productLinks.map((item) => {
                  const active = pathname === item.url
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={cn(
                        "relative flex h-[42px] items-center rounded-[11px] px-3 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground before:absolute before:-left-5 before:bottom-1/2 before:top-[-3px] before:w-5 before:rounded-bl-[14px] before:border-b before:border-l before:border-[#e7e8ea]",
                        active && "bg-[#f0f0f1] font-semibold text-[#25272a] shadow-[0_2px_0_rgba(0,0,0,0.07)]",
                      )}
                    >
                      <span>{item.title}</span>
                      {item.count !== undefined && (
                        <span className="ml-auto grid min-w-[25px] place-items-center rounded-[6px] bg-[#afe5cc] px-[6px] py-[3px] text-[12px] font-semibold text-[#252525]">
                          {item.count}
                        </span>
                      )}
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
              {customersOpen ? <ChevronUp className="ml-auto size-5 group-data-[collapsible=icon]:hidden" /> : <ChevronDown className="ml-auto size-5 group-data-[collapsible=icon]:hidden" />}
            </button>
            {customersOpen && (
              <div className="relative ml-[27px] space-y-[2px] pl-5 pb-[2px] group-data-[collapsible=icon]:hidden">
                {customerLinks.map((item) => {
                  const active = pathname === item.url
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={cn(
                        "relative flex h-[42px] items-center rounded-[11px] px-3 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground before:absolute before:-left-5 before:bottom-1/2 before:top-[-3px] before:w-5 before:rounded-bl-[14px] before:border-b before:border-l before:border-[#e7e8ea]",
                        active && "bg-[#f0f0f1] font-semibold text-[#25272a] shadow-[0_2px_0_rgba(0,0,0,0.07)]",
                      )}
                    >
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <Link
            href="/seller-dashboard/shop"
            className={cn(
              "flex h-12 items-center gap-4 rounded-xl px-3 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              pathname === "/seller-dashboard/shop" && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Store className="size-5 shrink-0" strokeWidth={2} />
            <span className="group-data-[collapsible=icon]:hidden">Shop</span>
          </Link>
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-white p-4">
        <div className="space-y-4 pb-4 group-data-[collapsible=icon]:hidden">
          <Link
            href="/dashboard/help"
            className="flex h-11 items-center gap-3 rounded-xl px-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <CircleHelp className="size-5 shrink-0" strokeWidth={2} />
            <span>Help &amp; getting started</span>
          </Link>

          <div
            className="grid grid-cols-2 rounded-full bg-muted p-1"
            aria-label="Color theme"
          >
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={mounted && resolvedTheme === "light"}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted-foreground transition-all",
                mounted && resolvedTheme === "light" && "bg-background text-foreground shadow-sm",
              )}
            >
              <Sun className="size-5" />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={mounted && resolvedTheme === "dark"}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold text-muted-foreground transition-all",
                mounted && resolvedTheme === "dark" && "bg-background text-foreground shadow-sm",
              )}
            >
              <Moon className="size-5" />
              Dark
            </button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
