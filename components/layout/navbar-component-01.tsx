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
  ChevronDown,
  ShoppingCart,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const iconButtons = [
    { Icon: Heart, label: "Saved", badge: savedCount, href: "/saved" },
    { Icon: ShoppingBag, label: "Orders", badge: 0, href: "/orders" },
    { Icon: User, label: "Account", badge: 0, href: "/auth/login" },
    { Icon: ShoppingCart, label: "Cart", badge: cartCount, href: "/cart" },
  ];

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
          {/* row 1: hamburger (mobile) + logo + icons */}
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

            {/* search - desktop/tablet only, inline */}
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

            {/* icon buttons */}
            <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
              {iconButtons.map(({ Icon, label, badge, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
                  style={{ background: "#F1EFFA" }}
                >
                  <Icon size={15} color={BRAND} />
                  {badge > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: BRAND }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* row 2: search - mobile only, full width */}
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

      {/* ── purple nav rail: desktop/tablet only ── */}
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
                <ChevronDown size={12} />
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
              className="whitespace-nowrap text-[12px] font-semibold text-white/90 no-underline"
            >
              {name}
            </Link>
          ))}

          <div className="flex-1" />

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
            <div
              className="mb-1 flex items-center gap-1.5 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70"
            >
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

            <div
              className="mb-1 flex items-center gap-1.5 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70"
            >
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