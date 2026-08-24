"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, logoutFromKeycloak } from "@/lib/auth-client";
import { useGetMeQuery } from "@/lib/api/authApi";
import {
  useGetSellerProfileQuery,
  useGetSellerApplicationQuery,
} from "@/lib/api/sellerApi";
import {
  useGetSellerOrdersQuery,
  useGetSellerReviewsQuery,
} from "@/lib/redux/service/sellerDashboardApi";
import { useGetConversationsQuery } from "@/lib/redux/service/sellerMessageApi";

type SellerNotification = {
  id: string;
  title: string;
  detail: string;
  at: string;
  href: string;
  kind: "order" | "review" | "message";
};

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

export function NavTopbar() {
  const pathname = usePathname();
  const isMessagePage = pathname.startsWith("/seller-dashboard/message");
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: profile } = useGetMeQuery(undefined, { skip: !session?.user });
  const { data: sellerProfile } = useGetSellerProfileQuery(undefined, {
    skip: !session?.user,
  });
  const { data: sellerApp } = useGetSellerApplicationQuery(undefined, {
    skip: !session?.user,
  });
  const { data: orderData } = useGetSellerOrdersQuery(
    { pageNumber: 0, pageSize: 8 },
    { skip: !session?.user, pollingInterval: 30_000 },
  );
  const { data: reviewData } = useGetSellerReviewsQuery(
    { pageNumber: 0, pageSize: 8 },
    { skip: !session?.user, pollingInterval: 30_000 },
  );
  const { data: conversations = [] } = useGetConversationsQuery(undefined, {
    skip: !session?.user,
    pollingInterval: 30_000,
  });
  const [seenAt, setSeenAt] = React.useState(0);

  const notifications: SellerNotification[] = [
    ...(orderData?.content ?? []).map((order) => ({
      id: `order-${order.uuid}`,
      title: "New customer order",
      detail: `${(order.items ?? []).reduce((sum, item) => sum + item.quantity, 0)} item(s) · $${Number(order.totalPrice).toFixed(2)}`,
      at: order.createdAt,
      href: "/seller-dashboard/orders",
      kind: "order" as const,
    })),
    ...(reviewData?.content ?? []).map((review) => ({
      id: `review-${review.uuid}`,
      title: "New product review",
      detail: `${review.rating}/5 · ${review.listing?.title || "Your product"}`,
      at: review.createdAt,
      href: "/seller-dashboard/products/comment",
      kind: "review" as const,
    })),
    ...conversations
      .filter((conversation) => conversation.unreadCount > 0)
      .map((conversation) => ({
        id: `message-${conversation.uuid}`,
        title: `Message from ${conversation.otherUserName || "Customer"}`,
        detail:
          conversation.lastMessage ||
          `${conversation.unreadCount} unread message(s)`,
        at: conversation.lastMessageAt || new Date().toISOString(),
        href: "/seller-dashboard/message",
        kind: "message" as const,
      })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const eventUnread = notifications.filter(
    (notification) =>
      notification.kind !== "message" &&
      new Date(notification.at).getTime() > seenAt,
  ).length;
  const messageUnread = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0,
  );
  const unreadCount = eventUnread + messageUnread;

  /* This menu is "who am I signed in as" — its actions (Profile, Log out) are
     personal, so it stays the person. The shop it manages is identified in the
     sidebar header instead; blending the two here produced a store logo sitting
     next to a person's name. */
  const userAvatar = profile?.avatarUrl || session?.user?.image || "";
  const displayName =
    profile?.fullName ||
    (profile?.firstName
      ? `${profile.firstName} ${profile?.lastName || ""}`.trim()
      : "") ||
    session?.user?.name ||
    "Your account";
  const firstName = displayName.split(" ")[0];
  const storeName = sellerProfile?.businessName || sellerApp?.businessName || "";
  const userEmail = profile?.email || session?.user?.email || "";
  const fallbackInitial = (displayName[0] || "S").toUpperCase();
  const iconButton =
    "size-10 rounded-full border border-[#ece6db] bg-white text-[#59534c] shadow-none hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-card";
  const pageTitle = (() => {
    if (pathname === "/seller-dashboard/quick-order") return "Quick Order";
    if (pathname.startsWith("/seller-dashboard/orders")) return "Orders";
    if (pathname === "/seller-dashboard/products/drafts")
      return "Draft Products";
    if (pathname === "/seller-dashboard/products/released")
      return "Released Products";
    if (pathname === "/seller-dashboard/products/new") return "New Product";
    if (pathname.startsWith("/seller-dashboard/products/new"))
      return "Edit Product";
    if (pathname === "/seller-dashboard/products/dashboard")
      return "Product Overview";
    if (pathname === "/seller-dashboard/products/comment") return "Comments";
    if (pathname.startsWith("/seller-dashboard/customer")) return "Customers";
    if (pathname.startsWith("/seller-dashboard/message"))
      return "Message Center";
    if (pathname.startsWith("/seller-dashboard/shop")) return "Store Settings";
    return null;
  })();

  return (
    <header className="sticky top-0 z-50 flex min-h-[70px] shrink-0 items-center gap-3 border-b border-[#eeeeee] bg-white px-4 py-2.5 dark:border-border dark:bg-background sm:px-6 lg:px-5">
      <SidebarTrigger className="shrink-0 md:hidden" />

      <div className="min-w-0">
        <h1 className="truncate text-[18px] font-bold leading-tight text-[#352b27] dark:text-foreground sm:text-[20px]">
          {pageTitle ?? (
            <>
              Welcome Back, {firstName} <span aria-hidden="true">👋</span>
            </>
          )}
        </h1>
        {/* Which shop these actions apply to — the person is in the menu. */}
        {storeName && (
          <p className="truncate text-[12px] text-muted-foreground">
            Managing {storeName}
          </p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label className="relative hidden w-[250px] lg:block xl:w-[250px]">
          <span className="sr-only">
            {isMessagePage ? "Search messages" : "Search products"}
          </span>
          <input
            type="search"
            placeholder={
              isMessagePage ? "Search messages..." : "Search Product..."
            }
            className="h-10 w-full rounded-full border border-[#ece6db] bg-white pl-4 pr-10 text-[12px] text-foreground outline-none transition-shadow placeholder:text-[#8d877f] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-border dark:bg-card"
          />
          <Search
            className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-[#292522] dark:text-foreground"
            strokeWidth={1.8}
          />
        </label>

        <DropdownMenu
          onOpenChange={(open) => {
            if (open) setSeenAt(Date.now());
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`${unreadCount} notifications`}
              className={`${iconButton} relative`}
            >
              <Bell className="size-[18px]" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white dark:ring-card">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[340px] rounded-2xl p-2 shadow-xl"
          >
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
              <span className="font-bold">Notifications</span>
              <span className="text-xs font-normal text-muted-foreground">
                {unreadCount} unread
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 8).map((notification) => {
                const Icon =
                  notification.kind === "order"
                    ? ShoppingBag
                    : notification.kind === "review"
                      ? Star
                      : MessageCircle;
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    asChild
                    className="cursor-pointer rounded-xl p-0"
                  >
                    <Link
                      href={notification.href}
                      className="flex items-start gap-3 px-3 py-3"
                    >
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {notification.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {notification.detail}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {relativeTime(notification.at)}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle color theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={iconButton}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-[18px]" strokeWidth={1.8} />
          ) : (
            <Moon className="size-[18px]" strokeWidth={1.8} />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Open seller account menu"
              className="h-11 gap-1 rounded-full px-1.5 hover:bg-primary/10"
            >
              <Avatar className="size-9 border border-[#e4dacd]">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="size-4 text-[#5e5851] dark:text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 rounded-2xl p-2 shadow-xl"
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <p className="text-sm font-bold leading-none">{displayName}</p>
              {userEmail && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
              <Link href="/account">
                <User className="mr-2 size-4" />
                Profile Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
              <Link href="/subscriptions">
                <Sparkles className="mr-2 size-4 text-yellow-500" />
                Subscription Plans
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
              <Link href="/seller-dashboard/shop">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutFromKeycloak("/")}
              className="cursor-pointer rounded-xl font-semibold text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
