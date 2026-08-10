import type { Category } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Fetch all categories (flat list — build tree client-side if needed).
 */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

/**
 * Fetch a single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const res = await fetch(`${BASE_URL}/api/categories/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Category not found: ${slug}`);
  return res.json();
}

/**
 * Build a parent → children tree from a flat list.
 */
export type CategoryNode = Category & { children: CategoryNode[] };

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

  const roots: CategoryNode[] = [];
  map.forEach((node) => {
    if (node.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parent_id);
      if (parent) parent.children.push(node);
    }
  });
  return roots;
}
