"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  PackageCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import PhsarDigitalLogo from "@/assets/svg/phsardigitalLogo";
import { useGetConversationsQuery } from "@/lib/redux/service/sellerMessageApi";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };

const inventory: NavLink[] = [
  { label: "Add Product", href: "/seller-dashboard/products/new" },
  { label: "Drafts", href: "/seller-dashboard/products/drafts" },
  { label: "Released", href: "/seller-dashboard/products/released" },
  { label: "Orders", href: "/seller-dashboard/orders" },
];

const itemClass =
  "group/nav flex min-h-[64px] w-full items-center gap-3 rounded-[18px] px-3 text-left text-[#697386] transition-all hover:bg-[#f1f2f2] hover:text-[#16181d] dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:min-h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>svg]:size-10 [&>svg]:shrink-0 [&>svg]:rounded-xl [&>svg]:border [&>svg]:border-[#dfe5eb] [&>svg]:p-2.5 [&>svg]:text-[#91a0b2] dark:[&>svg]:border-sidebar-border dark:[&>svg]:text-muted-foreground";
const activeClass =
  "bg-primary/12 font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.5)] hover:bg-primary/18 hover:text-primary dark:bg-primary/15 dark:text-primary dark:hover:bg-primary/20 [&>svg]:border-primary/50 [&>svg]:bg-primary/10 [&>svg]:text-primary dark:[&>svg]:border-primary/60 dark:[&>svg]:bg-primary/15 dark:[&>svg]:text-primary";

function Submenu({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <div className="mb-1 ml-12 space-y-1 border-l border-[#eadfd3] pl-4 group-data-[collapsible=icon]:hidden dark:border-sidebar-border">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex h-9 items-center rounded-xl px-3 text-[13px] font-medium text-[#89847e] transition-colors hover:bg-primary/10 hover:text-primary dark:text-muted-foreground dark:hover:bg-primary/15",
            pathname === link.href &&
              "bg-primary/10 font-semibold text-primary dark:bg-primary/15 dark:text-primary",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function SellerSidebar() {
  const pathname = usePathname();
  const { data: conversations = [] } = useGetConversationsQuery(undefined, {
    pollingInterval: 30_000,
  });
  const unreadMessages = conversations.reduce(
    (total, conversation) => total + Math.max(0, conversation.unreadCount ?? 0),
    0,
  );
  const [inventoryOpen, setInventoryOpen] = React.useState(
    pathname.includes("/products/") ||
      pathname.startsWith("/seller-dashboard/orders"),
  );
  const active = (href: string, prefix = false) =>
    prefix ? pathname.startsWith(href) : pathname === href;

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-[#f0f0f0] bg-white text-[#77746f] dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground"
      >
        <SidebarHeader className="flex h-[70px] shrink-0 justify-center border-b border-[#eeeeee] bg-white px-5 dark:border-sidebar-border dark:bg-sidebar">
          <Link
            href="/home"
            aria-label="Go to Phsar Digital home"
            className="flex items-center gap-3"
          >
            <PhsarDigitalLogo
              className="size-9 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
              <p className="truncate text-[16px] font-bold text-primary">
                Phsar Digital
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
                Seller Dashboard
              </p>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden bg-white px-3.5 pb-5 pt-5 dark:bg-sidebar">
          <nav aria-label="Seller dashboard" className="space-y-1">
            <Link
              href="/seller-dashboard/home"
              className={cn(
                itemClass,
                active("/seller-dashboard/home") && activeClass,
              )}
            >
              <LayoutDashboard strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Dashboard</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Executive summary</span></span>
            </Link>
            <button
              type="button"
              onClick={() => setInventoryOpen((value) => !value)}
              className={itemClass}
              aria-expanded={inventoryOpen}
            >
              <PackageCheck strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Inventory</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Products & orders</span></span>
              <ChevronDown
                className={cn(
                  "ml-auto !size-4 !border-0 !p-0 transition-transform group-data-[collapsible=icon]:hidden",
                  inventoryOpen && "rotate-180",
                )}
              />
            </button>
            {inventoryOpen && <Submenu links={inventory} />}
            <Link
              href="/seller-dashboard/quick-order"
              className={cn(
                itemClass,
                active("/seller-dashboard/quick-order") && activeClass,
              )}
            >
              <ShoppingBag strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Quick Order</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Create a sale</span></span>
            </Link>

            <Link
              href="/seller-dashboard/products/comment"
              className={cn(
                itemClass,
                active("/seller-dashboard/products/comment") && activeClass,
              )}
            >
              <MessageSquare strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Comments</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Customer feedback</span></span>
            </Link>

            <Link
              href="/seller-dashboard/message"
              className={cn(
                itemClass,
                active("/seller-dashboard/message") && activeClass,
              )}
            >
              <MessageCircle strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Messages</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Customer conversations</span></span>
              {unreadMessages > 0 && (
                <span
                  aria-label={`${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`}
                  className="ml-auto grid min-w-[22px] place-items-center rounded-full bg-[#fa3f50] px-1.5 text-[11px] font-bold leading-[22px] text-white shadow-sm group-data-[collapsible=icon]:hidden"
                >
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/seller-dashboard/shop"
              className={cn(
                itemClass,
                active("/seller-dashboard/shop") && activeClass,
              )}
            >
              <Store strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Shop</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Store settings</span></span>
            </Link>

            <Link
              href="/subscriptions"
              className={cn(
                itemClass,
                active("/subscriptions") && activeClass,
              )}
            >
              <CreditCard strokeWidth={1.8} />
              <span className="min-w-0 group-data-[collapsible=icon]:hidden"><span className="block text-[15px] font-semibold leading-5">Subscription</span><span className="block truncate text-[11px] font-medium text-[#94a4bc]">Plans & billing</span></span>
            </Link>
          </nav>
        </SidebarContent>

          {/* The dashboard is otherwise a dead end — this is the way back out. */}
      </Sidebar>
    </>
  );
}
