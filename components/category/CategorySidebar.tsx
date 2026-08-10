import Link from "next/link";
import type { CategoryNode } from "@/app/api/categories";
import { cn } from "@/lib/utils";

type Props = {
  tree: CategoryNode[];
  activeSlug?: string;
};

function CategoryItem({
  node,
  activeSlug,
  depth = 0,
}: {
  node: CategoryNode;
  activeSlug?: string;
  depth?: number;
}) {
  const isActive = node.slug === activeSlug;

  return (
    <li>
      <Link
        href={`/category/${node.slug}`}
        className={cn(
          "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-accent font-semibold text-accent-foreground"
            : "text-foreground",
          depth > 0 && "pl-7 text-xs text-muted-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {node.name}
      </Link>
      {node.children.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <CategoryItem
              key={child.id}
              node={child}
              activeSlug={activeSlug}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategorySidebar({ tree, activeSlug }: Props) {
  return (
    <nav aria-label="Categories" className="space-y-0.5">
      {/* All Products */}
      <Link
        href="/products"
        className={cn(
          "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          !activeSlug
            ? "bg-accent font-semibold text-accent-foreground"
            : "text-foreground"
        )}
      >
        All Products
      </Link>

      {tree.length > 0 ? (
        <ul className="space-y-0.5">
          {tree.map((node) => (
            <CategoryItem key={node.id} node={node} activeSlug={activeSlug} />
          ))}
        </ul>
      ) : (
        /* Static fallback matching the mockup exactly — shown until API is wired */
        <ul className="space-y-0.5">
          {[
            { label: "Electronic & Appliances", slug: "electronic-and-appliances" },
            { label: "House & Land", slug: "house-and-land" },
            { label: "Phone & Tablets", slug: "phone-and-tablets" },
            { label: "Furniture & Decor", slug: "furniture-and-decor" },
            { label: "Fashion & Beauty", slug: "fashion-and-beauty" },
            { label: "Computer & Accessories", slug: "computer-and-accessories" },
            { label: "Home & Kitchen", slug: "home-and-kitchen" },
            { label: "Bag & Accessories", slug: "bag-and-accessories" },
            { label: "Cars & Vehicles", slug: "cars-and-vehicles" },
          ].map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/category/${cat.slug}`}
                className={cn(
                  "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  activeSlug === cat.slug
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground"
                )}
                aria-current={activeSlug === cat.slug ? "page" : undefined}
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
