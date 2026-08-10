"use client";

import { useState } from "react";
import Image from "next/image";
import type { ListingImage } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  images: ListingImage[];
  title: string;
};

export default function ProductGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primary = sorted.find((img) => img.is_primary) ?? sorted[0];
  const [selected, setSelected] = useState<ListingImage>(primary);

  if (!selected) {
    return (
      <div className="aspect-square w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* main image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={selected.url}
          alt={selected.alt_text ?? title}
          width={800}
          height={800}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              className={cn(
                "h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition",
                img.id === selected.id
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              )}
              aria-label={img.alt_text ?? `Image ${img.sort_order}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? ""}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
