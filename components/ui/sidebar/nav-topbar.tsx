"use client"

import Link from "next/link"
import { Bell, Flag, Plus, Settings, User } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logoutFromKeycloak } from "@/lib/auth-client"

export function NavTopbar() {
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
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
          className="h-11 rounded-xl bg-[#7c63e8] px-3 text-white shadow-none hover:bg-[#6c52df] sm:px-5"
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
              <Avatar className="size-10 border-2 border-[#ffc3a8]">
                <AvatarImage src="/picture/lisa.PNG" alt="Seller" />
                <AvatarFallback className="bg-[#ffd0bb] text-sm font-semibold">S</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutFromKeycloak("/")} className="cursor-pointer text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
