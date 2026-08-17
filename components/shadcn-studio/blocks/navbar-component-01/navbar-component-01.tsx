"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Heart, ShoppingBag, ShoppingCart, MapPin, Menu, ChevronsUpDown, LogOut, User, Settings, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SvgComponentSvg from "@/assets/svg/phsardigitalLogo";
import LoginButton from "@/components/auth/LoginButton";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const BRAND = "#6C4CD8";

const NAV_LINKS = ["Home", "Offers", "Brands", "Stores", "All Products"];
const CATEGORIES = [
  "Electronic & Appliances",
  "House & Land",
  "Phone & Tablets",
  "Furniture & Decor",
  "Fashion & Beauty",
  "Computer & Accessories",
  "Home & Kitchen",
  "Bag & Accessories",
  "Cars & Vehicles",
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

export default function Navbar() {
  const [search, setSearch] = useState("");
  const savedCount = 2;
  const cartCount = 2;

  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;
  const user = session?.user;

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* â”€â”€ top bar: white â”€â”€ */}
      <div className="border-b border-[#EDEBF3] bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-3">
          {/* logo */}
          <Link
            href="/home"
            className="flex shrink-0 items-center gap-2 text-decoration-none group transition-transform hover:scale-105 active:scale-95"
            aria-label="Phsar Digital home"
          >
            <SvgComponentSvg className="h-8 w-8 text-[#6C4CD8]" />
            <span className="text-xl font-bold text-[#241F35]">
              Phsar Digital
            </span>
          </Link>

          {/* search */}
          <div className="relative w-full max-w-[480px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Products..."
              aria-label="Search products"
              className="w-full rounded-full border border-[#E2DFEC] bg-[#F8F7FB] py-2.5 pl-4 pr-10 text-sm outline-none transition-all focus:border-[#6C4CD8] focus:bg-white focus:ring-4 focus:ring-[#6C4CD8]/10"
            />
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C4CD8]"
            />
          </div>

          <div className="flex-1" />

          {/* Saved â€” only when logged in */}
          {isLoggedIn && (
            <Link
              href="/saved"
              aria-label="Saved"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EFFA] transition-all hover:bg-[#E5E0F5] hover:scale-105 active:scale-95 group"
            >
              <Heart size={18} className="text-[#6C4CD8] transition-transform group-hover:scale-110" />
              {savedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6C4CD8] text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                  {savedCount}
                </span>
              )}
            </Link>
          )}

          {/* Orders â€” only when logged in */}
          {isLoggedIn && (
            <Link
              href="/orders"
              aria-label="Orders"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EFFA] transition-all hover:bg-[#E5E0F5] hover:scale-105 active:scale-95 group"
            >
              <ShoppingBag size={18} className="text-[#6C4CD8] transition-transform group-hover:scale-110" />
            </Link>
          )}

          {/* Profile dropdown or Login */}
          {isPending ? (
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#EDE9FB] opacity-60" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="profile-menu-btn"
                  aria-label="Profile menu"
                  className="flex shrink-0 items-center gap-2 rounded-full p-1 transition-all hover:bg-[#F8F7FB] active:scale-95"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? "Profile"}
                      className="h-9 w-9 rounded-full border-2 border-[#6C4CD8] object-cover shadow-sm transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#6C4CD8]/30 bg-[#6C4CD8] text-sm font-bold text-white shadow-sm transition-transform hover:scale-105">
                      {getInitials(user?.name, user?.email)}
                    </div>
                  )}
                  <ChevronsUpDown size={14} className="text-[#6B7280] transition-transform group-hover:rotate-180" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 mt-2" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-[#1A1330]">
                      {user?.name || "My Account"}
                    </span>
                    <span className="truncate text-xs text-[#9B94B4]">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 cursor-pointer transition-colors hover:text-[#6C4CD8]">
                      <User size={15} />
                      <span className="text-sm">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer transition-colors hover:text-[#6C4CD8]">
                      <Package size={15} />
                      <span className="text-sm">My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/settings" className="flex items-center gap-2 cursor-pointer transition-colors hover:text-[#6C4CD8]">
                      <Settings size={15} />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-rose-600 transition-colors focus:bg-rose-50 focus:text-rose-700"
                >
                  <LogOut size={15} />
                  <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton />
          )}

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1EFFA] transition-all hover:bg-[#E5E0F5] hover:scale-105 active:scale-95 group ml-2"
          >
            <ShoppingCart size={18} className="text-[#6C4CD8] transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6C4CD8] text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* â”€â”€ purple nav rail â”€â”€ */}
      <div className="bg-[#6C4CD8] shadow-inner">
        <div className="mx-auto flex max-w-[1240px] items-center gap-6 px-6 py-2.5">
          {/* category dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex shrink-0 items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/25 active:scale-95"
                aria-label="Select Category"
              >
                <Menu size={16} />
                Select Category
                <ChevronsUpDown size={14} className="opacity-70 transition-transform group-hover:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2" align="start">
              <DropdownMenuGroup>
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat} asChild>
                    <Link
                      href={`/category/${cat.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`}
                      className="cursor-pointer text-sm transition-colors hover:text-[#6C4CD8]"
                    >
                      {cat}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* nav links */}
          <div className="flex items-center gap-5">
            {NAV_LINKS.map((name) => (
              <Link
                key={name}
                href={
                  name === "Home"
                    ? "/home"
                    : name === "All Products"
                      ? "/products"
                      : name === "Offers"
                        ? "/products?sort=price_asc"
                        : `#`
                }
                className="relative text-sm font-medium text-white/90 whitespace-nowrap transition-colors hover:text-white after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all hover:after:w-full"
              >
                {name}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          {/* location pill */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-inner backdrop-blur-sm transition-colors hover:bg-white/20 cursor-default">
            <MapPin size={14} className="opacity-80" />
            Phnom Penh
          </div>
        </div>
      </div>
    </header>
  );
}
