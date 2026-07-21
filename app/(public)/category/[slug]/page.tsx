import { getCategories, buildCategoryTree, getCategoryBySlug } from "@/lib/api/categories";
import { getListings } from "@/lib/api/listings";
import ProductGrid from "@/components/product/ProductGrid";
import CategorySidebar from "@/components/category/CategorySidebar";
import { SortClientWrapper, PaginationWrapper } from "@/app/(public)/products/SortClientWrapper";
import type { ListingsQuery } from "@/lib/types";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  const categories = await getCategories();
  const tree = buildCategoryTree(categories);

  const query: ListingsQuery = {
    categoryId: category.id,
    sort: (sp.sort as ListingsQuery["sort"]) ?? "newest",
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
  };

  const { data: listings, page, totalPages } = await getListings(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex gap-8">
        {/* sidebar */}
        <aside className="hidden w-52 flex-shrink-0 lg:block">
          <CategorySidebar tree={tree} activeSlug={slug} />
        </aside>

        {/* content */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{category.name}</h1>
            <SortClientWrapper sort={query.sort ?? "newest"} />
          </div>

          <ProductGrid listings={listings} />

          <PaginationWrapper page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
