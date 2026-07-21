"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toogle";
import {
  SearchIcon,
  MenuIcon,
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  MapPinIcon,
  ChevronDownIcon,
} from "lucide-react";

const NAV_LINKS = [
  { title: "HOME", href: "/home" },
  { title: "OFFERS", href: "/products?sort=price_asc" },
  { title: "BRANDS", href: "/products" },
  { title: "STORES", href: "/products" },
];

const Navbar = () => {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b shadow-sm" style={{ backgroundColor: "#E7E3F9" }}>
      {/* ── top bar ── */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        {/* logo / brand */}
        <Link
          href="/home"
          className="flex-shrink-0 text-xl font-extrabold tracking-tight leading-none"
          aria-label="Phsar Digital home"
        >
          <span className="text-foreground"></span>
          <span className="text-primary">Phsar</span>
          <span className="text-foreground"> Digital</span>
        </Link>

        {/* search bar */}
        <div className="relative mx-4 flex flex-1 items-center">
          <SearchIcon
            size={16}
            className="absolute left-3 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Products..."
            className="w-full rounded-full border border-white/60 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-white/80 transition shadow-sm"
            aria-label="Search products"
          />
        </div>

        {/* right actions */}
        <div className="flex items-center gap-1">
          {/* wishlist */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/saved" aria-label="Saved items">
              <HeartIcon size={20} />
            </Link>
          </Button>

          {/* cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart" aria-label="Cart">
              <ShoppingCartIcon size={20} />
              {/* badge — replace 9 with real count from store */}
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                9
              </span>
            </Link>
          </Button>

          {/* account */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/auth/login" aria-label="Account">
              <UserIcon size={20} />
            </Link>
          </Button>

          <ModeToggle />

          {/* mobile hamburger */}
          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden" asChild>
              <Button variant="outline" size="icon" aria-label="Menu">
                <MenuIcon size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuGroup>
                {NAV_LINKS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── bottom nav bar ── */}
      <nav className="hidden md:block border-t border-white/30" style={{ backgroundColor: "#E7E3F9" }}>
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 sm:px-6">
          {/* category dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 font-semibold"
                aria-label="Select Category"
              >
                <MenuIcon size={15} />
                Select Category
                <ChevronDownIcon size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="start">
              <DropdownMenuGroup>
                {[
                  "Electronic & Appliances",
                  "House & Land",
                  "Phone & Tablets",
                  "Furniture & Decor",
                  "Fashion & Beauty",
                  "Computer & Accessories",
                  "Home & Kitchen",
                  "Bag & Accessories",
                  "Cars & Vehicles",
                ].map((cat) => (
                  <DropdownMenuItem key={cat} asChild>
                    <Link href={`/category/${cat.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`}>
                      {cat}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* nav links */}
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          ))}

          {/* all products */}
          <Link
            href="/products"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            All PRODUCTS
          </Link>

          {/* location */}
          <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon size={14} className="text-primary " />
            <span>Phnom Penh</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
