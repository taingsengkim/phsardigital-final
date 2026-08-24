import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getListing, getProductDetail } from "@/app/api/productDetail";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import SellerPanel from "@/components/product/SellerPanel";
import ProductDetailTabs from "@/components/product/ProductDetailTabs";
import ProductRail from "@/components/product/ProductRail";
import { formatAddress } from "@/lib/maps";
import { getListingPrice } from "@/lib/api/listing-price";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    return { title: "Product not found · Phsar Digital" };
  }

  const title = listing.title ?? "Product";
  const description =
    listing.description?.slice(0, 160) ??
    `Buy ${title} on Phsar Digital, Cambodia's online marketplace.`;
  const image = listing.thumbnailUri?.uri ?? listing.images?.[0]?.uri;

  return {
    title: `${title} · Phsar Digital`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);

  if (!detail) notFound();

  const {
    listing,
    seller,
    storeListings,
    storeProductCount,
    reviews,
    reviewSummary,
    relatedListings,
  } = detail;

  const sellerId = listing.sellerProfile?.sellerId ?? seller?.id ?? null;
  // The listing now embeds the store name and logo, so the panel still reads
  // correctly even if the full seller-profile fetch fails.
  const sellerSummary = listing.sellerProfile;
  const sellerName =
    seller?.businessName?.trim() ||
    sellerSummary?.businessName?.trim() ||
    "Phsar Store";

  const categoryName = listing.category?.name ?? "Products";
  const categorySlug = listing.category?.slug ?? "";

  const breadcrumbTrail: { label: string; href: string | null }[] = [
    { label: "Home", href: "/home" },
    { label: "Products", href: "/products" },
    {
      label: categoryName,
      href: categorySlug ? `/products?categorySlug=${categorySlug}` : null,
    },
    { label: listing.title ?? "Product", href: null },
  ];

  /* structured data — lets search engines show price, stock and rating */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description ?? undefined,
    sku: listing.uuid,
    image: [listing.thumbnailUri?.uri, ...(listing.images ?? []).map((i) => i.uri)]
      .filter(Boolean)
      .slice(0, 5),
    category: listing.category?.name,
    brand: seller?.businessName
      ? { "@type": "Brand", name: seller.businessName }
      : undefined,
    offers: {
      "@type": "Offer",
      price: getListingPrice(listing),
      priceCurrency: "USD",
      availability:
        (listing.stockQty ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: seller?.businessName
        ? { "@type": "Organization", name: seller.businessName }
        : undefined,
    },
    aggregateRating:
      reviewSummary.average !== null && reviewSummary.total > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(reviewSummary.average.toFixed(1)),
            reviewCount: reviewSummary.total,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-[#F6F5FA] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="mx-auto max-w-[1240px] px-6 py-9">
        {/* ── breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[15px] text-[#8B85A0]">
            {breadcrumbTrail.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="shrink-0 opacity-50" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-[#6C4CD8]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="line-clamp-1 font-semibold text-[#1A1330]">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ── gallery + buy box ── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[480px_1fr]">
          <ProductGallery
            images={listing.images}
            thumbnailUri={listing.thumbnailUri}
            title={listing.title ?? "Product"}
            badge={listing.isFeatured ? "Featured" : null}
          />

          <ProductDetailClient
            listing={listing}
            reviewSummary={reviewSummary}
            sellerName={sellerName}
            sellerId={sellerId}
          />
        </div>

        {/* ── seller + real map ── */}
        <SellerPanel
          seller={seller}
          fallbackName={sellerName}
          fallbackLogoUri={sellerSummary?.logoUri}
          sellerId={sellerId}
          productCount={storeProductCount}
        />

        {/* ── details / reviews / shipping ── */}
        <ProductDetailTabs
          description={listing.description}
          attributes={listing.listingAttributes}
          reviews={reviews}
          reviewSummary={reviewSummary}
          sellerName={sellerName}
          storeCity={seller?.city || formatAddress(seller) || null}
        />

        {/* ── more from this store ── */}
        <ProductRail
          id="store-products-heading"
          eyebrow="From the same seller"
          heading={`More from ${sellerName}`}
          listings={storeListings}
          viewAllHref={sellerId ? `/stores/${sellerId}` : undefined}
          viewAllLabel="Visit store"
        />

        {/* ── related products ── */}
        <ProductRail
          id="related-heading"
          eyebrow="You might also like"
          heading="Recommended for you"
          related={relatedListings.filter(
            (item) => !storeListings.some((s) => s.uuid === item.uuid)
          )}
          viewAllHref={
            categorySlug
              ? `/products?categorySlug=${categorySlug}`
              : "/products"
          }
        />
      </div>
    </div>
  );
}
