import Link from "next/link";
import { Monitor, Home as HomeIcon, Smartphone, Sofa, Shirt, Laptop, UtensilsCrossed, ShoppingBag as BagIcon, Car, LayoutGrid } from "lucide-react";

const CATEGORIES = [
  { name: "Recommend",                 icon: null,            bg: "#EDEBF3",  active: true },
  { name: "Electronic & Appliances",   icon: Monitor,         bg: "#DCE3F0",  active: false },
  { name: "House & Land",              icon: HomeIcon,        bg: "#E4EDE0",  active: false },
  { name: "Phone & Tablets",           icon: Smartphone,      bg: "#1F2A3D",  active: false },
  { name: "Furniture & Decor",         icon: Sofa,            bg: "#EFE0D2",  active: false },
  { name: "Fashion & Beauty",          icon: Shirt,           bg: "#F3DEE3",  active: false },
  { name: "Computer & Accessories",    icon: Laptop,          bg: "#D9E3EA",  active: false },
  { name: "Home & Kitchen",            icon: UtensilsCrossed, bg: "#E8E3D8",  active: false },
  { name: "Bag & Accessories",         icon: BagIcon,         bg: "#E2DCE8",  active: false },
  { name: "Cars & Vehicles",           icon: Car,             bg: "#DCE3EE",  active: false },
];

export default function CategoryIconRow() {
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 24px 10px" }}>
      <div
        style={{
          display: "flex",
          gap: 18,
          overflowX: "auto",
          justifyContent: "space-between",
        }}
        className="scrollbar-none"
      >
        {CATEGORIES.map((c) => {
          const Icon = c.icon ?? LayoutGrid;
          const isDark = c.bg === "#1F2A3D";

          return (
            <Link
              key={c.name}
              href={c.active ? "/products" : `/category/${c.name.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 78,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 56, height: 56,
                  borderRadius: 999,
                  background: c.bg,
                  display: "flex",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Icon size={20} color={isDark ? "#fff" : "#3A3350"} />
              </div>
              <span
                style={{
                  fontSize: 11, fontWeight: 600, textAlign: "center",
                  color: "#3A3350", lineHeight: 1.3,
                }}
              >
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
