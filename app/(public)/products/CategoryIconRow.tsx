"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Monitor,
  BookOpen,
  ShoppingBag,
  Heart,
  Home,
  Dumbbell,
  Baby,
  Car,
  Shirt,
  User,
  Tag,
  Loader2,
} from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/api/homeApi";

const FALLBACK_CATEGORIES = [
  { uuid: "6aaac71d-983c-4f72-abc2-50ead283b089", name: "Books & Stationery", slug: "books-and-stationery" },
  { uuid: "9e970d23-0c2e-4b48-bc16-caa4ec59df9b", name: "Electronics", slug: "electronics" },
  { uuid: "54fd238f-e326-4bf4-a3a8-fcf91dc8c80c", name: "Groceries & Essentials", slug: "groceries-and-essentials" },
  { uuid: "4b932659-fe14-42e7-841d-e8d2bf9e3ae5", name: "Health & Beauty", slug: "health-and-beauty" },
  { uuid: "c1cd451d-2222-46b2-a837-b0abecb2e2cb", name: "Home & Living", slug: "home-and-living" },
  { uuid: "981705a1-fea0-4a99-9a7f-9064ba55bd6c", name: "Sports & Outdoors", slug: "sports-and-outdoors" },
  { uuid: "993327fe-b998-402e-a4c8-169841bc6d84", name: "Toys & Baby Care", slug: "toys-and-baby-care" },
  { uuid: "c7e88b48-dce6-4722-abf4-9a5c724edb4f", name: "Vehicles", slug: "vehicles" },
  { uuid: "e17ad20e-db1a-4976-8b26-20755eee784f", name: "Women's Fashion", slug: "womens-fashion" },
  { uuid: "5d6c4acb-bbdb-4c88-8596-c5b7576b4784", name: "Men's Fashion", slug: "mens-fashion" },
];

function getCategoryMeta(slug: string, name: string) {
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (s.includes("book") || n.includes("book") || n.includes("stationery")) {
    return { icon: BookOpen, bg: "#E8E2F0", textColor: "#3A3350" };
  }
  if (s.includes("electronic") || n.includes("electronic") || s.includes("phone") || s.includes("computer")) {
    return { icon: Monitor, bg: "#DCE3F0", textColor: "#2D3A50" };
  }
  if (s.includes("grocer") || n.includes("grocer") || s.includes("essential")) {
    return { icon: ShoppingBag, bg: "#E6F0DC", textColor: "#2E3A20" };
  }
  if (s.includes("health") || n.includes("health") || s.includes("beauty")) {
    return { icon: Heart, bg: "#F3DEE3", textColor: "#4A2830" };
  }
  if (s.includes("home") || n.includes("home") || s.includes("living") || s.includes("furniture")) {
    return { icon: Home, bg: "#EFE0D2", textColor: "#4A3525" };
  }
  if (s.includes("sport") || n.includes("sport") || s.includes("outdoor")) {
    return { icon: Dumbbell, bg: "#D9E8E3", textColor: "#254035" };
  }
  if (s.includes("toy") || n.includes("toy") || s.includes("baby")) {
    return { icon: Baby, bg: "#F3E8DE", textColor: "#4A3828" };
  }
  if (s.includes("vehicle") || n.includes("vehicle") || s.includes("car")) {
    return { icon: Car, bg: "#DCE3EE", textColor: "#2A384A" };
  }
  if (s.includes("women") || n.includes("women")) {
    return { icon: Shirt, bg: "#F3E2EA", textColor: "#4A2538" };
  }
  if (s.includes("men") || n.includes("men")) {
    return { icon: User, bg: "#DCE8F3", textColor: "#25384A" };
  }

  return { icon: Tag, bg: "#EDEBF3", textColor: "#3A3350" };
}

export default function CategoryIconRow() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || searchParams.get("categorySlug") || "";
  const sortParam = searchParams.get("sort") || "";

  const { data: apiCategories = [], isLoading } = useGetCategoriesQuery();

  const categories =
    apiCategories && apiCategories.length > 0 ? apiCategories : FALLBACK_CATEGORIES;

  function buildCategoryHref(slug: string) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (sortParam) params.set("sort", sortParam);
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-6 pb-3 font-sans">
      <div className="flex items-start gap-4 overflow-x-auto scrollbar-none pb-2">
        {/* Recommend / All Products Item */}
        <Link
          href={buildCategoryHref("")}
          scroll={false}
          className="group flex flex-shrink-0 flex-col items-center gap-2"
          style={{ width: 88 }}
        >
          <div
            className={`flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-105 ${!activeCategory
                ? "bg-[#2D3A50] text-white shadow-md ring-2 ring-[#6C4CD8]/50"
                : "bg-[#EDEBF3] text-[#3A3350]"
              }`}
            style={{ width: 68, height: 68 }}
          >
            <LayoutGrid size={26} color={!activeCategory ? "#fff" : "#3A3350"} />
          </div>
          <span className={`text-center text-[13px] leading-tight ${!activeCategory ? "font-extrabold text-[#6C4CD8]" : "font-semibold text-[#3A3350]"}`}>
            Recommend
          </span>
        </Link>

        {/* Dynamic Real Categories List */}
        {isLoading && categories.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-xs font-semibold text-[#8B85A0]">
            <Loader2 size={16} className="animate-spin text-[#6C4CD8]" />
            <span>Loading categories...</span>
          </div>
        ) : (
          categories.map((c: any) => {
            const meta = getCategoryMeta(c.slug || "", c.name || "");
            const Icon = meta.icon;
            const isActive = activeCategory === c.slug;

            return (
              <Link
                key={c.uuid || c.slug || c.name}
                href={buildCategoryHref(c.slug || "")}
                scroll={false}
                className="group flex flex-shrink-0 flex-col items-center gap-2"
                style={{ width: 92 }}
              >
                <div
                  className={`flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-105 ${isActive
                      ? "ring-2 ring-[#6C4CD8] shadow-md scale-105"
                      : ""
                    }`}
                  style={{
                    width: 68,
                    height: 68,
                    background: isActive ? "#6C4CD8" : meta.bg,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  <Icon size={25} color={isActive ? "#fff" : meta.textColor} />
                </div>
                <span
                  className={`text-center text-[12.5px] leading-tight line-clamp-2 ${isActive
                      ? "font-extrabold text-[#6C4CD8]"
                      : "font-semibold text-[#3A3350]"
                    }`}
                >
                  {c.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
