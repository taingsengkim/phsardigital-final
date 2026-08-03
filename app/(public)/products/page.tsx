import HeroBanner from "./HeroBanner";
import CategoryIconRow from "./CategoryIconRow";
import ProductsClient from "./ProductsClient";
import Link from "next/link";

const SIDEBAR_CATS = [
  { label: "Electronic & Appliances", slug: "electronic-and-appliances" },
  { label: "House & Land",            slug: "house-and-land"            },
  { label: "Phone & Tablets",         slug: "phone-and-tablets"         },
  { label: "Furniture & Decor",       slug: "furniture-and-decor"       },
  { label: "Fashion & Beauty",        slug: "fashion-and-beauty"        },
  { label: "Computer & Accessories",  slug: "computer-and-accessories"  },
  { label: "Home & Kitchen",          slug: "home-and-kitchen"          },
  { label: "Bag & Accessories",       slug: "bag-and-accessories"       },
  { label: "Cars & Vehicles",         slug: "cars-and-vehicles"         },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; search?: string }>;
}) {
  await searchParams; // kept for future API use

  return (
    <div style={{ background: "#F6F5FA", minHeight: "100vh" }}>
      {/* hero + breadcrumb (has its own padding) */}
      <HeroBanner />

      {/* category avatar row */}
      <CategoryIconRow />

      {/* main 2-col layout */}
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "20px 24px 0",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* ── sidebar ── */}
        <aside
          className="hidden lg:block"
          style={{ width: 180, flexShrink: 0 }}
        >
          <nav>
            <Link
              href="/products"
              style={{
                display: "block",
                padding: "7px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#6C4CD8",
                background: "#F1EFFA",
                textDecoration: "none",
                marginBottom: 2,
              }}
            >
              All Products
            </Link>
            {SIDEBAR_CATS.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                style={{
                  display: "block",
                  padding: "7px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#3A3350",
                  textDecoration: "none",
                  marginBottom: 2,
                  transition: "background .12s",
                }}
                className="sidebar-link"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* ── product area (client component handles toggle, sort, pagination) ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ProductsClient />
        </div>
      </div>
    </div>
  );
}
