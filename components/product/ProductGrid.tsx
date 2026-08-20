import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

type CardListing = {
  id?: number;
  uuid?: string;
  slug: string;
  title: string;
  price: number;
  images?: { uuid?: string; uri?: string; url?: string; isPrimary?: boolean; is_primary?: boolean }[];
  thumbnailUri?: { uri?: string };
};

type Props = {
  listings: CardListing[];
  className?: string;
};

export default function ProductGrid({ listings, className }: Props) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#8B85A0] gap-3">
        <span className="text-4xl">🛍️</span>
        <p className="text-[15px]">No products found.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
<<<<<<< HEAD
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
=======
        "grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5",
>>>>>>> origin/main
        className
      )}
    >
      {listings.map((listing) => (
        <ProductCard
          key={listing.uuid ?? String(listing.id ?? listing.slug)}
          listing={listing}
        />
      ))}
    </div>
  );
}
