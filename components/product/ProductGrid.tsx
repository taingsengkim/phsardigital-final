import type { Listing } from "@/lib/types";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

type Props = {
  listings: Listing[];
  className?: string;
};

export default function ProductGrid({ listings, className }: Props) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
        <span className="text-4xl">🛍️</span>
        <p className="text-sm">No products found.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5",
        className
      )}
    >
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
