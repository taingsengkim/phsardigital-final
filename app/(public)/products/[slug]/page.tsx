import { getListingBySlug } from "@/lib/api/listings";
import ProductGallery from "@/components/product/ProductGallery";
import ProductAttributes from "@/components/product/ProductAttributes";
import ProductBadge from "@/components/product/ProductBadge";
import RatingStars from "@/components/product/RatingStars";
import SavedButton from "@/components/saved/SavedButton";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

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

  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) /
        listing.reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* gallery */}
        <ProductGallery
          images={listing.images ?? []}
          title={listing.title}
        />

        {/* info */}
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold leading-tight">
                {listing.title}
              </h1>
              <SavedButton listingId={listing.id} />
            </div>

            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <RatingStars rating={avgRating} size={16} />
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} ({listing.reviews?.length} reviews)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">
              ${listing.price.toFixed(2)}
            </span>
            <ProductBadge discounts={listing.discounts} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {listing.description}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Buy Now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {listing.stock > 0
              ? `${listing.stock} in stock`
              : "Out of stock"}
          </p>

          {/* specs */}
          {listing.attributes && listing.attributes.length > 0 && (
            <ProductAttributes attributes={listing.attributes} />
          )}
        </div>
      </div>

      {/* reviews section */}
      {listing.reviews && listing.reviews.length > 0 && (
        <section className="mt-12" aria-labelledby="reviews-heading">
          <h2
            id="reviews-heading"
            className="mb-4 text-lg font-semibold"
          >
            Reviews ({listing.reviews.length})
          </h2>
          <div className="space-y-4">
            {listing.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border p-4 space-y-2"
              >
                <RatingStars rating={review.rating} />
                <p className="text-sm text-muted-foreground">{review.body}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
