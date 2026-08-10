import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getListingBySlug } from "@/app/api/listings";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import SellerPanel from "@/components/product/SellerPanel";
import ProductDetailTabs from "@/components/product/ProductDetailTabs";
import RelatedProducts from "@/components/product/RelatedProducts";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let listing;
  try {
    listing = await getListingBySlug(slug);
  } catch {
    notFound();
  }

  /* ── breadcrumb segments ──────────────────────────────────────────── */
  // Category name isn't joined on the listing type yet; fall back gracefully.
  const breadcrumbTrail = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: listing.title, href: null },
  ];

  return (
    <div className="min-h-screen bg-[#f8f5ee]">
      <div className="mx-auto max-w-[1240px] px-6 py-9">

        {/* ── breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1 text-[12.5px] text-muted-foreground">
            {breadcrumbTrail.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight size={12} className="shrink-0 opacity-50" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#2a1c63] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#2a1c63] line-clamp-1">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ── gallery + detail — two columns on desktop ── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[440px_1fr]">
          {/* gallery */}
          <ProductGallery
            images={listing.images ?? []}
            title={listing.title}
          />

          {/* right-hand info panel (client interactive) */}
          <ProductDetailClient listing={listing} />
        </div>

        {/* ── seller panel ── */}
        <SellerPanel
          name="Van Shop"
          productCount={80}
          avgRating={4.8}
          yearsOnPlatform={3}
          city="Phnom Penh"
          cityKhmer="ភ្នំពេញ"
          address="Tuol Sangkae 2, Ruessei Kaev, Phnom Penh"
          storeHref="/stores/van-shop"
        />

        {/* ── detail / reviews tabs ── */}
        <ProductDetailTabs
          description={listing.description}
          attributes={listing.attributes}
          reviews={listing.reviews}
        />

        {/* ── related products ── */}
        <RelatedProducts
          categoryId={listing.category_id}
          excludeSlug={listing.slug}
        />

      </div>
    </div>
  );
}
