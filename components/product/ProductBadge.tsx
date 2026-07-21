import { cn } from "@/lib/utils";
import type { ListingDiscount } from "@/lib/types";

type Props = {
  discounts?: ListingDiscount[];
  className?: string;
};

/** Picks the currently-active discount with the highest percent and renders a badge. */
export default function ProductBadge({ discounts, className }: Props) {
  if (!discounts || discounts.length === 0) return null;

  const now = Date.now();
  const active = discounts
    .filter(
      (d) =>
        new Date(d.starts_at).getTime() <= now &&
        new Date(d.ends_at).getTime() >= now
    )
    .sort((a, b) => b.discount_percent - a.discount_percent)[0];

  if (!active) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white",
        className
      )}
    >
      -{active.discount_percent}%
    </span>
  );
}
