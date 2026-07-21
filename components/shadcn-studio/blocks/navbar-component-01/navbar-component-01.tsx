"use client";

import Link from "next/link";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BRAND   = "#6C4CD8";
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
  const savedCount = 2;
  const cartCount  = 2;

  return (
    <header className="sticky top-0 z-50">

      {/* ── top bar: white ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EDEBF3" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* logo */}
          <Link
            href="/home"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}
            aria-label="Phsar Digital home"
          >
            <div
              style={{
                width: 34, height: 34, borderRadius: 999,
                background: BRAND,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 15,
              }}
            >
              P
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#241F35" }}>
              Phsar Digital
            </span>
          </Link>

          {/* search */}
          <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Products..."
              aria-label="Search products"
              style={{
                width: "100%",
                padding: "9px 40px 9px 14px",
                borderRadius: 999,
                border: "1px solid #E2DFEC",
                fontSize: 13,
                background: "#F8F7FB",
                outline: "none",
              }}
            />
            <Search
              size={15}
              color={BRAND}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* icon buttons */}
          {[
            { Icon: Heart,       label: "Saved",   badge: savedCount, href: "/saved"      },
            { Icon: ShoppingBag, label: "Orders",  badge: 0,          href: "/orders"     },
            { Icon: User,        label: "Account", badge: 0,          href: "/auth/login" },
            { Icon: ShoppingCart,label: "Cart",    badge: cartCount,  href: "/cart"       },
          ].map(({ Icon, label, badge, href }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              style={{
                position: "relative",
                background: "#F1EFFA",
                borderRadius: 999,
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={BRAND} />
              {badge > 0 && (
                <span
                  style={{
                    position: "absolute", top: -4, right: -4,
                    background: BRAND, color: "#fff",
                    fontSize: 10, fontWeight: 700,
                    borderRadius: 999, width: 16, height: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ── purple nav rail ── */}
      <div style={{ background: BRAND }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* category dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.15)",
                  border: "none", color: "#fff",
                  borderRadius: 6, padding: "6px 12px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  flexShrink: 0,
                }}
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
                    <Link
                      href={`/category/${cat.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`}
                    >
                      {cat}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* nav links */}
          {NAV_LINKS.map((name) => (
            <Link
              key={name}
              href={name === "Home" ? "/home" : name === "All Products" ? "/products" : `/products?tag=${name.toLowerCase()}`}
              style={{
                color: "rgba(255,255,255,0.92)",
                fontSize: 12, fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          {/* location pill */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 5,
              color: "#fff", fontSize: 12, fontWeight: 600,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 999, padding: "5px 12px",
              flexShrink: 0,
            }}
          >
            <MapPin size={12} />
            Phnom Penh
          </div>
        </div>
      </div>

    </header>
  );
}
