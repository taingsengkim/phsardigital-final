import Link from "next/link";
import {
  MonitorIcon,
  HomeIcon,
  SmartphoneIcon,
  SofaIcon,
  SparklesIcon,
  LaptopIcon,
  UtensilsIcon,
  ShoppingBagIcon,
  CarIcon,
} from "lucide-react";

const CATEGORIES = [
  {
    label: "Electronic & Appliances",
    icon: MonitorIcon,
    href: "/category/electronic-and-appliances",
  },
  {
    label: "House & Land",
    icon: HomeIcon,
    href: "/category/house-and-land",
  },
  {
    label: "Phone & Tablets",
    icon: SmartphoneIcon,
    href: "/category/phone-and-tablets",
  },
  {
    label: "Furniture & Decor",
    icon: SofaIcon,
    href: "/category/furniture-and-decor",
  },
  {
    label: "Fashion & Beauty",
    icon: SparklesIcon,
    href: "/category/fashion-and-beauty",
  },
  {
    label: "Computer & Accessories",
    icon: LaptopIcon,
    href: "/category/computer-and-accessories",
  },
  {
    label: "Home & Kitchen",
    icon: UtensilsIcon,
    href: "/category/home-and-kitchen",
  },
  {
    label: "Bag & Accessories",
    icon: ShoppingBagIcon,
    href: "/category/bag-and-accessories",
  },
  {
    label: "Cars & Vehicles",
    icon: CarIcon,
    href: "/category/cars-and-vehicles",
  },
];

export default function CategoryIconRow() {
  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-start gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-2 text-center hover:bg-muted transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="max-w-[72px] text-[10px] leading-tight text-muted-foreground group-hover:text-foreground transition-colors text-center">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
