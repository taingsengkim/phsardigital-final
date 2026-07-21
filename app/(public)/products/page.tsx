import { Suspense } from "react";
import CategorySidebar from "@/components/category/CategorySidebar";
import { SortClientWrapper } from "./SortClientWrapper";
import HeroBanner from "./HeroBanner";
import CategoryIconRow from "./CategoryIconRow";
import MockProductGrid from "@/components/product/MockProductGrid";
import StaticPagination from "./StaticPagination";
import type { CategoryNode } from "@/lib/api/categories";

/**
 * Static category tree used until your API is connected.
 * Replace with:  const categories = await getCategories();
 *                const tree = buildCategoryTree(categories);
 */
const STATIC_TREE: CategoryNode[] = [
  { id: 1, name: "Electronic & Appliances", slug: "electronic-and-appliances", parent_id: null, children: [] },
  { id: 2, name: "House & Land",            slug: "house-and-land",            parent_id: null, children: [] },
  { id: 3, name: "Phone & Tablets",         slug: "phone-and-tablets",         parent_id: null, children: [] },
  { id: 4, name: "Furniture & Decor",       slug: "furniture-and-decor",       parent_id: null, children: [] },
  { id: 5, name: "Fashion & Beauty",        slug: "fashion-and-beauty",        parent_id: null, children: [] },
  { id: 6, name: "Computer & Accessories",  slug: "computer-and-accessories",  parent_id: null, children: [] },
  { id: 7, name: "Home & Kitchen",          slug: "home-and-kitchen",          parent_id: null, children: [] },
  { id: 8, name: "Bag & Accessories",       slug: "bag-and-accessories",       parent_id: null, children: [] },
  { id: 9, name: "Cars & Vehicles",         slug: "cars-and-vehicles",         parent_id: null, children: [] },
];

const TOTAL_ITEMS = 17;
const PAGE_SIZE   = 10; // 10 shown per "page" in mock
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / PAGE_SIZE);

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const sort    = (params.sort ?? "newest") as "newest" | "price_asc" | "price_desc" | "top_rated";
  const page    = params.page ? Number(params.page) : 1;

  const start = (page - 1) * PAGE_SIZE + 1;
  const end   = Math.min(page * PAGE_SIZE, TOTAL_ITEMS);

  return (
    <>
      {/* ── hero ── */}
      <HeroBanner />

      {/* ── category icon row ── */}
      <CategoryIconRow />

      {/* ── main browse area ── */}
      <div className="bg-white mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">

          {/* sidebar */}
          <aside className="hidden w-48 flex-shrink-0 lg:block">
            <CategorySidebar tree={STATIC_TREE} />
          </aside>

          {/* content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                All PRODUCTS
              </h2>
              <Suspense>
                <SortClientWrapper sort={sort} />
              </Suspense>
            </div>

            {/* product grid — replace MockProductGrid with ProductGrid once API is ready */}
            <MockProductGrid />

            {/* count + pagination */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {start}–{end} of {TOTAL_ITEMS} item(s)
              </p>
              <Suspense>
                <StaticPagination page={page} totalPages={TOTAL_PAGES} />
              </Suspense>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
