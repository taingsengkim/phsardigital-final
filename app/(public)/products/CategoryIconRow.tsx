import Link from "next/link";
import { LayoutGrid, Monitor, Smartphone, Sofa, Shirt, Laptop, UtensilsCrossed, ShoppingBag as BagIcon, Car } from "lucide-react";

const CATEGORIES = [
  { name: "Recommend",              slug: "",                         icon: LayoutGrid,      bg: "#EDEBF3", dark: false, active: true  },
  { name: "Electronic & Appliances",slug: "electronic-and-appliances",icon: Monitor,         bg: "#DCE3F0", dark: false, active: false },
  { name: "Phone & Tablets",        slug: "phone-and-tablets",        icon: Smartphone,      bg: "#2D3A50", dark: true,  active: false },
  { name: "Furniture & Decor",      slug: "furniture-and-decor",      icon: Sofa,            bg: "#EFE0D2", dark: false, active: false },
  { name: "Fashion & Beauty",       slug: "fashion-and-beauty",       icon: Shirt,           bg: "#F3DEE3", dark: false, active: false },
  { name: "Computer & Accessories", slug: "computer-and-accessories", icon: Laptop,          bg: "#D9E3EA", dark: false, active: false },
  { name: "Home & Kitchen",         slug: "home-and-kitchen",         icon: UtensilsCrossed, bg: "#E8E3D8", dark: false, active: false },
  { name: "Bag & Accessories",      slug: "bag-and-accessories",      icon: BagIcon,         bg: "#E2DCE8", dark: false, active: false },
  { name: "Cars & Vehicles",        slug: "cars-and-vehicles",        icon: Car,             bg: "#DCE3EE", dark: false, active: false },
];

export default function CategoryIconRow() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-6 pb-3">
      <div className="flex items-start justify-between gap-4 overflow-x-auto scrollbar-none pb-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const href = c.active ? "/products" : `/category/${c.slug}`;
          return (
            <Link
              key={c.name}
              href={href}
              className="group flex flex-shrink-0 flex-col items-center gap-2"
              style={{ width: 86 }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: 68, height: 68,
                  background: c.bg,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
                }}
              >
                <Icon size={26} color={c.dark ? "#fff" : "#3A3350"} />
              </div>
              <span className="text-center text-[13px] font-semibold leading-tight text-[#3A3350]">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
