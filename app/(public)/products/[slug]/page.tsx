import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getListingBySlug } from "@/app/api/listings";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import SellerPanel from "@/components/product/SellerPanel";
import ProductDetailTabs from "@/components/product/ProductDetailTabs";
import RelatedProducts from "@/components/product/RelatedProducts";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const listing = await getListingBySlug(slug).catch(() => null);
  if (!listing) notFound();

  const breadcrumb = [
    { label: "Home",     href: "/home" },
    { label: "Products", href: "/products" },
    ...(listing.category ? [{ label: listing.category.name, href: `/category/${listing.category.slug}` }] : []),
    { label: listing.title, href: null },
  ];

  return (
    <div className="min-h-screen bg-[#F6F5FA]">
      <div className="mx-auto max-w-[1240px] px-6 py-9">

        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-7">
          <ol className="flex flex-wrap items-center gap-1.5 text-[15px] text-[#8B85A0]">
            {breadcrumb.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="shrink-0 opacity-40" />}
                {c.href ? (
                  <Link href={c.href} className="transition hover:text-[#6C4CD8]">{c.label}</Link>
                ) : (
                  <span className="line-clamp-1 font-semibold text-[#1A1330]">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* gallery + info */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[480px_1fr]">
          <ProductGallery
            images={listing.images ?? []}
            thumbnail={listing.thumbnailUri}
            title={listing.title}
          />
          <ProductDetailClient listing={listing} />
        </div>

        {/* seller */}
        <SellerPanel seller={listing.sellerProfile} />

        {/* tabs: description + reviews */}
        <ProductDetailTabs
          description={listing.description ?? ""}
          attributes={listing.listingAttributes ?? []}
          listingUuid={listing.uuid}
        />

        {/* related */}
        <RelatedProducts
          categorySlug={listing.category?.slug}
          excludeUuid={listing.uuid}
        />

      </div>
    </div>
  );
}
