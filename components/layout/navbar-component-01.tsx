"use client";

import Link from "next/link";
import { useState } from "react";
import PhsarDigitalLogo from "@/assets/svg/phsardigitalLogo";
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
  LogOut,
  MessageSquare,
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
import { useSession, logoutFromKeycloak } from "@/lib/auth-client";
import { useGetMeQuery } from "@/lib/api/authApi";
import {
  useGetSellerApplicationQuery,
  useGetSellerProfileQuery,
} from "@/lib/api/sellerApi";
import { useGetCategoriesQuery } from "@/lib/api/homeApi";
import LoginButton from "@/components/auth/LoginButton";
import RegisterButton from "@/components/auth/RegisterButton";
import { ThemeToggle } from "@/components/themeToggle";
import { NAV_PILL, NAV_RAIL_PILL } from "@/components/layout/nav-pill";
import { cn, displayImageUrl } from "@/lib/utils";
import { useCartFavorites } from "@/lib/context/cart-favorites-context";

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
  const { cartCount, savedCount } = useCartFavorites();

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
  const { data: apiCategories } = useGetCategoriesQuery();

  const isLoggedIn = Boolean(session?.user);
  const isSeller = Boolean(
    (profile as any)?.isSeller ||
    sellerProfile?.id ||
    sellerApp?.status === "APPROVED",
  );
  const isPendingSeller = sellerApp?.status === "PENDING";

  // Keep the account identity separate from the seller/store identity. Store
  // logos are often wide and do not belong in the circular user avatar.
  const userAvatar = profile?.avatarUrl || session?.user?.image || "";
  const storeName = sellerProfile?.businessName || sellerApp?.businessName;

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
      <div className="border-b border-[#EDEBF3] bg-white transition-colors dark:border-border dark:bg-card">
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
              <PhsarDigitalLogo
                className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
                aria-hidden="true"
              />
              <span className="hidden text-[15px] font-bold text-[#241F35] sm:inline sm:text-[17px] dark:text-foreground">
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
                className="w-full rounded-full border border-[#E2DFEC] bg-[#F8F7FB] py-[9px] pl-[14px] pr-[40px] text-[13px] text-foreground outline-none placeholder:text-muted-foreground dark:border-border dark:bg-muted"
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
              <ThemeToggle />

              {isPendingSeller && !isSeller && (
                <Link
                  href="/account/seller-application"
                  aria-label="Store Pending"
                  title="Seller application under review"
                  className={cn(
                    NAV_PILL,
                    "border border-amber-300 bg-amber-100 text-amber-800 transition-colors hover:bg-amber-200",
                  )}
                >
                  <Clock size={13} className="text-amber-600" />
                  <span className="hidden md:inline">Store Pending</span>
                </Link>
              )}

              {/* Action Icons — only when logged in */}
              {isLoggedIn && (
                <>
                  <Link
                    href="/saved"
                    aria-label="Saved"
                    className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary shadow-sm transition hover:scale-105 hover:border-primary/25 hover:bg-primary/15 dark:border-white/10 dark:bg-white/[0.07] dark:text-violet-400 dark:hover:bg-white/10"
                  >
                    <Heart className="size-[17px]" strokeWidth={2} />
                    {savedCount > 0 && (
                      <span
                        className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in"
                        style={{ background: BRAND }}
                      >
                        {savedCount > 99 ? "99+" : savedCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    aria-label="Cart"
                    className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary shadow-sm transition hover:scale-105 hover:border-primary/25 hover:bg-primary/15 dark:border-white/10 dark:bg-white/[0.07] dark:text-violet-400 dark:hover:bg-white/10"
                  >
                    <ShoppingCart className="size-[17px]" strokeWidth={2} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in"
                        style={{ background: BRAND }}
                      >
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Account / Login Dropdown */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Account Menu"
                      title={`Account (${session?.user?.name || "User"})`}
                      className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 transition hover:scale-105 overflow-hidden ring-2 ring-[#6C4CD8]/20 focus:outline-none cursor-pointer"
                      style={{ background: "#F1EFFA" }}
                    >
                      {userAvatar ? (
                        <img
                          src={displayImageUrl(userAvatar)}
                          alt="User Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={15} color={BRAND} />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-72 rounded-2xl border border-[#E2DFEC] bg-white p-2.5 text-[#1A1330] shadow-2xl"
                  >
                    <DropdownMenuLabel className="p-3 font-normal">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                          {userAvatar ? (
                            <img
                              src={displayImageUrl(userAvatar)}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <User className="size-5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-[#1A1330]">
                            {session?.user?.name || "My Account"}
                          </p>
                          {session?.user?.email && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuGroup className="space-y-1 py-1">
                      <DropdownMenuItem
                        asChild
                        className="h-12 cursor-pointer rounded-xl px-3 text-sm font-semibold text-[#1A1330] focus:bg-[#F1EFFA] focus:text-[#6C4CD8]"
                      >
                        <Link
                          href="/account"
                          className="flex w-full items-center gap-3"
                        >
                          <User className="size-[18px] text-primary" />
                          <span className="text-current">Account Details</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className="h-12 cursor-pointer rounded-xl px-3 text-sm font-semibold text-[#1A1330] focus:bg-[#F1EFFA] focus:text-[#6C4CD8]"
                      >
                        <Link
                          href="/messages"
                          className="flex w-full items-center gap-3"
                        >
                          <MessageSquare className="size-[18px] text-primary" />
                          <span className="text-current">Messages</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className="h-12 cursor-pointer rounded-xl px-3 text-sm font-semibold text-[#1A1330] focus:bg-[#F1EFFA] focus:text-[#6C4CD8]"
                      >
                        <Link
                          href="/orders"
                          className="flex w-full items-center gap-3"
                        >
                          <ShoppingBag className="size-[18px] text-primary" />
                          <span className="text-current">Orders</span>
                        </Link>
                      </DropdownMenuItem>

                      {isSeller && (
                        <DropdownMenuItem
                          asChild
                          className="h-12 cursor-pointer rounded-xl bg-primary/5 px-3 text-sm font-bold text-primary focus:bg-primary/15 focus:text-primary"
                        >
                          <Link
                            href="/seller-dashboard/home"
                            className="flex w-full items-center gap-3"
                          >
                            <Store className="size-[18px]" />
                            <span className="text-current">
                              Seller Dashboard
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => logoutFromKeycloak("/")}
                      variant="destructive"
                      className="h-12 cursor-pointer rounded-xl px-3 text-sm font-bold"
                    >
                      <LogOut className="mr-1 size-[18px]" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex flex-shrink-0 items-center gap-2">
                  {/* the drawer carries these on small screens */}
                  <RegisterButton className="hidden sm:inline-flex" />
                  <LoginButton />
                </div>
              )}
            </div>
          </div>

          {/* row 2: search - mobile only */}
          <div className="relative mt-2 block sm:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Products..."
              aria-label="Search products"
              className="w-full rounded-full border border-[#E2DFEC] bg-[#F8F7FB] py-[9px] pl-[14px] pr-[40px] text-[13px] text-foreground outline-none placeholder:text-muted-foreground dark:border-border dark:bg-muted"
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
                className={cn(NAV_RAIL_PILL, "rounded-md text-white")}
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
                {categoriesList.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/products?category=${cat.slug}`}>
                      {cat.name}
                    </Link>
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

          {/* Quick link to Seller Registration / Dashboard in nav rail — only when logged in */}
          {isLoggedIn &&
            (isSeller ? (
              <Link
                href="/seller-dashboard/home"
                className={cn(
                  NAV_RAIL_PILL,
                  "bg-white font-bold text-[#6C4CD8] shadow-xs transition-colors hover:bg-white/90",
                )}
              >
                <Store size={13} />
                {storeName || "Seller Dashboard"}
              </Link>
            ) : (
              <Link
                href="/account/seller-application"
                className={cn(
                  NAV_RAIL_PILL,
                  "text-white transition-colors hover:bg-white/20",
                )}
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <Store size={13} />
                Become a Seller
              </Link>
            ))}

          <div
            className={cn(NAV_RAIL_PILL, "text-white")}
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
          style={{
            background: BRAND,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {/* Account Quick Status inside Mobile Drawer */}
            <div className="mb-2 rounded-xl bg-white/10 p-3 text-white">
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img
                    src={displayImageUrl(userAvatar)}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                    <User size={20} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold">
                    {session?.user?.name || "Guest Account"}
                  </p>
                  <p className="text-xs text-white/70">
                    {session?.user?.email || "Sign in to manage orders"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={isLoggedIn ? "/account" : "/auth/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#6C4CD8]"
                >
                  {isLoggedIn ? "My Account" : "Sign In"}
                </Link>

                {!isLoggedIn && (
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-8 flex-1 items-center justify-center rounded-lg border border-white/60 text-xs font-bold text-white"
                  >
                    Register
                  </Link>
                )}
                {isSeller && (
                  <Link
                    href="/seller-dashboard/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-8 flex-1 items-center justify-center rounded-lg bg-emerald-400 text-xs font-bold text-[#1A1330]"
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
