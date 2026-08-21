"use client";

import Link from "next/link";
import { Bell, Flag, Plus, Settings, User, Sparkles, LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
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

export function NavTopbar() {
  const { data: session } = useSession();
  const { data: profile } = useGetMeQuery(undefined, {
    skip: !session?.user,
  });
  const { data: sellerProfile } = useGetSellerProfileQuery(undefined, {
    skip: !session?.user,
  });
  const { data: sellerApp } = useGetSellerApplicationQuery(undefined, {
    skip: !session?.user,
  });

  const userAvatar =
    profile?.avatarUrl ||
    sellerProfile?.logoUri ||
    sellerApp?.logoUri ||
    session?.user?.image ||
    "";

  const displayName =
    profile?.fullName ||
    (profile?.firstName
      ? `${profile.firstName} ${profile?.lastName || ""}`.trim()
      : "") ||
    sellerProfile?.businessName ||
    sellerApp?.businessName ||
    session?.user?.name ||
    "Seller Account";

  const userEmail = profile?.email || session?.user?.email || "";
  const fallbackInitial = (displayName[0] || "S").toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex h-18 shrink-0 items-center gap-3 border-b bg-background px-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:px-6 lg:px-9">
      <SidebarTrigger className="shrink-0 md:hidden" />

      <div className="relative w-full max-w-[340px]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path
            d="m16 16 4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <Input
          type="search"
          placeholder="Search or type a command"
          aria-label="Search or type a command"
          className="h-11 rounded-xl border-0 bg-muted/70 pl-10 pr-[62px] text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#7c63e8]/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <Button
          asChild
          className="h-11 rounded-xl bg-[#7c63e8] px-3 text-white shadow-none hover:bg-[#6c52df] sm:px-5 font-bold"
        >
          <Link href="/seller-dashboard/products/new">
            <Plus className="size-5" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Flagged items"
          className="relative size-10 text-muted-foreground hover:text-foreground"
        >
          <Flag className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ef6f61] ring-2 ring-background" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative size-10 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ef6f61] ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open seller account menu"
              className="ml-1 size-11 rounded-full p-0 hover:bg-transparent"
            >
              <Avatar className="size-10 border-2 border-[#ffc3a8] shadow-sm">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-[#6C4CD8] text-white text-sm font-semibold">
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 p-2 rounded-2xl shadow-xl"
          >
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-gray-900">
                  {displayName}
                </p>
                {userEmail && (
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {userEmail}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/account">
                <User className="mr-2 size-4 text-gray-500" />
                Profile Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/subscriptions">
                <Sparkles className="mr-2 size-4 text-yellow-500" />
                Subscription Plans
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href="/account">
                <Settings className="mr-2 size-4 text-gray-500" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutFromKeycloak("/")}
              className="cursor-pointer text-red-600 font-semibold rounded-xl focus:bg-red-50 focus:text-red-700"
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
