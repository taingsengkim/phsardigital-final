import Link from "next/link";
import Image from "next/image";
import type { MockProduct } from "@/lib/mock-products";
import { cn } from "@/lib/utils";
import SavedButton from "@/components/saved/SavedButton";

type Props = {
  product: MockProduct;
  className?: string;
};

export default function MockProductCard({ product, className }: Props) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* discount badge */}
      {product.discountPercent && (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
          -{product.discountPercent}%
        </span>
      )}

      {/* save button */}
      <SavedButton
        listingId={product.id}
        className="absolute right-2 top-2 z-10"
      />

      {/* image */}
      <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {/* silently fall back to placeholder */}}
          />
        </div>
      </Link>

      {/* card body */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-xs font-medium leading-snug hover:underline"
        >
          {product.title}
        </Link>

        {/* prices — original (strikethrough) then sale */}
        <div className="mt-0.5 flex flex-col">
          <span className="text-[11px] text-muted-foreground line-through">
            ${product.originalPrice.toFixed(2)}
          </span>
          <span className="text-sm font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5" aria-label={`${product.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "h-2.5 w-2.5",
                  i < product.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                )}
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            ( {product.reviewCount} )
          </span>
        </div>

        {/* store */}
        <p className="truncate text-[10px] text-muted-foreground">
          {product.storeName}
        </p>
      </div>
    </article>
  );
}
