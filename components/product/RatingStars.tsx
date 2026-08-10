import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number; // 0–5, supports decimals
  max?: number;
  size?: number;
  className?: string;
};

export default function RatingStars({
  rating,
  max = 5,
  size = 14,
  className,
}: Props) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {/* background star */}
            <Star
              size={size}
              className="text-muted-foreground/30 absolute inset-0"
              fill="currentColor"
              strokeWidth={0}
            />
            {/* filled portion */}
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : `${(rating % 1) * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-yellow-400"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
