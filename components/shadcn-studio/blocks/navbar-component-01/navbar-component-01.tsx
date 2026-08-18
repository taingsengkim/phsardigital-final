"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  ShoppingCart,
  MapPin,
  Menu,
  ChevronsUpDown,
  LogOut,
  User,
  Settings,
  Package,
  Store,
  Clock,
  BadgeCheck,
} from "lucide-react";
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
import { useSession, logoutFromKeycloak } from "@/lib/auth-client";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useGetSellerApplicationQuery } from "@/lib/api/sellerApi";
import { useGetCategoriesQuery } from "@/lib/api/homeApi";

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
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

  const { data: profile } = useGetMeQuery(undefined, {
    skip: !isLoggedIn,
  });

  const { data: sellerApp } = useGetSellerApplicationQuery(undefined, {
    skip: !isLoggedIn,
  });

  const { data: apiCategories } = useGetCategoriesQuery();

  const isSeller = Boolean((profile as any)?.isSeller || sellerApp?.status === "APPROVED");
  const isPendingSeller = sellerApp?.status === "PENDING";

  const userAvatar = profile?.avatarUrl || sellerApp?.logoUri || user?.image || "";
  const storeName = sellerApp?.storeDisplayName || sellerApp?.businessName;

  const categoriesList =
    apiCategories && apiCategories.length > 0
      ? apiCategories.map((c: any) => ({
          name: c.name,
          slug: c.slug || String(c.id),
        }))
      : CATEGORIES.map((cat) => ({
          name: cat,
          slug: cat.toLowerCase().replace(/\s+/g, "-"),
        }));

  async function handleLogout() {
    await logoutFromKeycloak("/");
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* ── top bar: white ── */}
      <div className="border-b border-[#EDEBF3] bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-3">
          {/* logo */}
          <Link
            href="/home"
            className="flex shrink-0 items-center gap-2 text-decoration-none group transition-transform hover:scale-105 active:scale-95"
            aria-label="Phsar Digital home"
          >
            <Image
              src="/picture/logo.png"
              alt="Phsar Digital logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain rounded-xl"
            />
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

          {/* Seller Dashboard Shortcut in Header if User is Seller */}
          {isSeller && (
            <Link
              href="/seller-dashboard/home"
              aria-label="Seller Dashboard"
              title={storeName ? `Seller Dashboard (${storeName})` : "Seller Dashboard"}
              className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-95"
              style={{ background: "linear-gradient(90deg, #6C4CD8, #4F35A5)" }}
            >
              <Store size={15} />
              <span>{storeName || "Seller Dashboard"}</span>
            </Link>
          )}

          {isPendingSeller && !isSeller && (
            <Link
              href="/account/seller-application"
              aria-label="Store Pending"
              title="Seller application under review"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-200"
            >
              <Clock size={14} className="text-amber-600" />
              <span>Store Pending</span>
            </Link>
          )}

          {/* Saved — only when logged in */}
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

          {/* Orders — only when logged in */}
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
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={user?.name ?? storeName ?? "Profile"}
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

              <DropdownMenuContent className="w-60 mt-2 p-2" align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 py-1">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full border border-[#6C4CD8]/30 object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C4CD8] text-xs font-bold text-white">
                        {getInitials(user?.name, user?.email)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-bold text-[#1A1330]">
                        {isSeller ? storeName || user?.name : user?.name || "My Account"}
                      </span>
                      <span className="truncate text-xs text-[#9B94B4]">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2.5 cursor-pointer py-2 transition-colors hover:text-[#6C4CD8]">
                      <User size={16} className="text-[#6C4CD8]" />
                      <span className="text-sm font-medium">My Account</span>
                    </Link>
                  </DropdownMenuItem>

                  {isSeller && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller-dashboard/home" className="flex items-center gap-2.5 cursor-pointer py-2 transition-colors text-[#6C4CD8] font-bold">
                        <Store size={16} />
                        <span className="text-sm">Seller Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2.5 cursor-pointer py-2 transition-colors hover:text-[#6C4CD8]">
                      <Package size={16} className="text-[#8D86A8]" />
                      <span className="text-sm font-medium">My Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2.5 cursor-pointer py-2 transition-colors hover:text-[#6C4CD8]">
                      <Settings size={16} className="text-[#8D86A8]" />
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 cursor-pointer py-2 text-rose-600 transition-colors focus:bg-rose-50 focus:text-rose-700"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-semibold">Sign Out</span>
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

      {/* ── purple nav rail ── */}
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
                {categoriesList.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="cursor-pointer text-sm transition-colors hover:text-[#6C4CD8]"
                    >
                      {cat.name}
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

          {/* Seller Link in Nav Rail */}
          {isSeller ? (
            <Link
              href="/seller-dashboard/home"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-1 text-xs font-bold text-[#6C4CD8] transition hover:bg-white/90 shadow-sm"
            >
              <Store size={14} />
              <span>{storeName || "Seller Dashboard"}</span>
            </Link>
          ) : (
            <Link
              href="/account/seller-application"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white transition hover:bg-white/30"
            >
              <Store size={14} />
              <span>Become a Seller</span>
            </Link>
          )}

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
