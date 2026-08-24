"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, LogOut, Moon, Search, Settings, Sparkles, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, logoutFromKeycloak } from "@/lib/auth-client"
import { useGetMeQuery } from "@/lib/api/authApi"
import { useGetSellerProfileQuery, useGetSellerApplicationQuery } from "@/lib/api/sellerApi"

export function NavTopbar() {
  const pathname = usePathname()
  const isMessagePage = pathname.startsWith("/seller-dashboard/message")
  const { data: session } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: profile } = useGetMeQuery(undefined, { skip: !session?.user })
  const { data: sellerProfile } = useGetSellerProfileQuery(undefined, { skip: !session?.user })
  const { data: sellerApp } = useGetSellerApplicationQuery(undefined, { skip: !session?.user })

  const userAvatar = profile?.avatarUrl || sellerProfile?.logoUri || sellerApp?.logoUri || session?.user?.image || ""
  const displayName = profile?.fullName || (profile?.firstName ? `${profile.firstName} ${profile?.lastName || ""}`.trim() : "") || sellerProfile?.businessName || sellerApp?.storeDisplayName || sellerApp?.businessName || session?.user?.name || "Seller"
  const firstName = displayName.split(" ")[0]
  const userEmail = profile?.email || session?.user?.email || ""
  const fallbackInitial = (displayName[0] || "S").toUpperCase()
  const iconButton = "size-10 rounded-full border border-[#ece6db] bg-white text-[#59534c] shadow-none hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-card"

  return (
    <header className="sticky top-0 z-50 flex min-h-[70px] shrink-0 items-center gap-3 border-b border-[#eeeeee] bg-white px-4 py-2.5 dark:border-border dark:bg-background sm:px-6 lg:px-5">
      <SidebarTrigger className="shrink-0 md:hidden" />

      <div className="min-w-0">
        <h1 className="truncate text-[18px] font-bold leading-tight text-[#352b27] dark:text-foreground sm:text-[20px]">
          {isMessagePage ? <>Message center</> : <>Welcome Back, {firstName} <span aria-hidden="true">👋</span></>}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label className="relative hidden w-[250px] lg:block xl:w-[250px]">
          <span className="sr-only">{isMessagePage ? "Search messages" : "Search products"}</span>
          <input type="search" placeholder={isMessagePage ? "Search messages..." : "Search Product..."} className="h-10 w-full rounded-full border border-[#ece6db] bg-white pl-4 pr-10 text-[12px] text-foreground outline-none transition-shadow placeholder:text-[#8d877f] focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-border dark:bg-card" />
          <Search className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-[#292522] dark:text-foreground" strokeWidth={1.8} />
        </label>

        <Button type="button" variant="ghost" size="icon" aria-label="Notifications" className={`${iconButton} relative`}>
          <Bell className="size-[18px]" strokeWidth={1.8} />
          <span className="absolute right-[10px] top-[8px] size-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-card" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Toggle color theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className={iconButton}>
          {resolvedTheme === "dark" ? <Sun className="size-[18px]" strokeWidth={1.8} /> : <Moon className="size-[18px]" strokeWidth={1.8} />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label="Open seller account menu" className="h-11 gap-1 rounded-full px-1.5 hover:bg-primary/10">
              <Avatar className="size-9 border border-[#e4dacd]">
                {userAvatar ? <AvatarImage src={userAvatar} alt={displayName} /> : null}
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{fallbackInitial}</AvatarFallback>
              </Avatar>
              <ChevronDown className="size-4 text-[#5e5851] dark:text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl">
            <DropdownMenuLabel className="p-2 font-normal">
              <p className="text-sm font-bold leading-none">{displayName}</p>
              {userEmail && <p className="mt-1 truncate text-xs text-muted-foreground">{userEmail}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl"><Link href="/account"><User className="mr-2 size-4" />Profile Details</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl"><Link href="/subscriptions"><Sparkles className="mr-2 size-4 text-yellow-500" />Subscription Plans</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl"><Link href="/seller-dashboard/shop"><Settings className="mr-2 size-4" />Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutFromKeycloak("/")} className="cursor-pointer rounded-xl font-semibold text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut className="mr-2 size-4" />Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
