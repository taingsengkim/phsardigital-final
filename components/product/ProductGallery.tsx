"use client";

import { useState } from "react";
import Image from "next/image";
import type { ListingImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ZoomIn } from "lucide-react";

type Props = {
  images: ListingImage[];
  title: string;
};

export default function ProductGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primary = sorted.find((img) => img.is_primary) ?? sorted[0];
  const [selected, setSelected] = useState<ListingImage | undefined>(primary);
  const [zoomed, setZoomed] = useState(false);

  if (!selected) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-[#F5F3FA] flex items-center justify-center text-[#8B85A0] text-[15px]">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
      {/* ── main image ── */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3FA] cursor-zoom-in shadow-[0_4px_24px_rgba(108,76,216,0.10)]"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={selected.url}
          alt={selected.alt_text ?? title}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            "group-hover:scale-[1.06]"
          )}
          priority
          sizes="(max-width: 1024px) 100vw, 480px"
        />
        {/* zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 text-[13px] font-semibold text-[#6C4CD8] shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={14} />
          Zoom
        </div>
      </div>

      {/* ── thumbnails ── */}
      {sorted.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {sorted.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                img.id === selected.id
                  ? "border-[#6C4CD8] shadow-[0_0_0_3px_rgba(108,76,216,0.15)]"
                  : "border-transparent hover:border-[#C4B5FD]"
              )}
              aria-label={img.alt_text ?? `View image ${img.sort_order + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── lightbox overlay ── */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl">
            <Image
              src={selected.url}
              alt={selected.alt_text ?? title}
              width={900}
              height={900}
              className="object-contain"
            />
          </div>
          <button
            className="absolute right-6 top-6 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
            onClick={() => setZoomed(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
