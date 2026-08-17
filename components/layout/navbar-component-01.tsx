"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  MapPin,
  Menu,
  ChevronsUpDown,
  ShoppingCart,
  X,
  Store,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useGetSellerApplicationQuery } from "@/lib/api/sellerApi";

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

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const savedCount = 2;
  const cartCount = 2;

  const { data: session } = useSession();
  const { data: profile } = useGetMeQuery(undefined, {
    skip: !session?.user,
  });
  const { data: sellerApp } = useGetSellerApplicationQuery(undefined, {
    skip: !session?.user,
  });

  const isLoggedIn = Boolean(session?.user);
  const isSeller = Boolean((profile as any)?.isSeller || sellerApp?.status === "APPROVED");
  const isPendingSeller = sellerApp?.status === "PENDING";

  const userAvatar = profile?.avatarUrl || sellerApp?.logoUri || session?.user?.image || "";
  const storeName = sellerApp?.storeDisplayName || sellerApp?.businessName;

  const categoryHref = (cat: string) =>
    `/category/${cat.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`;

  const navLinkHref = (name: string) =>
    name === "Home"
      ? "/home"
      : name === "All Products"
        ? "/products"
        : name === "Offers"
          ? "/products?sort=price_asc"
          : "#";

  return (
    <header className="sticky top-0 z-50">
      {/* ── top bar: white ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EDEBF3" }}>
        <div className="mx-auto max-w-[1240px] px-4 py-2 sm:px-6 sm:py-3">
          {/* row 1: hamburger (mobile) + logo + search + icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* hamburger - mobile/tablet only */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full lg:hidden"
              style={{ background: "#F1EFFA" }}
            >
              {mobileMenuOpen ? (
                <X size={18} color={BRAND} />
              ) : (
                <Menu size={18} color={BRAND} />
              )}
            </button>

            {/* logo */}
            <Link
              href="/home"
              className="flex flex-shrink-0 items-center gap-2 no-underline"
              aria-label="Phsar Digital home"
            >
              <Image
                src="/logo.jpg"
                alt="Phsar Digital logo"
                width={32}
                height={32}
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
              <span
                className="hidden text-[15px] font-bold sm:inline sm:text-[17px]"
                style={{ color: "#241F35" }}
              >
                Phsar Digital
              </span>
            </Link>

            {/* search - desktop/tablet only */}
            <div className="relative hidden flex-1 sm:block sm:max-w-[480px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Products..."
                aria-label="Search products"
                className="w-full rounded-full border py-[9px] pl-[14px] pr-[40px] text-[13px] outline-none"
                style={{ borderColor: "#E2DFEC", background: "#F8F7FB" }}
              />
              <Search
                size={15}
                color={BRAND}
                className="absolute right-[14px] top-1/2 -translate-y-1/2"
              />
            </div>

            <div className="hidden flex-1 sm:block" />

            {/* icon buttons & User profile */}
            <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Seller Dashboard Shortcut if user is a seller */}
              {isSeller && (
                <Link
                  href="/seller-dashboard/home"
                  aria-label="Seller Dashboard"
                  title={storeName ? `Seller Dashboard (${storeName})` : "Seller Dashboard"}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-105 shadow-xs"
                  style={{ background: "linear-gradient(90deg, #6C4CD8, #4F35A5)" }}
                >
                  <Store size={14} />
                  <span className="hidden md:inline">{storeName || "My Store"}</span>
                </Link>
              )}

              {isPendingSeller && !isSeller && (
                <Link
                  href="/account/seller-application"
                  aria-label="Store Pending"
                  title="Seller application under review"
                  className="flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-200"
                >
                  <Clock size={13} className="text-amber-600" />
                  <span className="hidden md:inline">Store Pending</span>
                </Link>
              )}

              <Link
                href="/saved"
                aria-label="Saved"
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 transition hover:scale-105"
                style={{ background: "#F1EFFA" }}
              >
                <Heart size={15} color={BRAND} />
                {savedCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: BRAND }}
                  >
                    {savedCount}
                  </span>
                )}
              </Link>

              <Link
                href="/orders"
                aria-label="Orders"
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 transition hover:scale-105"
                style={{ background: "#F1EFFA" }}
              >
                <ShoppingBag size={15} color={BRAND} />
              </Link>

              {/* Account / Profile Button */}
              <Link
                href={isLoggedIn ? "/account" : "/auth/login"}
                aria-label="Account"
                title={isLoggedIn ? `Account (${session?.user?.name || "User"})` : "Sign In"}
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 transition hover:scale-105 overflow-hidden ring-2 ring-[#6C4CD8]/20"
                style={{ background: "#F1EFFA" }}
              >
                {isLoggedIn && userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={15} color={BRAND} />
                )}
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 transition hover:scale-105"
                style={{ background: "#F1EFFA" }}
              >
                <ShoppingCart size={15} color={BRAND} />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: BRAND }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* row 2: search - mobile only */}
          <div className="relative mt-2 block sm:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Products..."
              aria-label="Search products"
              className="w-full rounded-full border py-[9px] pl-[14px] pr-[40px] text-[13px] outline-none"
              style={{ borderColor: "#E2DFEC", background: "#F8F7FB" }}
            />
            <Search
              size={15}
              color={BRAND}
              className="absolute right-[14px] top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      {/* ── purple nav rail ── */}
      <div className="hidden lg:block" style={{ background: BRAND }}>
        <div className="mx-auto flex max-w-[1240px] items-center gap-5 px-6 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex flex-shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.15)" }}
                aria-label="Select Category"
              >
                <Menu size={13} />
                Select Category
                <ChevronsUpDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat} asChild>
                    <Link href={categoryHref(cat)}>{cat}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV_LINKS.map((name) => (
            <Link
              key={name}
              href={navLinkHref(name)}
              className="whitespace-nowrap text-[12px] font-semibold text-white/90 no-underline hover:text-white"
            >
              {name}
            </Link>
          ))}

          <div className="flex-1" />

          {/* Quick link to Seller Registration / Dashboard in nav rail */}
          {isSeller ? (
            <Link
              href="/seller-dashboard/home"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-bold text-[#6C4CD8] bg-white transition hover:bg-white/90 shadow-xs"
            >
              <Store size={13} />
              {storeName || "Seller Dashboard"}
            </Link>
          ) : (
            <Link
              href="/account/seller-application"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-white/20"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <Store size={13} />
              Become a Seller
            </Link>
          )}

          <div
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <MapPin size={12} />
            Phnom Penh
          </div>
        </div>
      </div>

      {/* ── mobile menu panel ── */}
      {mobileMenuOpen && (
        <div
          className="max-h-[70vh] overflow-y-auto lg:hidden"
          style={{ background: BRAND, borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {/* Account Quick Status inside Mobile Drawer */}
            <div className="mb-2 rounded-xl bg-white/10 p-3 text-white">
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                    <User size={20} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold">{session?.user?.name || "Guest Account"}</p>
                  <p className="text-xs text-white/70">{session?.user?.email || "Sign in to manage orders"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={isLoggedIn ? "/account" : "/auth/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-white py-1.5 text-center text-xs font-bold text-[#6C4CD8]"
                >
                  {isLoggedIn ? "My Account" : "Sign In"}
                </Link>
                {isSeller && (
                  <Link
                    href="/seller-dashboard/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-lg bg-emerald-400 py-1.5 text-center text-xs font-bold text-[#1A1330]"
                  >
                    Seller Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="mb-1 flex items-center gap-1.5 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Categories
            </div>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={categoryHref(cat)}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-2 text-[13px] font-medium text-white/90 no-underline active:bg-white/10"
              >
                {cat}
              </Link>
            ))}

            <div className="my-2 h-px bg-white/15" />

            <div className="mb-1 flex items-center gap-1.5 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Browse
            </div>
            {NAV_LINKS.map((name) => (
              <Link
                key={name}
                href={navLinkHref(name)}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-2 py-2 text-[13px] font-medium text-white/90 no-underline active:bg-white/10"
              >
                {name}
              </Link>
            ))}

            <div className="my-2 h-px bg-white/15" />

            <div
              className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <MapPin size={12} />
              Phnom Penh
            </div>
          </div>
        </div>
      )}
    </header>
  );
}