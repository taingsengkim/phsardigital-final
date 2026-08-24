/**
 * Category API — maps to /api/v1/categories
 * Real endpoints from: https://phsardigital.quizzy.it.com/swagger-ui/index.html
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://phsardigital.quizzy.it.com";

export type Category = {
  uuid: string;
  name: string;
  slug: string;
  iconUrl?: string;
  description?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  parentUuid?: string;
};

export type CategoryTree = Category & {
  children: CategoryTree[];
};

export type PagedCategories = {
  content: Category[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

/**
 * GET /api/v1/categories
 * Returns a paginated flat list of categories.
 */
export async function getCategories(pageNumber = 0, pageSize = 25): Promise<PagedCategories> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${BASE}/api/v1/categories?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`getCategories failed: ${res.status}`);
  return res.json();
}

/**
 * GET /api/v1/categories/tree
 * Returns the full category tree in one call.
 */
export async function getCategoryTree(): Promise<CategoryTree[]> {
  const res = await fetch(`${BASE}/api/v1/categories/tree`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`getCategoryTree failed: ${res.status}`);
  return res.json();
}

/**
 * GET /api/v1/categories/slug/{slug}
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const res = await fetch(`${BASE}/api/v1/categories/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`getCategoryBySlug failed: ${res.status}`);
  return res.json();
}

/**
 * GET /api/v1/categories/{uuid}
 */
export async function getCategoryByUuid(uuid: string): Promise<Category> {
  const res = await fetch(`${BASE}/api/v1/categories/${uuid}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`getCategoryByUuid failed: ${res.status}`);
  return res.json();
}

/**
 * GET /api/v1/categories/{uuid}/children
 */
export async function getCategoryChildren(uuid: string): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/v1/categories/${uuid}/children`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`getCategoryChildren failed: ${res.status}`);
  return res.json();
}
